# Minify src and contrib JS files and write to static/js
# Note: Order of JS files matters--must take _*.js files first, then 
# user-contributed files, then citelet.js

static/js/citelet.min.js : js-src/_*.js js-contrib/*.js js-src/citelet.js
	python minify.py $^ > static/js/citelet.min.js
