# Bundle JS files for bookmarklet and Chrome extension

all : flask/static/js/citelet.min.js ext/citelet.cat.js

# Minify src and contrib JS files and write to static/js
# Note: Order of JS files matters--must take _*.js files first, then 
# user-contributed files, then citelet.js
flask/static/js/citelet.min.js : js-src/_*.js js-contrib/*.js js-src/main.js
	python py-util/minify.py --wrap --minify --files $^ > flask/static/js/citelet.min.js

# Concatenate src and contrib JS files and write to ext
ext/citelet.cat.js : js-src/_*.js js-contrib/*.js
	python py-util/minify.py --files $^ > ext/citelet.cat.js 

# False dependency: Touch source files when utility files change
js-src/_*.js : py-util/minify.py js-util/wrapper.js
	touch js-src/_*.js
