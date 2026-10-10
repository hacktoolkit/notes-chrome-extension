// Pure profile intelligence: parse a captured page's text into a structured
// work history, then analyse it for things a careful reader would ask about.
// Nothing here is a verdict. Findings are phrased as questions and labelled
// "info" or "ask", never as conclusions about a person. No Chrome APIs.

const MONTHS = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, sept: 8, oct: 9, nov: 10, dec: 11 };
const MONTH_RE = '(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\\.?';
// "Jan 2020 - Present · 4 yrs 9 mos", "2019 - 2021", "Mar 2018 – Dec 2019"
const RANGE_RE = new RegExp(`^(?:(${MONTH_RE})\\s+)?(\\d{4})\\s*[-–—]\\s*(?:(present|current|now)|(?:(${MONTH_RE})\\s+)?(\\d{4}))(?:\\s*[·•]\\s*(.+))?$`, 'i');
const DURATION_RE = /^(?:(\d+)\s*yrs?)?\s*(?:(\d+)\s*mos?)?$/i;
const EMPLOYMENT_TYPES = ['full-time', 'part-time', 'self-employed', 'freelance', 'contract', 'internship', 'apprenticeship', 'seasonal', 'temporary'];
const SECTION_HEADINGS = ['about', 'activity', 'experience', 'education', 'licenses & certifications', 'licenses and certifications', 'projects', 'skills', 'courses', 'honors & awards', 'honors and awards', 'languages', 'volunteering', 'publications', 'recommendations', 'interests', 'organizations', 'patents', 'test scores', 'causes'];
const NOISE_RE = /^(show all \d+ .*|…see more|see more|…|·|\d+ (followers|connections)|\d+ mutual connections?|helped me get this job|skills:.*|\d+ endorsements?)$/i;

export function parseMonth(s) {
    if (!s) return null;
    const m = MONTHS[s.toLowerCase().replace('.', '').slice(0, 4)] ?? MONTHS[s.toLowerCase().replace('.', '').slice(0, 3)];
    return m === undefined ? null : m;
}

// Returns { start: {y, m|null}, end: {y, m|null} | null (present), note }
export function parseDateRange(line) {
    const m = RANGE_RE.exec(line.trim());
    if (!m) return null;
    const start = { y: Number(m[2]), m: parseMonth(m[1]) };
    const end = m[3] ? null : { y: Number(m[5]), m: parseMonth(m[4]) };
    return { start, end, note: (m[6] || '').trim() };
}

export function parseDuration(s) {
    const m = DURATION_RE.exec((s || '').trim());
    if (!m || (!m[1] && !m[2])) return null;
    return (Number(m[1] || 0) * 12) + Number(m[2] || 0);
}

// Month index for comparisons; unknown months are treated as January for a
// start and December for an end, which is the generous reading.
export function monthIndex(d, { asEnd = false } = {}) {
    if (!d) return null;
    return d.y * 12 + (d.m ?? (asEnd ? 11 : 0));
}

export function fmtDate(d) {
    if (!d) return 'Present';
    const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return d.m === null || d.m === undefined ? String(d.y) : `${names[d.m]} ${d.y}`;
}

function cleanLines(text) {
    return text
        .replace(/\r/g, '')
        .split('\n')
        .map((l) => l.replace(/\s+/g, ' ').trim())
        .filter((l) => l && !NOISE_RE.test(l));
}

// Slices a named section out of the line list: from the heading line to the
// next known heading.
export function sectionLines(lines, name) {
    const lower = lines.map((l) => l.toLowerCase());
    const start = lower.indexOf(name.toLowerCase());
    if (start < 0) return [];
    let end = lines.length;
    for (let i = start + 1; i < lines.length; i++) {
        if (SECTION_HEADINGS.includes(lower[i]) && lower[i] !== name.toLowerCase()) { end = i; break; }
    }
    return lines.slice(start + 1, end);
}

function splitCompanyLine(line) {
    // "Acme Corp · Full-time" or "Acme Corp" or "Full-time · 5 yrs 2 mos"
    const parts = line.split(/\s*[·•]\s*/);
    const type = parts.find((p) => EMPLOYMENT_TYPES.includes(p.toLowerCase())) || null;
    const rest = parts.filter((p) => p !== type);
    return { type, rest };
}

