/**
 * @module ReferenceExtractor
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
        if (typeof(name) !== 'undefined')
            ReferenceExtractor.registry[name] = this;
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

    // Define ReferenceExtractors
    new ReferenceExtractor('thieme', function () {
        return $($('.literaturliste')[0])
            .children('li')
            .filter(function () {
                return $(this).find('h3').length == 0
            });
    });
    
    new ReferenceExtractor('pubmed', function () {
        var refs_v1 = $('li[id^="B"]'),
            refs_v2 = $('div.ref-cit-blk');
        return refs_v1.length ? refs_v1 : refs_v2;
    });
    
    new ReferenceExtractor('apa', function () {
        var ref_link = $('a[title="References"][href="#toc"]');
        if (ref_link.length == 0) return false;
        ref_span = ref_link.parent('span');
        if (ref_span.length == 0) return false;
        var refs = ref_span.nextAll('p.body-paragraph');
        refs = refs.filter(function () {
            return (!/this publication is protected/i.test(this.innerHTML)) &&
                   (!/submitted.*?revised.*?accepted/i.test(this.innerHTML));
        });
        return refs;
    });
    
    // Define SelectorReferenceExtractors
    new SelectorReferenceExtractor('sciencedirect', 'ul.reference');
    new SelectorReferenceExtractor('springer', 'div.Citation');
    new SelectorReferenceExtractor('highwire', 'ol.cit-list > li');
    new SelectorReferenceExtractor('wiley', 'ul.plain > li');
    new SelectorReferenceExtractor('tandf', 'ul.references > li');
    new SelectorReferenceExtractor('biomed', 'ol#references > li');
    new SelectorReferenceExtractor('royal', 'ol.cit-list > li');
    new SelectorReferenceExtractor('nas', 'ol.cit-list > li');
    new SelectorReferenceExtractor('mit', 'td.refnumber + td');
    new SelectorReferenceExtractor('ovid', 'p.fulltext-REFERENCES');
    new SelectorReferenceExtractor('plos', 'ol.references > li');
    new SelectorReferenceExtractor('frontiers', 'div.References');
    new SelectorReferenceExtractor('hindawi', 'ol > li[id^="B"]');
    new SelectorReferenceExtractor('nature', 'ol.references > li');
    new SelectorReferenceExtractor('ama', 'div.referenceSection div.refRow');
    new SelectorReferenceExtractor('acs', 'div.NLM_citation');
    
    /**
     * @class extract
     * @static
     * @return {Object} JQuery list of references
     */
    function extract(publisher) {
        if (!(publisher in ReferenceExtractor.registry)) {
            return false;
        }
        var refs = ReferenceExtractor.registry[publisher].extract();
        return refs.map(function() {
            return $(this).html();
        }).get();
    };
    
    // Expose public methods & data
    
    return {
        ReferenceExtractor : ReferenceExtractor,
        SelectorReferenceExtractor : SelectorReferenceExtractor,
        extract : extract,
    };
    
})();