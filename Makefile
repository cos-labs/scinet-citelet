# Bundle JS files for bookmarklet and Chrome extension

all : server/static/js/citelet.min.js ext/citelet.cat.js \
      js-src/_citelet.js ext/manifest.json server/static/js/bookmarklet.js

# Minify src and contrib JS files and write to static/js
# Note: Order of JS files matters--must take _*.js files first, then 
# user-contributed files, then citelet.js
server/static/js/citelet.min.js : js-src/_*.js js-contrib/*.js js-src/main.js
	python py-util/minify.py --wrap --minify --files $^ > server/static/js/citelet.min.js

# Concatenate src and contrib JS files and write to ext
ext/citelet.cat.js : js-src/_*.js js-contrib/*.js
	python py-util/minify.py --files $^ > ext/citelet.cat.js 

# False dependency: Touch source files when utility files change
js-src/_%.js : py-util/minify.py js-util/wrapper.js
	touch js-src/_*.js

# Update URL in extension manifest
ext/manifest.json : url
	sed s/__url__/`sed s/:.*// url`/ ext/.manifest.json > ext/manifest.json

# Update URL in _citelet
js-src/_citelet.js : url
	sed s/__url__/`cat url`/ js-src/._citelet.js > js-src/_citelet.js

# Update URL in _citelet
server/static/js/bookmarklet.js : url
	sed s/__url__/`cat url`/ server/static/js/.bookmarklet.js \
        > server/static/js/bookmarklet.js