// Parses the Experience section. Handles both flat positions
//   Title / Company · Type / Range · Duration / Location
// and grouped positions under one employer
//   Company / Type · Duration / Title / Range / Location / Title / Range ...
export function parseExperience(lines) {
    const positions = [];
    let i = 0;
    while (i < lines.length) {
        const a = lines[i];
        const b = lines[i + 1] || '';
        const c = lines[i + 2] || '';
        const rangeAtC = parseDateRange(c);
        const rangeAtB = parseDateRange(b);
        if (rangeAtC && !parseDateRange(a) && !rangeAtB) {
            // flat: a=title, b=company·type, c=range
            const { type, rest } = splitCompanyLine(b);
            const pos = { title: a, company: rest[0] || '', type, ...rangeAtC, duration: parseDuration(rangeAtC.note), location: '' };
            i += 3;
            if (lines[i] && !parseDateRange(lines[i]) && !parseDateRange(lines[i + 1] || '') && /,|remote|hybrid|on-site/i.test(lines[i]) && !parseDateRange(lines[i + 2] || '')) {
                pos.location = lines[i];
                i += 1;
            }
            positions.push(pos);
            continue;
        }
        const bParts = splitCompanyLine(b);
        const groupedHeader = !parseDateRange(a) && !rangeAtB && bParts.type && bParts.rest.every((p) => parseDuration(p) !== null || p === '') && parseDateRange(c) === null && lines[i + 3] && parseDateRange(lines[i + 3]);
        if (groupedHeader) {
            // grouped: a=company, b=type·duration, then (title, range[, location])*
            const company = a;
            const type = bParts.type;
            i += 2;
            while (i < lines.length) {
                const t = lines[i];
                const r = parseDateRange(lines[i + 1] || '');
                if (!r || parseDateRange(t)) break;
                const pos = { title: t, company, type, ...r, duration: parseDuration(r.note), location: '' };
                i += 2;
                if (lines[i] && !parseDateRange(lines[i]) && !parseDateRange(lines[i + 1] || '') && /,|remote|hybrid|on-site/i.test(lines[i])) {
                    pos.location = lines[i];
                    i += 1;
                }
                positions.push(pos);
                // next grouped role starts with a title followed by a range; a
                // new employer block starts with company then type·duration
                const nb = splitCompanyLine(lines[i + 1] || '');
                if (nb.type && !parseDateRange(lines[i + 1] || '') && nb.rest.every((p) => parseDuration(p) !== null || p === '')) break;
            }
            continue;
        }
        i += 1;
    }
    return positions;
}

export function parseEducation(lines) {
    const out = [];
    for (let i = 0; i < lines.length; i++) {
        const r = parseDateRange(lines[i]);
        if (r && i >= 1) {
            const degree = i >= 2 && !parseDateRange(lines[i - 2]) && !SECTION_HEADINGS.includes(lines[i - 2].toLowerCase()) ? lines[i - 1] : '';
            const school = degree ? lines[i - 2] : lines[i - 1];
            out.push({ school, degree, start: r.start, end: r.end });
        }
    }
    return out;
}

// Full LinkedIn profile parse from captured innerText. Tolerant: anything it
// cannot read is simply absent.
export function parseLinkedInProfile(text) {
    const lines = cleanLines(text || '');
    const expIdx = lines.findIndex((l) => l.toLowerCase() === 'experience');
    const name = lines[0] && lines[0].length < 80 ? lines[0] : '';
    const headline = lines[1] && lines[1].length < 200 && lines[1].toLowerCase() !== 'about' ? lines[1] : '';
    const location = lines.slice(0, 6).find((l) => /,\s*[A-Za-z ]+$/.test(l) && !l.includes('·') && l !== name && l !== headline) || '';
    const experience = parseExperience(sectionLines(lines, 'Experience'));
    const education = parseEducation(sectionLines(lines, 'Education'));
    return { kind: 'linkedin-profile', name, headline, location, experience, education, parsed: expIdx >= 0 };
}

