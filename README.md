# Citelet

## About:

Tools for extracting citation meta-data from HTML articles viewed in the browser. A browser bookmarklet and Chrome extension are currently available; Firefox and Safari extensions are in the works.

## Organization:

* js-cfg: Configuration for JS modules
* js-src: Base modules for extracting article meta-data
* js-contrib: Publisher-specific modules for extracting article meta-data
* js-util: Miscellaneous JS utility functions
* py-util: Miscellaneous Python utility functions
* app: Flask app
* chrome-ext: Chrome extension

## How to run Citelet from localhost:

* Setup cfg.py
    * CITELET_BASE_URL='http://localhost:5000/'
* Prepare files
    * fab clean
    * fab deploy
* Start a mongod instance
    * mongod
* Start a Flask server:
    * python app/main.py

### Using the bookmarklet:

* Browse to the bookmarklet page
    * http://localhost:5000/
* Drag the bookmarklet to the bookmarks bar
* Browse to an article
* Click the bookmarklet

### Using the Chrome extension:

* Open Chrome
* Browse to Window -> Extensions
* Enable Developer Mode
* Click on 'Load unpacked extension...'
* Select citelet/chrome-ext
* Browse to an article

### Resources

* Example articles: [https://docs.google.com/spreadsheet/ccc?key=0Ahtc_QrXguAwdHZHTE5TM0dxMll3Mkc0V1d3MnBpZmc#gid=0](https://docs.google.com/spreadsheet/ccc?key=0Ahtc_QrXguAwdHZHTE5TM0dxMll3Mkc0V1d3MnBpZmc#gid=0)
