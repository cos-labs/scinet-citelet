# Citelet

## Organization:

* js-src: Base modules for extracting article meta-data
* js-contrib: User-contributed modules for extracting article meta-data
* ext: Code for Chrome extension
* static: Static files for Flask bookmarklet

## How to run citelet:

* Start a mongod instance
* Start a Flask server:
    * python citelet.py
* Browse to the bookmarklet page
    * http://127.0.0.1:5000/bookmarklet
* Drag the bookmarklet to your bookmarks bar
* Browse to an article
* Click the bookmarklet
