sources := $(shell find ./lib -name "*.js")

test:
	@./node_modules/.bin/mocha

validate:
	@./node_modules/.bin/jshint ${sources}

.PHONY: test
