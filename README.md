# Citelet

## Organization:

* js-src: Base modules for extracting article meta-data
* js-contrib: Publisher-specific modules for extracting article meta-data
* js-util: Miscellaneous JS utility functions
* py-util: Miscellaneous Python utility functions
* app: Flask app
* chrome-ext: Chrome extension

## How to run Citelet from localhost:

* Prepare files
    * make
* Start a mongod instance
    * mongod
* Start a Flask server:
    * python app/main.py

### Using the bookmarklet:

* Browse to the bookmarklet page
    * http://localhost:5000/bookmarklet
* Drag the bookmarklet to the bookmarks bar
* Browse to an article
* Click the bookmarklet

### Using the Chrome extension:

* Open Chrome
* Browse to Window -> Extensions
* Enable Developer Mode
* Click on "Load unpacked extension..."
* Select citelet/chrome-ext
* Browse to an article
