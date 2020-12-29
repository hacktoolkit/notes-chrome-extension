## help - Display help about make targets for this Makefile
help:
	@cat Makefile | grep '^## ' --color=never | cut -c4- | sed -e "`printf 's/ - /\t- /;'`" | column -s "`printf '\t'`" -t

## install - install dependency packages
install:
	cd app && yarn install

## clean - clean previous builds
clean:
	rm -rf app/out/*
	rm -rf src

## build - build the app for release
build: clean install
	cd app && yarn build
	mv app/out src
