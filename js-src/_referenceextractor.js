/**
 * @module ReferenceExtractor
 * @author jmcarp
 */

var ReferenceExtractor = (function(Extractor) {
    
    // Private data
    
    // ReferenceExtractor classes
    
    /**
     * Base class for reference extraction
     * 
     * @class ReferenceExtractor
     * @constructor
     * @param name {String} Publisher name
     * @param fun {Function} Function to extract references from current page
     */
    function ReferenceExtractor(name, fun) {
        this.extract = fun;
        if (typeof(name) !== 'undefined') {
            ReferenceExtractor.registry[name] = this;
        }
    };
    ReferenceExtractor.registry = {};
    
    /**
     * Class for extracting references using JQuery selector
     * 
     * @class SelectorReferenceExtractor
     * @extends ReferenceExtractor
     * @constructor
     * @param name {String} Publisher name
     * @param selector {Function} JQuery selector for references
     */
    function SelectorReferenceExtractor(name, selector) {
        fun = function() {
            return $(selector);
        };
        ReferenceExtractor.call(this, name, fun);
    }
    SelectorReferenceExtractor.prototype = new ReferenceExtractor;
    SelectorReferenceExtractor.prototype.constructor = SelectorReferenceExtractor;
    
    // Define SelectorReferenceExtractors
    
    /**
     * @class extract
     * @static
     * @return {Object} JQuery list of references
     */
    function extract(publisher) {
    
        // Quit if publisher not in registry
        if (!(publisher in ReferenceExtractor.registry)) {
            return false;
        }
        
        // Call extract function from registry
        var refs = ReferenceExtractor.registry[publisher].extract();
        
        // Make sure refs is a $.Deferred
        refs = $.when(refs);
        
        // Pipe refs through HTML getter and return deferred object
        return refs.pipe(function(vals) {
            return $(vals).map(function() {
                if (this.hasOwnProperty('outerHTML'))
                    return this.outerHTML;
                return this;
            }).get();
        });
        
    };
    
    // Expose public methods & data
    
    return {
        ReferenceExtractor : ReferenceExtractor,
        SelectorReferenceExtractor : SelectorReferenceExtractor,
        extract : extract,
    };
    
})();

var Extractor = Extractor || {};
Extractor['references'] = ReferenceExtractor;