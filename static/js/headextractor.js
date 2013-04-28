/**
 * @module HeadExtractor
 */
var HeadExtractor = (function() {
    
    // Initialize module
    var my = {};
    
    // Private data
    
    /**
     * Base class for head reference extraction
     * 
     * @class ReferenceExtractor
     * @constructor
     * @param name {String} Publisher name
     * @param fun {Function} Function to extract head reference from current page
     */
    function HeadExtractor(name, fun) {
        this.extract = fun;
        if (typeof(name) !== 'undefined')
            HeadExtractor.registry[name] = this
    }
    HeadExtractor.registry = {};

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
    function MetaHeadExtractor(name, test, replace) {
        
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
                name = this.name.replace(replace, '');
                if (!(name in head_info)) {
                    head_info[name] = [];
                }
                head_info[name].push(this.content)
            });
            return head_info;
        };
        
        // Call parent constructor
        HeadExtractor.call(this, name, fun);
        
    };
    MetaHeadExtractor.prototype = new HeadExtractor;
    MetaHeadExtractor.prototype.constructor = MetaHeadExtractor;

    // Define HeadExtractors
    
    new HeadExtractor('sciencedirect', function() {
        var head_info = {};
        var ddDoi = $('a#ddDoi');
        var ddlink = ddDoi.attr('href');
        ddlink = ddlink.replace(/.*?dx\.doi\.org.*?\//, '');
        head_info['doi'] = ddlink;
        return head_info;
    });
    
    new HeadExtractor('springer', function () {
        // Initialize info
        var head_info = {};
        // Get context information
        var context_div = $('div.ContextInformation');
        context_div.children('span').each(function () {
            key = this.className.replace(/article/i, '');
            val = this.innerText;
            head_info[key] = val;
        });
        // Get author information
        head_info['authors'] = $('span.AuthorName').map(function () {
            return this.innerText;
        }).get();
        // Done
        return head_info;
    });
    
    new HeadExtractor('ovid', function () {
        var head_info = {};
        var journal_title = $('div.fulltext-SOURCEFULL').text();
        var split;
        if (journal_title) head_info['Title'] = journal_title;
        $('div#fulltext-source-info div').each(function () {
            split = this.innerText.split(':');
            if (split.length > 1) head_info[split[0]] = split[1];
        });
        return head_info;
    });
    
    new HeadExtractor('apa', function () {
        var dts = $('.citation-wrapping-div dt, .short-citation dt'),
            dds = $('.citation-wrapping-div dd, .short-citation dd');
        var head_info = {};
        for (var idx = 0; idx < dts.length; idx++) {
            var key = dts[idx].innerHTML.replace(/^:|:$/g, ''),
                val = dds[idx].innerHTML;
            head_info[key] = val;
        }
        return head_info;
    });
    
    // Define MetaHeadExtractors
    
    new MetaHeadExtractor('highwire');
    new MetaHeadExtractor('wiley');
    new MetaHeadExtractor('tandf');
    new MetaHeadExtractor('biomed');
    new MetaHeadExtractor('thieme');
    new MetaHeadExtractor('pubmed');
    new MetaHeadExtractor('royal');
    new MetaHeadExtractor('nas');
    new MetaHeadExtractor('mit');
    new MetaHeadExtractor('plos');
    new MetaHeadExtractor('frontiers');
    new MetaHeadExtractor('hindawi');
    new MetaHeadExtractor('nature');
    new MetaHeadExtractor('ama');
    new MetaHeadExtractor('acs');

    // Public data
    
    /**
     * @class extract
     * @static
     * @return {Object} Dictionary of head reference properties
     */
    my.extract = function (publisher) {
        if (!(publisher in HeadExtractor.registry)) {
            return false;
        }
        return HeadExtractor.registry[publisher].extract();
    };
    
    // Return module
    return my;

})();