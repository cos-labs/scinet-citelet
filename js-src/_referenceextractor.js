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
    
    // Define ReferenceExtractors
    new ReferenceExtractor('sciencedirect', function () {
        
        /**
         * ScienceDirect lazy-loads references. The base page is loaded first, and
         * then references and other elements are loaded asynchronously. This function
         * checks whether the references are available by finding in-text citations
         * (which are loaded synchronously) and then checking whether the corresponding
         * links in the reference section exist.
         * 
         * @class check_refs
         * @static
         * @return {Boolean} References available?
         */
        function check_refs() {
            
            // Get href attributes of in-text references
            // Regex may need work: in-text references have IDs including
            // ancbbb1, ancbb1, ancbbib1, etc.
            var text_refs = $('a.intra_ref').filter(function() {
                return /ancb.*?b\d+/.test($(this).attr('id'))
            }).map(function() {
                return $(this).attr('href')}
            );
            
            // Get unique in-text references
            text_refs = $.unique(text_refs);
            
            // Initialize variables
            var cited_refs,
                success = true;
            
            // Loop over in-text references and look for corresponding 
            // bibliographic references; set success to false if any missing
            $.each(text_refs, function(idx, val) {
                cited_refs = $('.label').filter(function() {
                    return $(this).attr('href') == val;
                });
                if (cited_refs.length == 0) {
                    success = false;
                    return false;
                }
            });
            
            // Return reference availability
            return success;
            
        }
        
        // Return references if available
        if (check_refs()) {
            return $('ul.reference');
        }
        
        // References not available; set up deferred object
        var defer = $.Deferred(),
            refs = $([]);
            tryidx = 1;
        
        // Check for references until available or timeout; return
        // deferred object
        var timer = window.setInterval(function() {
            if (check_refs()) {
                defer.resolve($('ul.reference'));
                window.clearInterval(timer);
            }
            if (tryidx >= 20) {
                defer.resolve(refs);
                window.clearInterval(timer);
            }
            tryidx += 1;
        }, 500);
        
        // Return deferred object
        return defer;
        
    });
    
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
        return refs.filter(function () {
            return (!/this publication is protected/i.test(this.innerHTML)) &&
                   (!/submitted.*?revised.*?accepted/i.test(this.innerHTML));
        });
    });
    
    // Define SelectorReferenceExtractors
    
    // #abstract-references li works for abstract page; div.Citation
    // works for full-text page.
    new SelectorReferenceExtractor('springer', '#abstract-references li, div.Citation');
    new SelectorReferenceExtractor('highwire', 'ol.cit-list > li');
    new SelectorReferenceExtractor('wiley', 'ul.plain > li');
    new SelectorReferenceExtractor('tandf', 'ul.references > li');
    new SelectorReferenceExtractor('biomed', 'ol#references > li');
    new SelectorReferenceExtractor('royal', 'ol.cit-list > li');
    new SelectorReferenceExtractor('nas', 'ol.cit-list > li');
    new SelectorReferenceExtractor('mit', 'td.refnumber + td');
    new SelectorReferenceExtractor('ovid', 'p.fulltext-REFERENCES');
    new SelectorReferenceExtractor('frontiers', 'div.References');
    new SelectorReferenceExtractor('hindawi', 'ol > li[id^="B"]');
    new SelectorReferenceExtractor('nature', 'ol.references > li');
    new SelectorReferenceExtractor('ama', 'div.referenceSection div.refRow');
    new SelectorReferenceExtractor('acs', 'div.NLM_citation');
    new SelectorReferenceExtractor('lww', '#ej-article-references div[id^=P]');
    
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
            return vals.map(function() {
                return $(this).html();
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