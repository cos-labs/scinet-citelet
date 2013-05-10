# Modifications to jquery-ui.css

* Point to images in Chrome extension
    * url("images/ui-icons.png") -> url("chrome-extension::/__MSG_@@extension_id__/lib/images/ui-icons.png")
* Wrap all selectors to isolate from conflicting stylesheets
    * .ui-widget {} -> #citelet-container .ui-widget {}
    * Style container with default body properties
* Additional miscellaneous fixes
    * Labeled inline with /* Citelet: ... */
