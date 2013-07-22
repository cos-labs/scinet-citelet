/**
 * ...
 *
 * @module ext
 * @author jmcarp
 */
var ext = (function() {

    // Files to be injected on reference detection
    // if mode === 'confirm'
    var confirm_inject_files = [
        'lib/bootstrap-namespace.css',
        'lib/bootstrap-custom.css',
        'lib/bootstrap.js',
        'lib/bootbox.js',
        'confirm.js',
    ];

    /**
     * Message background page to inject JS / CSS script into
     * content script
     *
     * @class inject
     * @static
     * @param {String} filename local JS / CSS file to inject
     * @returns {jQuery.Deferred} resolves when inject completes
     */
    function inject_script(filename) {

        // Initialize Deferred
        var defer = $.Deferred();

        // Send injected file to background page
        chrome.runtime.sendMessage({
            message : 'inject',
            filename : filename,
        }, function(response) {
            defer.resolve();
        });

        // Return Deferred
        return defer.promise();

    }

    /**
     * Initial function: Get confirmation mode from Chrome
     * storage. Adds the 'doconfirm' field to state.
     * 
     * @class valid_to_stored
     * @static
     * @return {Object} State of extraction process
     */
    function init() {

        var defer = $.Deferred(),
            state = {};

        chrome.storage.local.get('mode', function(stored) {
            
            // Set mode to confirm if not set
            if (typeof(stored.mode) === 'undefined') {
                var stored = {mode : 'confirm'};
                chrome.storage.local.set(stored);
            }

            switch(stored.mode) {
                case 'noconfirm':
                    state.doconfirm = false;
                    defer.resolve(state);
                    break;
                case 'confirm':
                    state.doconfirm = true;
                    defer.resolve(state);
                    break;
                default:
                    return $.Deferred().reject();
                    break;
            }

        });
        
        return defer;

    }
    
    /**
     * Scrape meta-data from current page. Adds 
     * 'data' field to state.
     * 
     * @class valid_to_stored
     * @static
     * @param state {Object} Extension state so far
     * @return {Object} State of extraction process
     */
    function doconfirm_to_scrape(state) {

        // Initialize Deferred
        var defer = $.Deferred();

        // Pipe scrape Deferred to data extractor
        citelet.scrape().done(function(data) {

            // Memorize data
            state.data = data;

            // Resolve
            defer.resolve(state);

        });

        // Return Deferred
        return defer;
    }
    
    /**
     * Check validity of scraped data. If valid, import necessary
     * JS / CSS and continue; else break chain.
     * 
     * @class valid_to_stored
     * @static
     * @param state {Object} Extension state so far
     * @param state.data {Object} Scraped data
     * @return {Object} State of extraction process
     * @return {jQuery.Deferred} Deferred resolving to state
     */
    function scrape_to_valid(state) {

        // Skip if data are incomplete
        if (!state.data['publisher'] ||
                !state.data['citation'] ||
                !state.data['references']) {

            // Break chain by returning a rejected deferred
            return $.Deferred().reject();

        }

        // Check confirmation mode; if true, inject necessary
        // JS / CSS files and return Deferred; else just return state
        if (state.doconfirm) {

            // Initialize Deferred, to be resolved to state when all
            // injections have completed
            var defer = $.Deferred();

            // Create a Deferred for each script to be injected
            var defer_injects = [];
            for (var injidx = 0; injidx < confirm_inject_files.length; injidx++) {
                defer_injects.push(inject_script(confirm_inject_files[injidx]));
            };

            // Resolve Deferred once all injected scripts have finished loading
            $.when.apply($, defer_injects).done(function () {
                defer.resolve(state);
            });

            // Return Deferred resolving to state
            return defer;

        } else {

            // Return state
            return state;

        }

    }
        
    /**
     * Check for reference in Chrome storage. Adds
     * 'sent' field to state.
     * 
     * @class valid_to_stored
     * @static
     * @param state {Object} Extension state so far
     * @param state.data {Object} Scraped data
     * @return {Object} State of extraction process
     */
    function valid_to_stored(state) {

        // Initialize Deferred
        var defer = $.Deferred();

        chrome.storage.local.get(state.data.hash, function(result) {
            if (!(state.data.hash in result)) {
                state.sent = !('hash' in result);
                defer.resolve(state);
            }
        });

        // Return Deferred
        return defer;

    }
    
    /**
     * Check the sent field and get user confirmation. Adds
     * 'confirmed' field to state.
     * 
     * @class confirmed_to_send
     * @static
     * @param state {Object} Extension state so far
     * @param state.data {Object} Scraped data
     * @param state.confirmed {Boolean} Send confirmed?
     * @return {Object} State of extraction process
     */
    function stored_to_confirmed(state) {

        if (state.sent) {

            var defer = $.Deferred();
            var confirm_defer = state.doconfirm ?
                                ext_confirm.confirm_tb() : 
                                $.when(true);
            confirm_defer.done(function(confirmed) {
                state.confirmed = confirmed;
                defer.resolve(state);
            });
            return defer;

        } else {

            console.log('References already sent.');
            // Break chain by returning a rejected deferred
            return $.Deferred().reject();

        }

    }
    
    /**
     * Process confirmation information and send references to server. Adds
     * 'res' field to state.
     * 
     * @class confirmed_to_send
     * @static
     * @param state {Object} Extension state so far
     * @param state.data {Object} Scraped data
     * @param state.confirmed {Boolean} Send confirmed?
     * @return {Object} State of extraction process
     */
    function confirmed_to_send(state) {
        var defer = $.Deferred();
        if (state.confirmed) {
            console.log('Sending references.');
            citelet.send(state.data, {
                source : 'chrome-extension'
            }, 
            {
                success : function(res) {
                    state.res = res;
                    defer.resolve(state);
                }
            });
        } else {
            console.log('Send cancelled.');
            // Break chain by returning a rejected deferred
            return $.Deferred().reject();
        }
        return defer;
    }
    
    /**
     * Process JSON response from server after sending references.
     * 
     * @class send_to_store
     * @static
     * @param state {Object} Extension state so far
     * @param state.res {Object} JSON response
     * @param state.data {Object} Scraped data
     */
    function send_to_store(state) {
        if (state.res.status == 'success') {
            var to_store = {};
            to_store[state.data.hash] = true;
            chrome.storage.local.set(to_store);
        }
    }
    

    /**
     * Main method for the Citelet Chrome extension. Chains together the steps
     * involved in fetching article meta-data and sending them to the Citelet 
     * server.
     * 
     * @class ext
     * @static
     */
    function ext() {
        
        init()                              // Get confirmation mode
            .then(doconfirm_to_scrape)      // Scrape page data
            .then(scrape_to_valid)          // Check data validity
            .then(valid_to_stored)          // Check Chrome storage
            .then(stored_to_confirmed)      // Check confirmation
            .then(confirmed_to_send)        // Send data to server
            .done(send_to_store);           // Store in Chrome
            
    }
    
    // Expose public methods & data

    return {
        ext : ext,
    };

})();
