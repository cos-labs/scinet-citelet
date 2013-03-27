// Generate bookmarklet using http://benalman.com/code/test/jquery-run-code-bookmarklet/

/*
TODO:
    Pass serialized HTML to server for processing
    Add publishers
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

/*
Reference extraction rules:
    Dictionary of functions, each of which returns a jQuery object
    of references for the target publisher.
*/
var publisher_extractors = {
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

// Detect publisher using publisher rules
detect_publisher = function() {
    for (rule in publisher_rules) {
        if (publisher_rules[rule]()) {
            return rule;
        }
    }
    return false;
};

// Extract references for a publisher using extraction rules
extract_references = function(publisher) {
    if (!(publisher in publisher_extractors)) {
        return false;
    }
    var refs = publisher_extractors[publisher]();
    refs = refs.map(function() {
        return $(this).html();
    });
    return JSON.stringify(refs.get());
};

// Detect publisher
var publisher = detect_publisher();

// Extract references
var refs_json = extract_references(publisher);

// Print results
alert(publisher);
alert(refs_json);