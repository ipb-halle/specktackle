BUILDDIR = build
GENERATED_FILES = \
	$(BUILDDIR)/st.js \
	$(BUILDDIR)/st.min.js

#PREFIX = /cygdrive/c/Users/Stephan
PREFIX=.
	
all: $(GENERATED_FILES)

.PHONY: clean builddir all

$(BUILDDIR)/st.js: builddir js/st-start.js $(/bin/bash $(PREFIX)/node_modules/.bin/smash --ignore-missing --list js/st.js) package.json
	@rm -f $@
	npx smash js/st.js > $@
	@chmod a-w $@

$(BUILDDIR)/st.min.js: $(BUILDDIR)/st.js
	npx uglify-js $< -m -c > $@

js/st-start.js: package.json libs/start.js
	node libs/start.js > $@

builddir:
	mkdir -p $(BUILDDIR)

clean:
	rm -rf $(BUILDDIR)
