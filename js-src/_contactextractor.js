/**
 * Tools for extracting contact info
 *
 * @module ContactExtractor
 * @author jmcarp
 */

var ContactExtractor = (function() {

    // Email regular expression
    email_rgx = /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:\w(?:[\w-]*\w)?\.)+\w(?:[\w-]*\w)?/g;

    /**
     * Extract email address from <a> and clean up
     *
     * @class clean_addr
     * @static
     * @return {Object} Cleaned email address
     */
    function clean_addr() {
        return this.getAttribute('href')          // Extract HREF
            .replace(/^mailto:/i, '')             // Trim "mailto:"
            .replace(/\([A-Z]+\)$/, '')              // Trim parenthetical
            .trim();                              // Trim whitespace
    }

    /**
     * Base class for contact extraction
     *
     * @class ContactExtractor
     * @constructor
     * @param name {String} Publisher name
     * @param fun {Function} Function to extract contact information from current page
     */
    function ContactExtractor(name, fun) {
        this.extract = fun;
        if (typeof(name) !== 'undefined') {
            ContactExtractor.registry[name] = this;
        }
    };
    ContactExtractor.registry = {};

    /**
     * Extract contact info via CSS selector
     *
     * @class SelectorContactExtractor
     * @constructor
     * @param name {String} Publisher name
     * @param selector {String} CSS selector for contact links
     */
    function SelectorContactExtractor(name, selector) {

        fun = function() {

            // Get emails
            var email = $(selector)
                .map(clean_addr)
                .get();

            // Restrict to unique emails
            email = $.unique(email);

            return {
                email : email,
            }

        }

        // Call parent constructor
        ContactExtractor.call(this, name, fun);

    }

    SelectorContactExtractor.prototype = new ContactExtractor;
    SelectorContactExtractor.constructor = SelectorContactExtractor;

    /**
     * Extract contact info via CSS selector
     *
     * @class RegexContactExtractor
     * @constructor
     * @param name {String} Publisher name
     * @param selector {String} CSS selector for contact links
     */
    function RegexContactExtractor(name, selector) {

        fun = function() {

            // Get emails
            var email = [];
            $(selector).each(function(idx, elm) {
                var my_email = $(elm)
                    .text()
                    .match(email_rgx);
                if (my_email)
                    email.push.apply(email, my_email);
            });

            // Restrict to unique emails
            email = $.unique(email);

            return {
                email : email,
            }

        }

        // Call parent constructor
        ContactExtractor.call(this, name, fun);

    }

    RegexContactExtractor.prototype = new ContactExtractor;
    RegexContactExtractor.constructor = RegexContactExtractor;

    /**
     * Extract contact info from document
     *
     * @class extract
     * @static
     * @param publisher {String} Name of publisher
     * @return {Object} Dictionary of contact information
     */
    function extract(publisher) {

        // Quit if publisher not in registry
        if (!(publisher in ContactExtractor.registry)) {
            return false;
        }

        // Call extract function from registry
        return ContactExtractor.registry[publisher].extract();

    };

    return {
        email_rgx : email_rgx,
        clean_addr : clean_addr,
        ContactExtractor : ContactExtractor,
        SelectorContactExtractor : SelectorContactExtractor,
        RegexContactExtractor : RegexContactExtractor,
        extract : extract,
    };

})();

var Extractor = Extractor || {};
Extractor['contacts'] = ContactExtractor;
