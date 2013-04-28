/**
 * @module RefExtractor
 */
 var RefExtractor = (function() {

    // Initialize module
    var my = {};
    
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
    function RefExtractor(name, fun) {
        this.extract = fun;
        if (typeof(name) !== 'undefined')
            RefExtractor.registry[name] = this;
    };
    RefExtractor.registry = {};

    /**
     * Class for extracting references using JQuery selector
     * 
     * @class JQueryRefExtractor
     * @extends RefExtractor
     * @constructor
     * @param name {String} Publisher name
     * @param selector {Function} JQuery selector for references
     */
    function JQueryRefExtractor(name, selector) {
        fun = function() {
            return $(selector);
        };
        RefExtractor.call(this, name, fun);
    }
    JQueryRefExtractor.prototype = new RefExtractor;
    JQueryRefExtractor.prototype.constructor = JQueryRefExtractor;

    // Define RefExtractors
    new RefExtractor('thieme', function () {
        return $($('.literaturliste')[0])
            .children('li')
            .filter(function () {
                return $(this).find('h3').length == 0
            });
    });
    
    new RefExtractor('pubmed', function () {
        var refs_v1 = $('li[id^="B"]'),
            refs_v2 = $('div.ref-cit-blk');
        return refs_v1.length ? refs_v1 : refs_v2;
    });
    
    new RefExtractor('apa', function () {
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
    
    // Define JQueryRefExtractors
    new JQueryRefExtractor('sciencedirect', 'ul.reference');
    new JQueryRefExtractor('springer', 'div.Citation');
    new JQueryRefExtractor('highwire', 'ol.cit-list > li');
    new JQueryRefExtractor('wiley', 'ul.plain > li');
    new JQueryRefExtractor('tandf', 'ul.references > li');
    new JQueryRefExtractor('biomed', 'ol#references > li');
    new JQueryRefExtractor('royal', 'ol.cit-list > li');
    new JQueryRefExtractor('nas', 'ol.cit-list > li');
    new JQueryRefExtractor('mit', 'td.refnumber + td');
    new JQueryRefExtractor('ovid', 'p.fulltext-REFERENCES');
    new JQueryRefExtractor('plos', 'ol.references > li');
    new JQueryRefExtractor('frontiers', 'div.References');
    new JQueryRefExtractor('hindawi', 'ol > li[id^="B"]');
    new JQueryRefExtractor('nature', 'ol.references > li');
    new JQueryRefExtractor('ama', 'div.referenceSection div.refRow');
    new JQueryRefExtractor('acs', 'div.NLM_citation');

    // Public data
    
    /**
     * @class extract
     * @static
     * @return {Object} JQuery list of references
     */
    my.extract = function(publisher) {
        if (!(publisher in RefExtractor.registry)) {
            return false;
        }
        var refs = RefExtractor.registry[publisher].extract();
        return refs.map(function() {
            return $(this).html();
        }).get();
    };
    
    // Return module
    return my;
    
})();