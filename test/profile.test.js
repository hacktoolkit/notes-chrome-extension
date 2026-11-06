import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { analyzeProfile, diffLines, diffProfiles, extractorFor, fmtDate, groupByEmployer, parseDateRange, parseDuration, parseLinkedInProfile } from '../src/lib/profile.js';

const fx = (n) => readFileSync(new URL(`./fixtures/${n}`, import.meta.url), 'utf8');
const NOW = new Date('2026-10-11T00:00:00Z');

test('parseDateRange handles the formats LinkedIn renders', () => {
    assert.deepEqual(parseDateRange('Jan 2020 - Present · 4 yrs 9 mos'), { start: { y: 2020, m: 0 }, end: null, note: '4 yrs 9 mos' });
    assert.deepEqual(parseDateRange('Mar 2018 – Dec 2019'), { start: { y: 2018, m: 2 }, end: { y: 2019, m: 11 }, note: '' });
    assert.deepEqual(parseDateRange('2019 - 2021'), { start: { y: 2019, m: null }, end: { y: 2021, m: null }, note: '' });
    assert.deepEqual(parseDateRange('Sept 2021 - Jun 2022 · 10 mos').start, { y: 2021, m: 8 });
    assert.equal(parseDateRange('Senior Engineer'), null);
    assert.equal(parseDuration('4 yrs 9 mos'), 57);
    assert.equal(parseDuration('2 mos'), 2);
    assert.equal(parseDuration('nope'), null);
    assert.equal(fmtDate({ y: 2020, m: 0 }), 'Jan 2020');
    assert.equal(fmtDate({ y: 2020, m: null }), '2020');
    assert.equal(fmtDate(null), 'Present');
});

test('parses a profile with flat and grouped positions', () => {
    const p = parseLinkedInProfile(fx('linkedin-overlap.txt'));
    assert.equal(p.name, 'Jane Doe');
    assert.equal(p.headline, 'Head of Things at Acme | ex-Globex');
    assert.equal(p.location, 'San Francisco, California, United States');
    assert.ok(p.parsed);
    const roles = p.experience.map((e) => `${e.title}@${e.company}|${e.type}|${fmtDate(e.start)}-${fmtDate(e.end)}`);
    assert.deepEqual(roles, [
        'Head of Things@Acme Corp|Full-time|Mar 2023-Present',
        'Senior Engineer@Globex|Full-time|Jan 2021-Feb 2025',
        'Engineer@Globex|Full-time|Nov 2020-Dec 2020',
        'Consultant@Initech|Contract|Jun 2024-Present',
        'Analyst@Umbrella Co|Full-time|Feb 2016-Sep 2016'
    ]);
    assert.equal(p.experience[0].location, 'San Francisco Bay Area · Hybrid');
    assert.equal(p.experience[1].location, 'Remote');
    assert.equal(p.education.length, 1);
    assert.equal(p.education[0].school, 'Stanford University');
    assert.equal(p.education[0].degree, 'Bachelor of Science - BS, Computer Science');
});

test('analysis flags concurrent full-time roles, short stints and gaps, and builds the card line', () => {
    const p = parseLinkedInProfile(fx('linkedin-overlap.txt'));
    const { findings, summary } = analyzeProfile(p, NOW);
    const codes = findings.map((f) => f.code);
    assert.ok(codes.includes('overlap'), codes.join(','));
    const overlap = findings.find((f) => f.code === 'overlap');
    assert.match(overlap.text, /Head of Things at Acme Corp .* overlaps Senior Engineer at Globex .* by about 24 months/);
    assert.equal(overlap.level, 'ask');
    // the Initech contract is not full-time, so it is not an overlap finding
    assert.ok(!findings.some((f) => f.text.includes('Initech')));
    assert.ok(findings.some((f) => f.code === 'short' && f.text.startsWith('Umbrella Co')));
    assert.ok(findings.some((f) => f.code === 'gap' && /Umbrella Co and Globex/.test(f.text)));
    assert.equal(summary.employers, 4);
    assert.equal(summary.currentRoles, 2);
    assert.match(summary.card, /^\d+(\.\d)? yrs, avg tenure [\d.]+ yrs; Acme Corp: Head of Things, 2023–present; Globex: Engineer → Senior Engineer, 2020–2025; Initech: Consultant, 2024–present; Umbrella Co: Analyst, 2016–2016$/);
});

test('a clean profile with a promotion produces no asks', () => {
    const p = parseLinkedInProfile(fx('linkedin-clean.txt'));
    assert.equal(p.experience.length, 3);
    const { findings, summary } = analyzeProfile(p, NOW);
    assert.deepEqual(findings.filter((f) => f.level === 'ask'), []);
    assert.equal(summary.employers, 2);
    assert.match(summary.card, /Dataro: Customer Success Engineer → Senior Customer Success Engineer, 2024–present; Hooli: Support Engineer, 2020–2024/);
    const groups = groupByEmployer(p.experience);
    assert.equal(groups[0].roles.length, 2);
});

