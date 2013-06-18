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

/*
 * @module citelet
 * @author jmcarp
 */

var citelet = (function() {

    /**
     * Resolve potential conflict in JSON.stringify with Prototype.js; see
     * http://stackoverflow.com/questions/710586/json-stringify-bizarreness
     */
    var stringify = Object.toJSON ? Object.toJSON : JSON.stringify;
    
    /*
     * @class truthify
     * @static
     * @param thing whose truthiness value to get
     * @return {bool} truthiness value
     */
    function truthify(thing) {
        if (typeof(thing) === 'object')
            return Object.keys(thing).length > 0
        // Is thing falsy?
        return thing == false;
    };
    
    /**
     * Scrape article meta-data from current page. Because some publishers
     * (read: ScienceDirect) load page data asynchronously, this function returns
     * a $.Deferred object, which returns a dictionary when resolved
     * 
     * @class scrape
     * @static
     * @return {jquery.Deferred} Resolves to dictionary of reference meta-data
     */
    function scrape() {
        
        // Build data dictionary
        var data = {};
        
        // Get test information
        try {
            var testid = $('#__citelet_testid').attr('data-testid');
            data['testid'] = testid;
        } catch (e){}
        
        // Get article URL and publisher
        data['url'] = window.location.href;
        data['publisher'] = PublisherDetector.detect();
        
        if (data['publisher'] !== '') {
            
            var fields = Object.keys(Extractor);
            
            // 
            var values = $.map(fields, function(field, idx) {
                return Extractor[field].extract(publisher);
            });
            
            // Store values in data when deferreds resolve
            // Hint for using $.when with variable number of arguments:
            // http://stackoverflow.com/questions/8011652/jquery-when-with-variable-arguments
            var defer = $.when.apply($, values).pipe(function() {
                // Arguments of $.when must be in scope for $.each
                var _arguments = arguments;
                $.each(fields, function(idx, field) {
                    data[field] = truthify(_arguments[idx]) ? 
                                    stringify(_arguments[idx]) : 
                                    '';
                });
                return data;
            });
            
            // Return deferred object
            return defer;
        
        } else {
            
            return $.when(data);
            
        }
        
    }

    /**
     * Send data to server
     * 
     * @class send
     * @static
     * @param {Object} data Data dictionary to send
     * @param {Object} [_opts={}] Options for $.ajax
     */
    function send(data, meta, _opts) {
        
        // Add meta-info to data
        var aug_data = $.extend(data, {meta : stringify(meta)});
        
        // Default options
        var opts = {
            url : 'http://localhost:5000/sendrefs/',
            type : 'POST',
            data : aug_data,
            success : function(res) {
                console.log(res['msg']);
            },
        };
        
        // Add non-default options
        if (typeof(_opts) !== 'undefined') {
            $.extend(opts, _opts);
        }

        // Send AJAX request
        $.ajax(opts);

    }
    
    // Expose public methods & data

    return {
        scrape : scrape,
        send : send,
    }

})();


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

/**
 * @module PublisherDetector
 * @author jmcarp
 */
