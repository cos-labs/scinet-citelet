/**
 * Main citelet module: Extract data and send to service
 *
 * @module citelet
 * @author jmcarp
 */

var citelet = (function() {

    // Ping server with hash code before sending full payload?
    //var do_ping = false;

    /**
     * Resolve potential conflict in JSON.stringify with Prototype.js; see
     * http://stackoverflow.com/questions/710586/json-stringify-bizarreness
     */
    var stringify = Object.toJSON ? Object.toJSON : JSON.stringify;
    
    /**
     * Get reasonable truthiness for arrays / dictionaries
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
     * Hash complete JSON structure, excluding specified keys
     *
     * @class hash
     * @static
     * @param {String} string to hash
     * @skipkeys {Array} list of keys to skip
     * @return {String} hashed string
     */
    function hash(obj, skipkeys) {

        // Default value of skipkeys
        skipkeys = skipkeys || ['url'];

        // Initialize
        var keys = Object.keys(obj);
        var hobj = {};

        // Copy object w/o skipped keys
        for (var key in obj) {
            if (skipkeys.indexOf(key) === -1)
                hobj[key] = obj[key];
        }

        // Object -> JSON-formatted string
        var sobj = stringify(hobj).toLowerCase();

        // Hash string
        return CryptoJS.SHA3(sobj).toString();

    }

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

                // Add hash
                data.hash = hash(data);

                // Return completed data
                return data;

            });

            // Optionally ping Scholar server with hash code
            if (cfg.PING === 'true') {
                defer = defer.pipe(ping);
            }
            
            // Return deferred object
            return defer;
        
        } else {
            
            return $.when(data);
            
        }
        
    }

    /**
     * Send hash code to server to check uniqueness
     *
     * @class ping
     * @static
     * @param {Object} data from scrape()
     * @returns {jQuery.Deferred} contains data (if resp === 'true)
     * @returns {jQuery.Deferred} contains reject (if resp !== 'true')
     */

    function ping(data) {

        // Initialize Deferred; resolves to data if payload should be sent,
        // else rejected
        var result = $.Deferred();
        
        // Append a span indicating that article is valid
        $('<span id="citeletPublisher"></span>').appendTo('body')

        $.ajax({
            url : cfg.CITELET_BASE_URL + '/ping/',
            type : 'POST',
            data : {
                hash : data.hash,
            },
            success : function(resp) {

                // Check status
                if (resp === 'true') {
                    // Continue sending
                    console.log('Ping accepted.')
                    result.resolve(data);
                } else {
                    // Break Deferred chain
                    console.log('Ping rejected.')
                    return $.Deferred().reject();
                }

            },
            error : function() {
                // Break Deferred chain
                console.log('Ping rejected.')
                return $.Deferred().reject();
            },
        });

        // Return Deferred
        return result;

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
            url : cfg.CITELET_BASE_URL + '/sendrefs/',
            type : 'POST',
            data : aug_data,
            success : function(resp) {
                console.log(resp['msg']);
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
