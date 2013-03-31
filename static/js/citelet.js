/*
TODO:
    Add more publishers
*/

/*
Publisher detection rules:
    Dictionary of functions, each of which returns true if the current page
    corresponds to the target publisher, else false.
*/

join_attrs = function(tag, attrs) {
    attr_string = tag;
    for (var k in attrs) {
        attr_string = attr_string + '[' + k + '="' + attrs[k] + '"]'
    }
    return attr_string;
};

var publisher_rules = {
    sciencedirect : function() {
        var title = $('title');
        return title.length && /sciencedirect/i.test(title.html());
    },
    highwire : function () {
        return $('meta[name="HW.identifier"]').length > 0;
    },
    wiley : function () {
        return (join_attrs('meta', {
            name : 'citation_publisher',
            content : 'Wiley Subscription Services, Inc., A Wiley Company',
        })).length > 0;
    },
    plos : function() {
        return $(join_attrs('meta', {
            name : 'citation_publisher',
            content : 'Public Library of Science',
        })).length > 0;
    },
    frontiers : function() {
        return $(join_attrs('meta', {
            name : 'citation_publisher',
            content : 'Frontiers',
        })).length > 0;
    },
    nature : function () {
        return $(join_attrs('meta', {
            name : 'DC.publisher',
            content : 'Nature Publishing Group',
        })).length > 0;
    },
    jama : function() {
        return $(join_attrs('meta', {
            name : 'citation_publisher',
            content : 'American Medical Association',
        })).length > 0;
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
    highwire : head_extract_meta(/DC\.|citation_(?!reference)/, /DC\.|citation_/),
    wiley : head_extract_meta(/DC\.|citation_(?!reference)/, /DC\.|citation_/),
    plos : head_extract_meta(/DC\.citation_(?!reference)/, /DC\.|citation_/),
    frontiers : head_extract_meta(/DC\.citation_(?!reference)/, /DC\.|citation_/),
    nature: head_extract_meta(/DC\.|citation_(?!reference)/, /DC\.|citation_/),
    jama: head_extract_meta(/DC\.|citation_(?!reference)/, /DC\.|citation_/),
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
    highwire : function () {
        return $('ol.cit-list > li');
    },
    wiley : function () {
        return $('ul.plain > li');
    },
    plos : function () {
        return $('ol.references > li');
    },
    frontiers : function () {
        return $('div.References');
    },
    nature : function () {
        return $('ol.references > li');
    },
    jama : function () {
        return $('div.referenceSection div.refRow');
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

/* Extract head reference for a publisher using extraction rules */
extract_head_reference = function(publisher) {
    if (!(publisher in head_ref_extractors)) {
        return false;
    }
    var head_ref = head_ref_extractors[publisher]();
    return JSON.stringify(head_ref);
};

/* Extract references for a publisher using extraction rules */
extract_cited_references = function(publisher) {
    if (!(publisher in cited_ref_extractors)) {
        return false;
    }
    var refs = cited_ref_extractors[publisher]();
    refs = refs.map(function() {
        return $(this).html();
    });
    return JSON.stringify(refs.get());
};

/* Detect publisher */
var publisher = detect_publisher();

/* Extract head reference */
var head_ref_json = extract_head_reference(publisher);

/* Extract cited references */
var cited_refs_json = extract_cited_references(publisher);

/* Send data to server */
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
