sources := $(shell find ./lib -name "*.js")

test:
	@./node_modules/.bin/mocha -A

validate:
	@./node_modules/.bin/jshint ${sources}


.PHONY: test
