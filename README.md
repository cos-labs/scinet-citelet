# Citelet

## Organization:

* js-src: Base modules for extracting article meta-data
* js-contrib: User-contributed modules for extracting article meta-data
* js-util: Miscellaneous JS utility functions
* py-util: Miscellaneous Python utility functions
* flask: Python server
* ext: Code for Chrome extension

## How to run Citelet:

* Start a mongod instance
* Start a Flask server:
    * python flask/citelet.py
* Browse to the bookmarklet page
    * http://127.0.0.1:5000/bookmarklet
* Drag the bookmarklet to your bookmarks bar
* Browse to an article
* Click the bookmarklet
