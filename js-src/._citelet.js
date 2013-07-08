/**
 * Main citelet module: extract data and send to service
 *
 * @module citelet
 * @author jmcarp
 */

var citelet = (function() {

    /**
     * Resolve potential conflict in JSON.stringify with Prototype.js; see
     * http://stackoverflow.com/questions/710586/json-stringify-bizarreness
     */
    var stringify = Object.toJSON ? Object.toJSON : JSON.stringify;
    
    /**
     * ...
     *
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
     * a $.Deferred object, which returns a dictionary when resolved.
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
            url : 'http://__url__/sendrefs/',
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
    
    // Expose public methods and data

    return {
        scrape : scrape,
        send : send,
    }

})();
