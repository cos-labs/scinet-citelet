/**
 * @module CitationExtractor
 * @author jmcarp
 */

var CitationExtractor = (function() {
    
    // Private data
    
    /**
     * Base class for citation info extraction
     * 
     * @class CitationExtractor
     * @constructor
     * @param name {String} Publisher name
     * @param fun {Function} Function to extract citation info from current page
     */
    function CitationExtractor(name, fun) {
        this.extract = fun;
        if (typeof(name) !== 'undefined')
            CitationExtractor.registry[name] = this
    }
    CitationExtractor.registry = {};

    /**
     * Extract citation info from <meta> tags
     *
     * @class meta_extract
     * @static
     * @param test {RegExp} Test pattern for identifying relevant &lt;meta&gt; tags
     * @param replace {RegExp} Replacement pattern for cleaning up &lt;meta&gt; tags
     */
    function meta_extract(test, replace) {

        // Get default argument values
        test = test || /DC\.|citation_(?!reference)/i;
        replace = replace || /DC\.|citation_/i;

        // Initialize citation info
        var cit = {};

        // Filter &lt;meta&gt; tags with matching name
        $('meta[name][content]').filter(function() {
            return test.test(this.name);
        // Add &lt;meta&gt; content to citation info
        }).each(function() {
            var name = this.name
                .replace(replace, '')   // Remove matched text
                .toLowerCase();         // To lower case
            // Create new list if not in info
            if (!(name in cit)) {
                cit[name] = [];
            }
            // Append to list
            cit[name].push(this.content)
        });

        // Return citation info
        return cit;

    };


    /**
     * Class for extracting head reference from &lt;meta&gt; tags
     * 
     * @class MetaCitationExtractor
     * @extends CitationExtractor
     * @constructor
     * @param name {String} Publisher name
     * @param test {RegExp} Test pattern for identifying relevant &lt;meta&gt; tags
     * @param replace {RegExp} Replacement pattern for cleaning up &lt;meta&gt; tags
     */
    function MetaCitationExtractor(name, test, replace) {
        
        // Get default argument values
        if (typeof(test) === 'undefined')
            var test = /DC\.|citation_(?!reference)/i;
        if (typeof(replace) === 'undefined')
            var replace = /DC\.|citation_/i;
            
        // Define function: Extract head reference information from &lt;meta&gt; tags
        var fun = function () {
            return meta_extract(test, replace);
        };
        
        // Call parent constructor
        CitationExtractor.call(this, name, fun);
        
    };
    MetaCitationExtractor.prototype = new CitationExtractor;
    MetaCitationExtractor.prototype.constructor = MetaCitationExtractor;
    
    /**
     * @class extract
     * @static
     * @param publisher {String} Name of publisher
     * @return {Object} Dictionary of head reference properties
     */
    function extract(publisher) {
        if (!(publisher in CitationExtractor.registry)) {
            return false;
        }
        return CitationExtractor.registry[publisher].extract();
    };
    
    // Expose public methods and data
    
    return {
        CitationExtractor : CitationExtractor,
        MetaCitationExtractor : MetaCitationExtractor,
        meta_extract : meta_extract,
        extract : extract,
    };
    
})();

var Extractor = Extractor || {};
Extractor['citation'] = CitationExtractor;
