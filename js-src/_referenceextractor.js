/**
 * Tools for extracting cited references
 *
 * @module ReferenceExtractor
 * @author jmcarp
 */

var ReferenceExtractor = (function() {
    
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
        if (typeof(name) !== 'undefined' && name) {
            ReferenceExtractor.registry[name] = this;
        }
    };
    ReferenceExtractor.registry = {};

    /**
     * Class for extracting references using jQuery selector
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

    /**
     * Class for extracting references using JQuery selector
     * 
     * @class MultiReferenceExtractor
     * @extends ReferenceExtractor
     * @constructor
     * @param name {String} Publisher name
     * @param selector {Function} JQuery selector for references
     */
    function MultiReferenceExtractor(name) {
        var extractors = Array.prototype.slice.call(arguments, 1);
        fun = function() {
            ref_groups = [];
            for (var extidx = 0; extidx < extractors.length; extidx++) {
                refs = extractors[extidx].extract();
                if (ref_groups.length
                        && refs.length !== ref_groups[0].length) {
                    continue
                }
                ref_groups.push(refs);
            }
            var combined_refs = [];
            for (var refidx = 0; refidx < ref_groups[0].length; refidx++) {
                var combined_ref = '';
                for (var extidx = 0; extidx < ref_groups.length; extidx++) {
                    combined_ref += ref_groups[extidx][refidx].outerHTML;
                }
                combined_refs.push(combined_ref);
            }
            return combined_refs;
        };
        ReferenceExtractor.call(this, name, fun);
    }
    MultiReferenceExtractor.prototype = new ReferenceExtractor;
    MultiReferenceExtractor.prototype.constructor = MultiReferenceExtractor;

    /**
     * @class extract
     * @static
     * @param publisher {String} Publisher name
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
                // Return outerHTML if defined, else this
                return this.outerHTML || this;
            }).get();
        });
        
    };
    
    // Expose public methods & data
    
    return {
        ReferenceExtractor : ReferenceExtractor,
        SelectorReferenceExtractor : SelectorReferenceExtractor,
        MultiReferenceExtractor : MultiReferenceExtractor,
        extract : extract,
    };
    
})();

var Extractor = Extractor || {};
Extractor['references'] = ReferenceExtractor;
