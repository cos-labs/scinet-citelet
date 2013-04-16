var PublisherDetector = (function() {
    
    // Initialize module
    var m = {};
    
    // Private data
    
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
    
    function PublisherDetector(name, fun) {
        this.detect = fun;
        if (typeof(name) !== 'undefined')
            PublisherDetector.registry[name] = this;
    };
    PublisherDetector.registry = {};

    new PublisherDetector('apa', function () {
        var pub_dt = $('dt').filter(function () {
            return this.innerHTML == 'Publisher:';
        });
        if (pub_dt.length > 0) {
            var pub_dd = pub_dt.next('dd');
            if (/american psychological association/i.test(pub_dd.text())) {
                return true;
            }
        }
    });

    function TitlePublisherDetector(name, regex) {
        var fun = function() {
            return regex.test($('title').text())
        };
        PublisherDetector.call(this, name, fun);
    };
    TitlePublisherDetector.prototype = new PublisherDetector;
    TitlePublisherDetector.prototype.constructor = TitlePublisherDetector;

    new TitlePublisherDetector('sciencedirect', /sciencedirect/i);
    new TitlePublisherDetector('springer', /springer/i);

    function MetaPublisherDetector(name, attrs, opers) {
        var fun = function() {
            return $(join_attrs('meta', attrs, opers)).length > 0;
        };
        PublisherDetector.call(this, name, fun);
    };
    MetaPublisherDetector.prototype = new PublisherDetector;
    MetaPublisherDetector.prototype.constructor = MetaPublisherDetector;

    new MetaPublisherDetector('highwire', {
        name : 'HW.identifier'
    });
    new MetaPublisherDetector('tandf', {
        property : 'og:site_name',
        content : 'Taylor and Francis',
    });
    new MetaPublisherDetector('wiley', {
        name : 'citation_publisher',
        content : 'Wiley Subscription Services, Inc., A Wiley Company',
    });
    new MetaPublisherDetector('biomed', {
        name : 'citation_publisher',
        content : 'BioMed Central Ltd',
    });
    new MetaPublisherDetector('thieme', {
        name : 'citation_publisher',
        content : 'Thieme Medical Publishers',
    });
    new MetaPublisherDetector('pubmed', {
        name : 'ncbi_db',
        content : 'pmc',
    });
    new MetaPublisherDetector('royal', {
        name : 'DC.Publisher',
        content : 'The Royal Society',
    });
    new MetaPublisherDetector('nas', {
        name : 'citation_publisher',
        content : 'National Acad Sciences',
    });
    new MetaPublisherDetector('mit', {
        name : 'dc.Publisher',
        content : 'MIT Press',
    }, ['=', '^=']);
    new MetaPublisherDetector('ovid', {
        name : 'Ovid',
    }, ['^=']);
    new MetaPublisherDetector('plos', {
        name : 'citation_publisher',
        content : 'Public Library of Science',
    });
    new MetaPublisherDetector('frontiers', {
        name : 'citation_publisher',
        content : 'Frontiers',
    });
    new MetaPublisherDetector('hindawi', {
        name : 'citation_publisher',
        content : 'Hindawi Publishing Corporation',
    });
    new MetaPublisherDetector('nature', {
        name : 'DC.publisher',
        content : 'Nature Publishing Group',
    });
    new MetaPublisherDetector('ama', {
        name : 'citation_publisher',
        content : 'American Medical Association',
    });
    new MetaPublisherDetector('acs', {
        name : 'dc.Publisher',
        content : 'American Chemical Society',
    });
    
    // Public data
    
    m.detect = function() {
        for (publisher in PublisherDetector.registry) {
            if (PublisherDetector.registry[publisher].detect())
                return publisher;
        }
        return false;
    }
    
    // Return module
    return m;
    
})();