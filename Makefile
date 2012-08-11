REPORTER = spec

test: 
	mocha \
		--reporter $(REPORTER) \
		test/sort.js

		
.PHONY: test