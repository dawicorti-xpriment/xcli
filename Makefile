sources := $(shell find ./lib -name "*.js")

nyan-test:
	@./node_modules/.bin/mocha --recursive -R nyan 2>/dev/null

test:
	@./node_modules/.bin/mocha --recursive ${test_options}

validate:
	@./node_modules/.bin/jshint ${sources}

.PHONY: test
