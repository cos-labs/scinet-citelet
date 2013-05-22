/**
 * @module PublisherDetector
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

    // Define PublisherDetectors
    
    new PublisherDetector('apa', function() {
        
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
    
    new PublisherDetector('lww', function() {
        return $('a').filter(function() {
            return /Lippincott Williams & Wilkins/.test(this.innerText);
        }).length > 0;
    });
    
    // Define TitlePublisherDetectors
    
    new TitlePublisherDetector('sciencedirect', /sciencedirect/i);
    new TitlePublisherDetector('springer', /springer/i);
    new TitlePublisherDetector('wiley', /wiley online library/i);
    
    // Define MetaPublisherDetectors
    
    new MetaPublisherDetector('highwire', [
        ['name', 'HW.ad-path'],
    ]);
    new MetaPublisherDetector('tandf', [
        ['property', 'og:site_name'],
        ['content', 'Taylor and Francis'],
    ]);
    new MetaPublisherDetector('biomed', [
        ['name', 'citation_publisher'],
        ['content', 'BioMed Central Ltd'],
    ]);
    new MetaPublisherDetector('thieme', [
        ['name', 'citation_publisher'],
        ['content', 'Thieme Medical Publishers'],
    ]);
    new MetaPublisherDetector('pubmed', [
        ['name', 'ncbi_db'],
        ['content', 'pmc'],
    ]);
    new MetaPublisherDetector('royal', [
        ['name', 'DC.Publisher'],
        ['content', 'The Royal Society'],
    ]);
    new MetaPublisherDetector('nas', [
        ['name', 'citation_publisher'],
        ['content', 'National Acad Sciences'],
    ]);
    new MetaPublisherDetector('ovid', [
        ['name', 'Ovid'],
    ], ['^=']);
    new MetaPublisherDetector('frontiers', [
        ['name', 'citation_publisher'],
        ['content', 'Frontiers'],
    ]);
    new MetaPublisherDetector('hindawi', [
        ['name', 'citation_publisher'],
        ['content', 'Hindawi Publishing Corporation'],
    ]);
    new MetaPublisherDetector('ama', [
        ['name', 'citation_publisher'],
        ['content', 'American Medical Association'],
    ]);
    new MetaPublisherDetector('acs', [
        ['name', 'dc.Publisher'],
        ['content', 'American Chemical Society'],
    ]);
    
    // Define RegexPublisherDetectors
    
    new RegexPublisherDetector('mit', 'meta', [
        ['name', 'dc.publisher'],
        ['content', 'mit press'],
    ]);
    new RegexPublisherDetector('nature', 'meta', [
        ['name', 'dc.publisher'],
        ['content', 'nature publishing group'],
    ]);
    
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
        detect : detect,
    };
    
})();