var PublisherDetector = (function() {
    
    // PublisherDetector classes
    
    /**
    * Base class for detecting publishers. 
    * 
    * @class PublisherDetector
    * @constructor
    * @param name {String} Publisher name
    * @param fun {Function} Function to check the current page for the publisher
    */
    function PublisherDetector(name, fun) {
        this.detect = fun;
        if (typeof(name) !== 'undefined') {
            PublisherDetector.registry[name] = this;
        }
    };
    PublisherDetector.registry = {};

    /**
    * Class for detecting publishers from <title> tags.
    * 
    * @class TitlePublisherDetector
    * @extends PublisherDetector
    * @constructor
    * @param name {String} Publisher name
    * @param regex {Object} RegExp object for testing title
    */
    function TitlePublisherDetector(name, regex) {
        
        // Define detector function
        function fun() {
            return regex.test($('title').text())
        };
        
        // Call parent constructor
        PublisherDetector.call(this, name, fun);
        
    };
    TitlePublisherDetector.prototype = new PublisherDetector;
    TitlePublisherDetector.prototype.constructor = TitlePublisherDetector;

    /**
    * Class for detecting publishers from <meta> tags.
    * 
    * @class MetaPublisherDetector
    * @constructor
    * @param name {String} Publisher name
    * @param attrs {Object} Dictionary of attr name : value pairs
    * @param [opers=['=']] {List} List of operators for name : value comparisons
    */
    function MetaPublisherDetector(name, attrs, opers) {
        
        // Get default argument values
        if (typeof(opers) === 'undefined') {
            opers = ['='];
        }
        
        // Define detector function
        function fun() {
        
            // Initialize variables
            var attr_string = 'meta',
                oper;

            // Loop over attributes
            $.each(attrs, function(idx, val) {
                oper = opers[idx % opers.length];
                attr_string = attr_string + '[' + val[0] + oper + '"' + val[1] + '"]';
            });
            
            return $(attr_string).length > 0;
            
        };
        
        // Call parent constructor
        PublisherDetector.call(this, name, fun);
        
    };
    MetaPublisherDetector.prototype = new PublisherDetector;
    MetaPublisherDetector.prototype.constructor = MetaPublisherDetector;
    
    /**
    * Class for detecting publishers using regxp on arbitrary element attributes.
    * 
    * @class RegexpPublisherDetector
    * @extends PublisherDetector
    * @constructor
    * @param name {String} Publisher name
    * @param selector {String} JQuery selector for getting relevant tags
    * @param attrs {Object} Dictionary of attr name : value pairs
    * @param [flags='i'] {String} RegExp flags
    */
    function RegexPublisherDetector(name, selector, attrs, flags) {
        
        // Default values
        if (typeof(flags) === 'undefined')
            flags = 'i';
        
        // Define detector function
        function fun() {

            // Get <meta> tags
            var tags = $(selector);

            // Filter tags by each name / value pair
            $.each(attrs, function(idx, val) {

                // Define filter function
                function flt() {
                    var match = false;
                    $(this.attributes).each(function() {
                        if (RegExp(val[0], flags).test(this.nodeName) & 
                                RegExp(val[1], flags).test(this.nodeValue)) {
                            match = true;
                            return false;
                        }
                    });
                    return match;
                }

                // Filter remaining tags
                tags = tags.filter(flt);

            });
            
            // Match if >0 tags found
            return tags.length > 0;

        }
        
        // Call parent constructor
        PublisherDetector.call(this, name, fun);
        
    };

    // Set prototype and constructor
    RegexPublisherDetector.prototype = new PublisherDetector;
    RegexPublisherDetector.prototype.constructor = RegexPublisherDetector;
    
    /**
     * @class detect
     * @static
     * @return {String} Name of publisher (or '' if no publisher matches)
     */
    function detect() {
        for (publisher in PublisherDetector.registry) {
            if (PublisherDetector.registry[publisher].detect()) {
                return publisher;
            }
        }
        return '';
    }
    
    // Expose public methods & data
    
    return {
        PublisherDetector : PublisherDetector,
        TitlePublisherDetector : TitlePublisherDetector,
        MetaPublisherDetector : MetaPublisherDetector,
        RegexPublisherDetector : RegexPublisherDetector,
        detect : detect,
    };
    
})();

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

/*
 * @author jmcarp
 */

new PublisherDetector.MetaPublisherDetector('acs', [
    ['name', 'dc.Publisher'],
    ['content', 'American Chemical Society'],
]);

new CitationExtractor.MetaCitationExtractor('acs');

new ReferenceExtractor.SelectorReferenceExtractor('acs', 'div.NLM_citation');


/*
 * @author jmcarp
 */

new PublisherDetector.MetaPublisherDetector('ama', [
    ['name', 'citation_publisher'],
    ['content', 'American Medical Association'],
]);

new CitationExtractor.MetaCitationExtractor('ama');

new ReferenceExtractor.SelectorReferenceExtractor('ama', 'div.referenceSection div.refRow');


/*
 * @author jmcarp
 */

new PublisherDetector.PublisherDetector('apa', function() {
    
    // Test <dt> / <dd> tags
    var pub_dt = $('dt').filter(function () {
        return this.innerHTML == 'Publisher:';
    });
    if (pub_dt.length > 0) {
        var pub_dd = pub_dt.next('dd');
        if (/american psychological association/i.test(pub_dd.text())) {
            return true;
        }
    }
    
    // Test Source: paragraph
    var source_par = $('p.body-paragraph').filter(function() {
        return /source:/i.test(this.innerText);
    });
    if (/american psychological association/i.test(source_par.text())) {
        return true;
    };
    
    return false;
    
});

