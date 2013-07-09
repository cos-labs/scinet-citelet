# Bundle JS files for bookmarklet and Chrome extension

all : seturl \
      js-src/_*.js \
      app/static/js/citelet.min.js \
      app/static/js/bookmarklet.js \
      chrome-ext/citelet.cat.js

# Minify src and contrib JS files and write to static/js
# Note: Order of JS files matters--must take _*.js files first, then 
# user-contributed files, then citelet.js
app/static/js/citelet.min.js : js-req/*.js js-src/_*.js js-contrib/*.js js-src/main.js
	python py-util/minify.py --wrap --minify --files $^ \
        > app/static/js/citelet.min.js

# Concatenate src and contrib JS files and write to chrome-ext
chrome-ext/citelet.cat.js : js-src/_*.js js-contrib/*.js
	python py-util/minify.py --files $^ > chrome-ext/citelet.cat.js 

# False dependency: Touch source files when utility files change
js-src/_*.js : py-util/minify.py js-util/wrapper.js
	touch js-src/_*.js

# Update files based on URL
seturl : FORCE
	sed s/__url__/`echo $$CITELET_BASE_URL`/ \
        js-src/._citelet.js > js-src/_citelet.js
	sed s/__url__/`echo $$CITELET_BASE_URL`/ \
        app/static/js/.bookmarklet.js \
        > app/static/js/bookmarklet.js
	sed s/__url__/`echo $$CITELET_BASE_URL | sed s/:.*//`/ \
        chrome-ext/.manifest.json \
        > chrome-ext/manifest.json
FORCE:
