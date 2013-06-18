/*
 * @module ContactExtractor
 * @author jmcarp
 */

var ContactExtractor = (function(Extractors) {
    
    // Email regular expression
    email_rgx = /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:\w(?:[\w-]*\w)?\.)+\w(?:[\w-]*\w)?/g;
    
    function clean_addr() {
        return this.getAttribute('href')          // Extract HREF
            .replace(/^mailto:/i, '')             // Trim "mailto:"
            .replace(/\(\W+\)$/, '')              // Trim parenthetical
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
     * @class extract
     * @static
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
        extract : extract,
    };
    
})();

var Extractor = Extractor || {};
Extractor['contacts'] = ContactExtractor;