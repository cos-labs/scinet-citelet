/*
TODO:
    Add more publishers
*/

/*
Publisher detection rules:
    Dictionary of functions, each of which returns true if the current page
    corresponds to the target publisher, else false.
*/
var publisher_rules = {
    sciencedirect : function() {
        var title = $('title');
        return title.length && /sciencedirect/i.test(title.html());
    },
    oxford : function() {
        return $('meta[content]').filter(function() {
            return /oxford university press/i.test(this.content);
        }).length > 0;
    },
    sage : function() {
        return $('meta[content]').filter(function() {
            return /sage publications/i.test(this.content);
        }).length > 0;
    },
    plos : function() {
        var meta = $('meta[name="citation_journal_abbrev"]');
        return meta && /plos/i.test(meta[0].content);
    },
    frontiers : function() {
        return $('meta[content]').filter(function() {
            return /frontiers/i.test(this.content);
        }).length > 0
    },
};

/* Extract head reference information from <meta> tags */
head_extract_meta = function() {
    var meta = $('meta[name]').filter(function () {
        return /citation_(?!reference)/.test(this.name)
    });
    var head_info = {};
    meta.each(function () {
        var name = this.name.replace(/citation_/, '');
        if (!(name in head_info)) {
            head_info[name] = [];
        }
        head_info[name].push(this.content);
    });
    return head_info;
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
    oxford : head_extract_meta,
    sage : head_extract_meta,
    plos : head_extract_meta,
    frontiers : head_extract_meta,
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
    oxford : function () {
        return $('ol.cit-list > li');
    },
    sage : function () {
        return $('ol.cit-list > li');
    },
    plos : function () {
        return $('ol.references > li');
    },
    frontiers : function () {
        return $('div.References');
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
var head_ref = extract_head_reference(publisher);

/* Extract cited references */
var refs_json = extract_cited_references(publisher);

/* Send data to server */
$.ajax({
    url : 'http://127.0.0.1:5000/sendrefs/',
    dataType : 'jsonp',
    async : false,
    data : {
        publisher : publisher,
        head_ref : head_ref,
        refs : refs_json,
    },
    success : function(res) {
        alert(res['msg']);
    },
});