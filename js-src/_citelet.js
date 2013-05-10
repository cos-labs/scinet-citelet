/*
 * @module citelet
 */

var citelet = (function() {

    /**
     * Resolve potential conflict in JSON.stringify with Prototype.js; see
     * http://stackoverflow.com/questions/710586/json-stringify-bizarreness
     */
    var stringify = Object.toJSON ? Object.toJSON : JSON.stringify;
    
    /**
     * Scrape article meta-data from current page. Because some publishers
     * (read: ScienceDirect) load page data asynchronously, this function returns
     * a $.Deferred object, which returns a dictionary when resolved
     * 
     * @class scrape
     * @static
     * @return {jquery.Deferred}
     */
    function scrape() {
        
        // Build data dictionary
        var data = {};
        
        // Get article URL and publisher
        data['url'] = window.location.href;
        data['publisher'] = PublisherDetector.detect();
        
        if (data['publisher'] !== '') {
        
            // Get article meta-data
            head_ref = HeadExtractor.extract(publisher);
            cited_refs = ReferenceExtractor.extract(publisher);
        
            // Gather deferred objects into a single deferred, which 
            // returns the completed data dictionary
            var defer = $.when(head_ref, cited_refs).pipe(function(head, cited) {
                data['head_ref'] = stringify(head);
                data['cited_refs'] = stringify(cited);
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
    function send(data, _opts) {
        
        // Default options
        var opts = {
            url : 'http://127.0.0.1:5000/sendrefs/',
            data : data,
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