test('impossible range and two current full-time roles', () => {
    const text = `X\nY\nExperience\nA\nOne · Full-time\nJan 2024 - Present · 2 yrs\nB\nTwo · Full-time\nMar 2025 - Present · 1 yr\nC\nThree · Full-time\nMay 2020 - Jan 2019 · 1 yr\n`;
    const { findings } = analyzeProfile(parseLinkedInProfile(text), NOW);
    assert.ok(findings.some((f) => f.code === 'concurrent-present'));
    assert.ok(findings.some((f) => f.code === 'range'));
});

test('diffProfiles reports edited dates, added and removed roles', () => {
    const before = parseLinkedInProfile(fx('linkedin-overlap.txt'));
    const after = parseLinkedInProfile(fx('linkedin-overlap.txt').replace('Jan 2021 - Feb 2025 · 4 yrs 2 mos', 'Jan 2021 - Feb 2023 · 2 yrs 2 mos').replace('Analyst\nUmbrella Co · Full-time\nFeb 2016 - Sep 2016 · 8 mos\nChicago, Illinois, United States\n', '').replace('ex-Globex', 'ex-Globex, advisor'));
    const changes = diffProfiles(before, after);
    const codes = changes.map((c) => c.code).sort();
    assert.deepEqual(codes, ['dates', 'headline', 'removed']);
    assert.match(changes.find((c) => c.code === 'dates').text, /Senior Engineer at Globex: dates were Jan 2021–Feb 2025, now Jan 2021–Feb 2023/);
    assert.deepEqual(diffProfiles(null, after), []);
});

test('diffLines and extractorFor', () => {
    const d = diffLines('a\nb\nc', 'a\nc\nd');
    assert.deepEqual(d, { removed: ['b'], added: ['d'], same: 2 });
    assert.equal(extractorFor('LinkedIn profile'), parseLinkedInProfile);
    assert.equal(extractorFor('GitHub pull request'), null);
});

test('duplicated lines (visible + hidden copies) parse the same as clean text', () => {
    const clean = fx('linkedin-overlap.txt');
    const doubled = clean.split('\n').flatMap((l) => (l ? [l, l] : [l])).join('\n');
    const a = parseLinkedInProfile(clean);
    const b = parseLinkedInProfile(doubled);
    assert.deepEqual(b.experience, a.experience);
    assert.equal(b.name, a.name);
    assert.equal(b.education.length, a.education.length);
});

test('truncated capture and stated years are surfaced as findings', () => {
    const p = parseLinkedInProfile(fx('linkedin-overlap.txt'));
    assert.equal(p.listedExperiences, 7);
    const { findings } = analyzeProfile(p, NOW);
    const t = findings.find((f) => f.code === 'truncated');
    assert.ok(t && /7 experiences listed, 5 captured/.test(t.text), t?.text);
    // a claim is only checked when the history is complete
    assert.ok(!findings.some((f) => f.code === 'claim'));
    const claimed = `Sam Example\nEngineer with 15+ years of experience\nExperience\nEngineer\nHooli · Full-time\nJan 2020 - Present · 6 yrs\n`;
    const q = parseLinkedInProfile(claimed);
    assert.equal(q.claimedYears, 15);
    const r = analyzeProfile(q, NOW);
    const c = r.findings.find((f) => f.code === 'claim');
    assert.ok(c && /States 15\+ years .* covers about 6\.\d|covers about 6/.test(c.text), c?.text);
});

test('varied formatting: self-employed, no employment type, lowercase present, en dashes, internship', () => {
    const p = parseLinkedInProfile(fx('linkedin-varied.txt'));
    assert.equal(p.name, 'Alex Example');
    assert.equal(p.location, 'Austin, Texas, United States');
    const roles = p.experience.map((e) => `${e.title}@${e.company}|${e.type || '-'}|${fmtDate(e.start)}-${fmtDate(e.end)}`);
    assert.deepEqual(roles, [
        'Founder & CEO@Example Labs|Self-employed|Jun 2022-Present',
        'Advisor@Startup Collective|-|2021-2023',
        'Director of Data@Globex|Full-time|Jan 2019-May 2022',
        'Data Engineer@Globex|Full-time|Mar 2016-Dec 2018',
        'Data Analyst@Initech|Internship|Jun 2015-Aug 2015'
    ]);
    assert.equal(p.education.length, 1);
    assert.equal(p.education[0].school, 'University of Texas at Austin');
    assert.equal(p.education[0].degree, '');
    assert.equal(p.listedExperiences, null);
    const { findings, summary } = analyzeProfile(p, NOW);
    // the Advisor role has no type and overlaps the Globex and Example Labs years,
    // but Self-employed and untyped-vs-full-time are flagged only when both are full-time
    const asks = findings.filter((f) => f.level === 'ask').map((f) => f.code);
    assert.deepEqual(asks.filter((c) => c === 'overlap'), ['overlap']);
    assert.match(findings.find((f) => f.code === 'overlap').text, /Advisor at Startup Collective .* overlaps Director of Data at Globex/);
    assert.equal(summary.employers, 4);
    assert.ok(summary.years >= 10, String(summary.years));
});

test('captureBudget is larger for pages with a parser', async () => {
    const { captureBudget } = await import('../src/lib/profile.js');
    assert.equal(captureBudget('LinkedIn profile'), 40000);
    assert.equal(captureBudget('GitHub pull request'), 6000);
    assert.equal(captureBudget(null), 6000);
});