new CitationExtractor.CitationExtractor('apa', function () {
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

new ReferenceExtractor.ReferenceExtractor('apa', function () {
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


/*
 * @author jmcarp
 */

new PublisherDetector.MetaPublisherDetector('biomed', [
    ['name', 'citation_publisher'],
    ['content', 'BioMed Central Ltd'],
]);

new CitationExtractor.MetaCitationExtractor('biomed');

new ReferenceExtractor.SelectorReferenceExtractor('biomed', 'ol#references > li');


/*
 * @module frontiers
 * @author jmcarp
 */

new PublisherDetector.MetaPublisherDetector('frontiers', [
    ['name', 'citation_publisher'],
    ['content', 'Frontiers'],
]);

new CitationExtractor.MetaCitationExtractor('frontiers');

new ReferenceExtractor.SelectorReferenceExtractor('frontiers', 'div.References');

new ContactExtractor.ContactExtractor('frontiers', function() {
    
    var contact = {};
    
    contact['email'] = $('div.AbstractSummary').text().match(email_rgx);
    
    return contact;
    
});

/*
 * @module highwire
 * @author jmcarp
 */

new PublisherDetector.MetaPublisherDetector('highwire', [
    ['name', 'HW.ad-path'],
]);

new CitationExtractor.MetaCitationExtractor('highwire');

new ReferenceExtractor.SelectorReferenceExtractor('highwire', 'ol.cit-list > li');

new ContactExtractor.ContactExtractor('highwire', function() {
    
    var contact = {};
    
    contact['email'] = $('li.corresp a[href]')
        .map(ContactExtractor.clean_addr)
        .get();
    
    return contact;
    
});


/*
 * @author jmcarp
 */

new PublisherDetector.MetaPublisherDetector('hindawi', [
    ['name', 'citation_publisher'],
    ['content', 'Hindawi Publishing Corporation'],
]);

new CitationExtractor.MetaCitationExtractor('hindawi');

new ReferenceExtractor.SelectorReferenceExtractor('hindawi', 'ol > li[id^="B"]');


/*
 * @author jmcarp
 */

new PublisherDetector.PublisherDetector('lww', function() {
    return $('a').filter(function() {
        return /Lippincott Williams & Wilkins/.test(this.innerText);
    }).length > 0;
});

new CitationExtractor.MetaCitationExtractor('lww', /wkhealth_/i, /wkhealth_/i);
    
new ReferenceExtractor.SelectorReferenceExtractor('lww', '#ej-article-references div[id^=P]');
    


/*
 * @author jmcarp
 */

new PublisherDetector.RegexPublisherDetector('mit', 'meta', [
    ['name', 'dc.publisher'],
    ['content', 'mit press'],
]);

new CitationExtractor.MetaCitationExtractor('mit');

new ReferenceExtractor.SelectorReferenceExtractor('mit', 'td.refnumber + td');


/*
 * @author jmcarp
 */

new PublisherDetector.RegexPublisherDetector('nature', 'meta', [
    ['name', 'dc.publisher'],
    ['content', 'nature publishing group'],
]);

new CitationExtractor.MetaCitationExtractor('nature');

/*
 * Nature has (at least) two article styles: 
 * one (for Nature, Nature Neuroscience, etc.) that uses the 
 * "ol.references > li" format, and a second (for Neuropsychopharmacology, etc.)
 * that uses the "div#References li" format.
 */
new ReferenceExtractor.SelectorReferenceExtractor(
    'nature', 'ol.references > li, div#References li'
);


/*
 * @author jmcarp
 */

new PublisherDetector.MetaPublisherDetector('ovid', [
    ['name', 'Ovid'],
], ['^=']);

new CitationExtractor.CitationExtractor('ovid', function () {
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

new ReferenceExtractor.SelectorReferenceExtractor('ovid', 'p.fulltext-REFERENCES');


/*
 * @module plos
 * @author jmcarp
 */
 
// Detect PLoS
new PublisherDetector.MetaPublisherDetector('plos', [
        ['name', 'citation_publisher'],
        ['content', 'Public Library of Science'],
    ]);

// Extract PLoS head reference
new CitationExtractor.MetaCitationExtractor('plos');

// Extract PLoS cited references
new ReferenceExtractor.ReferenceExtractor('plos', function() {
    
    // Extract references from document
    var text_refs = $('ol.references > li'),
        meta_refs = $('meta[name="citation_reference"]');
    
    // Skip <meta> references if length differs from text references
    if (text_refs.length != meta_refs.length)
        return text_refs;
    
    // Concatenate text and <meta> references
    var combined_refs = [];
    for (var idx = 0; idx < text_refs.length; idx++) {
        combined_refs[idx] = text_refs[idx].outerHTML + meta_refs[idx].outerHTML;
    }
    
    // Return combined references
    return combined_refs;
    
});

new ContactExtractor.ContactExtractor('plos', function() {
    
    var contact = {};
    
    contact['email'] = $.unique(
        $('div.author_meta a[href]')
            .map(ContactExtractor.clean_addr)           // Clean email address
            .get()                                      // jQuery -> JavaScript
    );
    
    return contact;
        
});


/*
 * @module pubmed
 * @author jmcarp
 */

new PublisherDetector.MetaPublisherDetector('pubmed', [
    ['name', 'ncbi_db'],
    ['content', 'pmc'],
]);

new CitationExtractor.MetaCitationExtractor('pubmed');

new ReferenceExtractor.ReferenceExtractor('pubmed', function () {
    var refs_v1 = $('li[id^="B"]'),
        refs_v2 = $('div.ref-cit-blk');
    return refs_v1.length ? refs_v1 : refs_v2;
});

new ContactExtractor.ContactExtractor('pubmed', function() {
    
    var contact = {};
    
    contact['email'] = $('ul.authorGroup img')        // Find <img> within authorGroup
        .parent('a')                                  // Find containing <a>
        .map(ContactExtractor.clean_addr)             // Clean email address
        .get();                                       // jQuery -> JavaScript
    
    return contact;
        
});


/*
 * @module sciencedirect
 * @author jmcarp
 */
    
new PublisherDetector.TitlePublisherDetector('sciencedirect', /sciencedirect/i);

new CitationExtractor.CitationExtractor('sciencedirect', function() {
    
    // ScienceDirect meta-data is a mess, so 
    // only DOI is extracted for now
    var head_info = {};
    
    // DOI
    var ddDoi = $('a#ddDoi');
    var ddlink = ddDoi.attr('href');
    ddlink = ddlink.replace(/.*?dx\.doi\.org.*?\//, '');
    head_info['doi'] = ddlink;
    
    // Article title
    var article_title = $('.svTitle').text();
    if (article_title) {
        head_info['article_title'] = article_title;
    }
    
    // Journal title
    var journal_title_exec = /go to (.*?) on sciverse sciencedirect/i
        .exec(document.documentElement.innerHTML);
    if (journal_title_exec) {
        head_info['journal_title'] = journal_title_exec[1];
    }
    
    // Authors
    var authors = $('.authorName');
    if (authors.length > 0) {
        head_info['authors'] = authors.map(function() {
            return this.outerHTML;
        }).get();
    }
    
    // 
    return head_info;
    
});

new ReferenceExtractor.ReferenceExtractor('sciencedirect', function () {
    
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

new ContactExtractor.ContactExtractor('sciencedirect', function() {
    
    var contact = {};
    
    contact['email'] = $('ul.authorGroup img')        // Find <img> within authorGroup
        .parent('a')                                  // Find containing <a>
        .map(ContactExtractor.clean_addr)             // Clean email address
        .get();                                       // jQuery -> JavaScript
    
    return contact;
        
});


/*
 * @module springer
 * @author jmcarp
 */

new PublisherDetector.TitlePublisherDetector('springer', /springer/i);

new CitationExtractor.CitationExtractor('springer', function () {

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

new ReferenceExtractor.SelectorReferenceExtractor('springer', '#abstract-references li, div.Citation');


/*
 * PLoS module contributed by jmcarp
 */

new PublisherDetector.MetaPublisherDetector('tandf', [
    ['property', 'og:site_name'],
    ['content', 'Taylor and Francis'],
]);

new CitationExtractor.MetaCitationExtractor('tandf');

new ReferenceExtractor.SelectorReferenceExtractor('tandf', 'ul.references > li');


/*
 * @author jmcarp
 */

new PublisherDetector.MetaPublisherDetector('thieme', [
    ['name', 'citation_publisher'],
    ['content', 'Thieme Medical Publishers'],
]);

new CitationExtractor.MetaCitationExtractor('thieme');

new ReferenceExtractor.ReferenceExtractor('thieme', function () {
    return $($('.literaturliste')[0])
        .children('li')
        .filter(function () {
            return $(this).find('h3').length == 0
        });
});


/*
 * @module wiley
 * @author jmcarp
 */
    
new PublisherDetector.TitlePublisherDetector('wiley', /wiley online library/i);

new CitationExtractor.MetaCitationExtractor('wiley');

new ReferenceExtractor.SelectorReferenceExtractor('wiley', 'ul.plain > li');

new ContactExtractor.ContactExtractor('wiley', function() {
    
    var contact = {};
    
    contact['email'] = $('div#authorsDetail').text().
        match(ContactExtractor.email_rgx);
    
    return contact;
        
});

