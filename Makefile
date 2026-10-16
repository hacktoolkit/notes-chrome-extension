.PHONY: help test check e2e dev dev-clean screenshots clean package
VERSION := $(shell node -p "require('./manifest.json').version")
NAME := $(shell node -p "require('./manifest.json').name.toLowerCase().replace(/[^a-z0-9]+/g,'_')")

## help - Display help about make targets for this Makefile
help:
	@cat Makefile | grep '^## ' --color=never | cut -c4- | sed -e "`printf 's/ - /\t- /;'`" | column -s "`printf '\t'`" -t

## test - run the unit tests
test:
	node --test

## check - syntax-check every script
check:
	@for f in src/*.js src/lib/*.js src/content/*.js scripts/*.mjs; do node --check $$f || exit 1; echo "ok $$f"; done

## e2e - run the browser end-to-end test in a fresh holodeck profile
e2e:
	node scripts/e2e.mjs

## dev - launch the holodeck (throwaway browser profile at ~/.holodeck) with the extension and sample tabs
dev:
	node scripts/dev.mjs

## dev-clean - end program: delete the holodeck browser profiles
dev-clean:
	rm -rf "$${HOLODECK:-$$HOME/.holodeck}"/brave "$${HOLODECK:-$$HOME/.holodeck}"/chromium "$${HOLODECK:-$$HOME/.holodeck}"/tmp

## clean - remove all build artifacts
clean:
	rm -f *.zip

## package - build <name>-<version>.zip for the Chrome Web Store
package: clean test
	zip -r -X $(NAME)-$(VERSION).zip `cat FILES` -x '*.DS_Store'

## screenshots - render README images and Chrome Web Store screenshots from the holodeck
screenshots:
	node scripts/screenshots.mjs
