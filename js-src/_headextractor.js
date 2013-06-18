/**
 * @module CitationExtractor
 * @author jmcarp
 */

var CitationExtractor = (function(Extractor) {
    
    // Private data
    
    /**
     * Base class for head reference extraction
     * 
     * @class ReferenceExtractor
     * @constructor
     * @param name {String} Publisher name
     * @param fun {Function} Function to extract head reference from current page
     */
    function CitationExtractor(name, fun) {
        this.extract = fun;
        if (typeof(name) !== 'undefined')
            CitationExtractor.registry[name] = this
    }
    CitationExtractor.registry = {};

    /**
     * Class for extracting head reference from <meta> tags
     * 
     * @class MetaReferenceExtractor
     * @extends ReferenceExtractor
     * @constructor
     * @param name {String} Publisher name
     * @param test {RegExp} Test pattern for identifying relevant <meta> tags
     * @param replace {RegExp} Replacement pattern for cleaning up <meta> tags
     */
    function MetaCitationExtractor(name, test, replace) {
        
        // Get default argument values
        if (typeof(test) === 'undefined')
            var test = /DC\.|citation_(?!reference)/i;
        if (typeof(replace) === 'undefined')
            var replace = /DC\.|citation_/i;
            
        // Define function: Extract head reference information from <meta> tags
        var fun = function () {
            var head_info = {},
                name;
            $('meta[name][content]').filter(function() {
                return test.test(this.name);
            }).each(function() {
                name = this.name
                    .replace(replace, '')   // Replaced matched text
                    .toLowerCase();         // To lower case
                // Create new list if not in info
                if (!(name in head_info)) {
                    head_info[name] = [];
                }
                head_info[name].push(this.content)
            });
            return head_info;
        };
        
        // Call parent constructor
        CitationExtractor.call(this, name, fun);
        
    };
    MetaCitationExtractor.prototype = new CitationExtractor;
    MetaCitationExtractor.prototype.constructor = MetaCitationExtractor;
    
    /**
     * @class extract
     * @static
     * @return {Object} Dictionary of head reference properties
     */
    function extract(publisher) {
        if (!(publisher in CitationExtractor.registry)) {
            return false;
        }
        return CitationExtractor.registry[publisher].extract();
    };
    
    // Expose public methods & data
    
    return {
        CitationExtractor : CitationExtractor,
        MetaCitationExtractor : MetaCitationExtractor,
        extract : extract,
    };
    
})();

var Extractor = Extractor || {};
Extractor['citation'] = CitationExtractor;