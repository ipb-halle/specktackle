BUILDDIR = build
GENERATED_FILES = \
	$(BUILDDIR)/st.js \
	$(BUILDDIR)/st.min.js

#PREFIX = /cygdrive/c/Users/Stephan
PREFIX=.
	
all: builddir $(GENERATED_FILES)

.PHONY: clean builddir all

builddir:
	mkdir -p $(BUILDDIR)

js/st-start.js: package.json libs/start.js
	node libs/start.js > $@

build/st.js: $(/bin/bash $(PREFIX)/node_modules/.bin/smash --ignore-missing --list js/st.js) package.json
	@rm -f $@
	$(PREFIX)/node_modules/.bin/smash js/st.js > $@
	@chmod a-w $@

build/st.min.js: st.js libs/uglify.js
	@rm -f $@
	@node libs/uglify.js $< > $@

clean:
	rm -rf $(BUILDDIR)