// ----- analysis ------------------------------------------------------------

const FULL_TIME = (p) => !p.type || p.type.toLowerCase() === 'full-time';

function overlapMonths(a, b) {
    const s = Math.max(monthIndex(a.start), monthIndex(b.start));
    const e = Math.min(a.end ? monthIndex(a.end, { asEnd: true }) : Infinity, b.end ? monthIndex(b.end, { asEnd: true }) : Infinity);
    return e - s + 1;
}

function tenureMonths(p, now) {
    const s = monthIndex(p.start);
    const e = p.end ? monthIndex(p.end, { asEnd: true }) : now.getFullYear() * 12 + now.getMonth();
    return Math.max(0, e - s + 1);
}

// Groups consecutive roles at one employer (promotions) into stints.
export function groupByEmployer(positions) {
    const groups = [];
    for (const p of positions) {
        const key = (p.company || '').toLowerCase();
        const last = groups[groups.length - 1];
        if (last && last.key === key) last.roles.push(p);
        else groups.push({ key, company: p.company, roles: [p] });
    }
    return groups.map((g) => {
        const starts = g.roles.map((r) => monthIndex(r.start)).filter((x) => x !== null);
        const ends = g.roles.map((r) => (r.end ? monthIndex(r.end, { asEnd: true }) : Infinity));
        return { ...g, start: Math.min(...starts), end: Math.max(...ends), current: g.roles.some((r) => !r.end) };
    });
}

export function analyzeProfile(profile, now = new Date()) {
    const findings = [];
    const positions = (profile.experience || []).filter((p) => p.start);
    if (positions.length === 0) {
        return { findings, summary: null };
    }
    const nowIdx = now.getFullYear() * 12 + now.getMonth();

    // 1. impossible ranges
    for (const p of positions) {
        if (p.end && monthIndex(p.end, { asEnd: true }) < monthIndex(p.start)) {
            findings.push({ level: 'ask', code: 'range', text: `${p.title} at ${p.company} ends (${fmtDate(p.end)}) before it starts (${fmtDate(p.start)}).` });
        }
        if (monthIndex(p.start) > nowIdx) {
            findings.push({ level: 'ask', code: 'future', text: `${p.title} at ${p.company} starts in the future (${fmtDate(p.start)}).` });
        }
    }

    // 2. concurrent full-time roles at different employers
    const ft = positions.filter(FULL_TIME);
    for (let i = 0; i < ft.length; i++) {
        for (let j = i + 1; j < ft.length; j++) {
            const a = ft[i], b = ft[j];
            if ((a.company || '').toLowerCase() === (b.company || '').toLowerCase()) continue;
            const o = overlapMonths(a, b);
            if (o >= 2) {
                const both = !a.end && !b.end;
                findings.push({
                    level: 'ask',
                    code: both ? 'concurrent-present' : 'overlap',
                    text: both
                        ? `Two current full-time roles: ${a.title} at ${a.company} and ${b.title} at ${b.company}. Ask which is active and what continues.`
                        : `${a.title} at ${a.company} (${fmtDate(a.start)}–${fmtDate(a.end)}) overlaps ${b.title} at ${b.company} (${fmtDate(b.start)}–${fmtDate(b.end)}) by about ${o} months. Ask about employment type and transition dates.`
                });
            }
        }
    }

    // 3. tenure, gaps, totals on employer groups
    // page order: LinkedIn lists newest first, and the card keeps that order
    const groups = groupByEmployer(positions);
    const chrono = [...groups].sort((a, b) => a.start - b.start);
    for (const g of chrono) {
        const months = (g.current ? nowIdx : g.end) - g.start + 1;
        if (months < 12 && !g.current) {
            findings.push({ level: 'info', code: 'short', text: `${g.company}: about ${months} months.` });
        }
    }
    for (let i = 1; i < chrono.length; i++) {
        const prev = chrono[i - 1];
        const gap = chrono[i].start - prev.end - 1;
        if (prev.end !== Infinity && gap >= 6) {
            findings.push({ level: 'info', code: 'gap', text: `About ${gap} months between ${prev.company} and ${chrono[i].company}.` });
        }
    }

    // total experience, non-overlapping months
    const covered = new Set();
    for (const p of positions) {
        const s = monthIndex(p.start);
        const e = p.end ? monthIndex(p.end, { asEnd: true }) : nowIdx;
        for (let m = s; m <= Math.min(e, nowIdx); m++) covered.add(m);
    }
    const totalMonths = covered.size;
    const completed = groups.filter((g) => !g.current);
    const avgTenure = groups.length ? Math.round(groups.reduce((n, g) => n + ((g.current ? nowIdx : g.end) - g.start + 1), 0) / groups.length) : 0;

    // the one-line card: "Company (Title; Title, 2019–2022); Company (Title, 2022–present)"
    const card = groups.map((g) => {
        // promotions read chronologically: Engineer → Senior Engineer
        const titles = [...new Set([...g.roles].sort((a, b) => monthIndex(a.start) - monthIndex(b.start)).map((r) => r.title))].join(' → ');
        const first = g.roles.reduce((a, r) => (monthIndex(r.start) < monthIndex(a.start) ? r : a));
        const span = `${first.start.y}–${g.current ? 'present' : Math.floor(g.end / 12)}`;
        return `${g.company}: ${titles}, ${span}`;
    }).join('; ');

    const summary = {
        years: Math.round((totalMonths / 12) * 10) / 10,
        employers: groups.length,
        averageTenureMonths: avgTenure,
        completedStints: completed.length,
        currentRoles: positions.filter((p) => !p.end).length,
        card: `${Math.round((totalMonths / 12) * 10) / 10} yrs, avg tenure ${Math.round(avgTenure / 12 * 10) / 10} yrs; ${card}`
    };
    return { findings, summary };
}

