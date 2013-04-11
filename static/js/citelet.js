/*
TODO:
    Add more publishers
    Write tests
*/

/*
Publisher detection rules:
    Dictionary of functions, each of which returns true if the current page
    corresponds to the target publisher, else false.
*/

/*
Join attributes to build a CSS selector.
Args:
    tag (string) : tag name
    attrs (dict) : attributes
    ops (list) : operators
Returns:
    CSS selector
Example:
    join_attrs('meta', {name : 'publisher', content : 'Wiley'}, ['=', '^='])
    'meta[name="publisher"][content^="Wiley"]'
*/
join_attrs = function(tag, attrs, ops) {
    if (typeof(ops) === 'undefined') ops = ['='];
    var attr_string = tag,
        keys = Object.keys(attrs),
        key, val, op;
    for (var idx = 0; idx < keys.length; idx++) {
        key = keys[idx];
        val = attrs[key];
        op = ops[idx % ops.length];
        attr_string = attr_string + '[' + key + op + '"' + val + '"]';
    }
    return attr_string;
};

var publisher_rules = {
    // ScienceDirect
    sciencedirect : function() {
        return /sciencedirect/i.test($('title').html());
    },
    // Springer
    springer : function () {
        return /springer/i.test($('title').html());
    },
    // Highwire
    highwire : function () {
        return $(join_attrs('meta', {
            name : 'HW.identifier',
        })).length > 0;
    },
    // Wiley
    wiley : function () {
        return $(join_attrs('meta', {
            name : 'citation_publisher',
            content : 'Wiley Subscription Services, Inc., A Wiley Company',
        })).length > 0;
    },
    // Taylor and Francis
    tandf : function () {
        return $(join_attrs('meta', {
            property : 'og:site_name',
            content : 'Taylor and Francis',
        })).length > 0;
    },
    // BioMed Central
    biomed : function () {
        return $(join_attrs('meta', {
            name : 'citation_publisher',
            content : 'BioMed Central Ltd',
        })).length > 0;
    },
    // Thieme Publishers
    thieme : function () {
        return $(join_attrs('meta', {
            name : 'citation_publisher',
            content : 'Thieme Medical Publishers',
        })).length > 0;
    },
    // PubMed Central
    pubmed : function () {
        return $(join_attrs('meta', {
            name : 'ncbi_db',
            content : 'pmc'
        })).length > 0;
    },
    // Royal Society
    royal : function () {
        return $(join_attrs('meta', {
            name : 'DC.Publisher',
            content : 'The Royal Society',
        })).length > 0;
    },
    // National Academy of Sciences
    nas : function () {
        return $(join_attrs('meta', {
            name : 'citation_publisher',
            content : 'National Acad Sciences',
        })).length > 0;
    },
    // MIT Press
    mit : function () {
        return $(join_attrs('meta', {
            name : 'dc.Publisher',
            content : 'MIT Press',
        },
        ['=', '^='])).length > 0;
    },
    // Ovid
    ovid : function () {
        return $(join_attrs('meta', {
            name : 'Ovid',
        }, ['^='])).length > 0;
    },
    // Public Library of Science
    plos : function() {
        return $(join_attrs('meta', {
            name : 'citation_publisher',
            content : 'Public Library of Science',
        })).length > 0;
    },
    // Frontiers
    frontiers : function() {
        return $(join_attrs('meta', {
            name : 'citation_publisher',
            content : 'Frontiers',
        })).length > 0;
    },
    // Hindawi Publishing Corporation
    hindawi : function () {
        $(join_attrs('meta', {
            name : 'citation_publisher',
            content : 'Hindawi Publishing Corporation',
        })).length > 0;
    },
    // Nature Publishing Group
    nature : function () {
        return $(join_attrs('meta', {
            name : 'DC.publisher',
            content : 'Nature Publishing Group',
        })).length > 0;
    },
    // American Medical Association
    ama : function() {
        return $(join_attrs('meta', {
            name : 'citation_publisher',
            content : 'American Medical Association',
        })).length > 0;
    },
    // American Chemical Society
    acs : function () {
        return $(join_attrs('meta', {
            name : 'dc.Publisher',
            content : 'American Chemical Society',
        })).length > 0;
    },
    // American Psychological Association
    apa : function () {
        var pub_dt = $('dt').filter(function () {
            return this.innerHTML == 'Publisher:';
        });
        if (pub_dt.length > 0) {
            var pub_dd = pub_dt.next('dd');
            if (/american psychological association/i.test(pub_dd.text())) {
                return true;
            }
        }
    },
};

/* Extract head reference information from <meta> tags */
head_extract_meta = function(test, replace) {
    return function () {
        var meta = $('meta[name]').filter(function () {
            return test.test(this.name)
        });
        var head_info = {};
        meta.each(function () {
            var name = this.name.replace(replace, '');
            if (!(name in head_info)) {
                head_info[name] = [];
            }
            head_info[name].push(this.content);
        });
        return head_info;
    };
};

