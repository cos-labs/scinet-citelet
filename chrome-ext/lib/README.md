# Customizing JS / CSS for Bootstrap confirmation

* Append modal elements to #citelet, not to <body>
    * Modify modal defaults in bootstrap.js
    * Modal confirm defaults in bootbox.js
* Wrap all bootstrap selectors in #citelet namespace
    * Create bootstrap-namespace.less
    * Compile: lessc bootstrap-namespace.less bootstrap-namespace.css
* Add custom CSS to fix site-specific issues: bootstrap-custom.css