// ----- change detection between two parses ----------------------------------

function roleKey(p) {
    return `${(p.company || '').toLowerCase()}|${(p.title || '').toLowerCase()}`;
}

// Compares an older parse with a newer one and reports edits to the history:
// changed dates, added or removed roles, changed headline. This is the signal
// that a profile was edited between two visits.
export function diffProfiles(older, newer) {
    const changes = [];
    if (!older || !newer) return changes;
    if (older.headline && newer.headline && older.headline !== newer.headline) {
        changes.push({ code: 'headline', text: `Headline changed from "${older.headline}" to "${newer.headline}".` });
    }
    const a = new Map((older.experience || []).map((p) => [roleKey(p), p]));
    const b = new Map((newer.experience || []).map((p) => [roleKey(p), p]));
    for (const [k, p] of a) {
        const q = b.get(k);
        if (!q) { changes.push({ code: 'removed', text: `Removed: ${p.title} at ${p.company} (${fmtDate(p.start)}–${fmtDate(p.end)}).` }); continue; }
        const dates = (x) => `${fmtDate(x.start)}–${fmtDate(x.end)}`;
        if (dates(p) !== dates(q)) changes.push({ code: 'dates', text: `${p.title} at ${p.company}: dates were ${dates(p)}, now ${dates(q)}.` });
        if ((p.type || '') !== (q.type || '') && (p.type || q.type)) changes.push({ code: 'type', text: `${p.title} at ${p.company}: employment type changed from ${p.type || 'unspecified'} to ${q.type || 'unspecified'}.` });
    }
    for (const [k, q] of b) {
        if (!a.has(k)) changes.push({ code: 'added', text: `Added: ${q.title} at ${q.company} (${fmtDate(q.start)}–${fmtDate(q.end)}).` });
    }
    return changes;
}

// ----- generic text diff for any page ---------------------------------------

export function diffLines(oldText, newText) {
    const a = cleanLines(oldText || '');
    const b = cleanLines(newText || '');
    const setA = new Set(a);
    const setB = new Set(b);
    return {
        removed: a.filter((l) => !setB.has(l)),
        added: b.filter((l) => !setA.has(l)),
        same: a.filter((l) => setB.has(l)).length
    };
}

// Which extractor applies to a page, by rule name.
export function extractorFor(ruleName) {
    if (ruleName === 'LinkedIn profile') return parseLinkedInProfile;
    return null;
}