/*
Head reference extraction rules:
    Dictionary of functions, each of which returns a dictionary
    of head reference information.
*/
var head_ref_extractors = {
    sciencedirect : function() {
        var head_info = {};
        var ddDoi = $('a#ddDoi');
        var ddlink = ddDoi.attr('href');
        ddlink = ddlink.replace(/.*?dx\.doi\.org.*?\//, '');
        head_info['doi'] = ddlink;
        return head_info;
    },
    springer : function () {
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
    },
    highwire : head_extract_meta(/DC\.|citation_(?!reference)/, /DC\.|citation_/),
    wiley : head_extract_meta(/DC\.|citation_(?!reference)/, /DC\.|citation_/),
    tandf : head_extract_meta(/DC\.|citation_(?!reference)/i, /DC\.|citation_/i),
    biomed : head_extract_meta(/DC\.|citation_(?!reference)/i, /DC\.|citation_/i),
    thieme : head_extract_meta(/DC\.|citation_(?!reference)/i, /DC\.|citation_/i),
    pubmed : head_extract_meta(/DC\.|citation_(?!reference)/i, /DC\.|citation_/i),
    royal : head_extract_meta(/DC\.|citation_(?!reference)/i, /DC\.|citation_/i),
    nas : head_extract_meta(/DC\.|citation_(?!reference)/i, /DC\.|citation_/i),
    mit : head_extract_meta(/DC\.|citation_(?!reference)/i, /DC\.|citation_/i),
    ovid : function () {
        var head_info = {};
        var journal_title = $('div.fulltext-SOURCEFULL').text();
        var split;
        if (journal_title) head_info['Title'] = journal_title;
        $('div#fulltext-source-info div').each(function () {
            split = this.innerText.split(':');
            if (split.length > 1) head_info[split[0]] = split[1];
        });
        return head_info;
    },
    plos : head_extract_meta(/DC\.|citation_(?!reference)/, /DC\.|citation_/),
    frontiers : head_extract_meta(/DC\.|citation_(?!reference)/, /DC\.|citation_/),
    hindawi : head_extract_meta(/DC\.|citation_(?!reference)/i, /DC\.|citation_/i),
    nature : head_extract_meta(/DC\.|citation_(?!reference)/, /DC\.|citation_/),
    ama : head_extract_meta(/DC\.|citation_(?!reference)/i, /DC\.|citation_/i),
    acs : head_extract_meta(/DC\.|citation_(?!reference)/i, /DC\.|citation_/i),
    apa : function () {
        var dts = $('.citation-wrapping-div dt'),
            dds = $('.citation-wrapping-div dd');
        var head_info = {};
        for (var idx = 0; idx < dts.length; idx++) {
            var key = dts[idx].innerHTML.replace(/^:|:$/g, ''),
                val = dds[idx].innerHTML;
            head_info[key] = val;
        }
        return head_info;
    },
};

/*
Reference extraction rules:
    Dictionary of functions, each of which returns a jQuery object
    of references for the target publisher.
*/
var cited_ref_extractors = {
    sciencedirect : function () {
        return $('ul.reference');
    },
    springer : function () {
        return $('div.Citation');
    },
    highwire : function () {
        return $('ol.cit-list > li');
    },
    wiley : function () {
        return $('ul.plain > li');
    },
    tandf : function () {
        return $('ul.references > li');
    },
    biomed : function () {
        return $('ol#references > li');
    },
    thieme : function () {
        return $($('.literaturliste')[0])
            .children('li')
            .filter(function () {
                return $(this).find('h3').length == 0
            });
    },
    pubmed : function () {
        var refs_v1 = $('li[id^="B"]'),
            refs_v2 = $('div.ref-cit-blk');
        return refs_v1.length ? refs_v1 : refs_v2;
    },
    royal : function () {
        return $('ol.cit-list > li');
    },
    nas : function () {
        return $('ol.cit-list > li');
    },
    mit : function () {
        return $('td.refnumber + td');
    },
    ovid : function () {
        return $('p.fulltext-REFERENCES');
    },
    plos : function () {
        return $('ol.references > li');
    },
    frontiers : function () {
        return $('div.References');
    },
    hindawi : function () {
        return $('ol > li[id^="B"]');
    },
    nature : function () {
        return $('ol.references > li');
    },
    ama : function () {
        return $('div.referenceSection div.refRow');
    },
    acs : function () {
        return $('div.NLM_citation');
    },
    apa : function () {
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
    },
};

/* Detect publisher using publisher rules */
detect_publisher = function() {
    for (rule in publisher_rules) {
        if (publisher_rules[rule]()) {
            return rule;
        }
    }
    return false;
};

/*
    Resolve potential conflict in JSON.stringify with Prototype.js; see
    http://stackoverflow.com/questions/710586/json-stringify-bizarreness
*/
var stringify = Object.toJSON ? Object.toJSON : JSON.stringify;

/*
Extract head reference for a publisher using extraction rules
*/
extract_head_reference = function(publisher) {
    if (!(publisher in head_ref_extractors)) {
        return false;
    }
    var head_ref = head_ref_extractors[publisher]();
    return stringify(head_ref);
};

/*
Extract references for a publisher using extraction rules
*/
extract_cited_references = function(publisher) {
    if (!(publisher in cited_ref_extractors)) {
        return false;
    }
    var refs = cited_ref_extractors[publisher]();
    refs = refs.map(function() {
        return $(this).html();
    });
    return stringify(refs.get());
};

/* Detect publisher */
var publisher = detect_publisher();

/* Extract head reference */
var head_ref_json = extract_head_reference(publisher);

/* Extract cited references */
var cited_refs_json = extract_cited_references(publisher);

/*
Send data to server
    Note: Using JSONP instead of JSON to allow cross-domain calls
*/
$.ajax({
    url : 'http://127.0.0.1:5000/sendrefs/',
    dataType : 'jsonp',
    async : false,
    data : {
        publisher : publisher,
        head_ref : head_ref_json,
        cited_refs : cited_refs_json,
    },
    success : function(res) {
        alert(res['msg']);
    },
});
