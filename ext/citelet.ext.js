/* 
 * @module citelet_ext
 */
var citelet_ext = (function() {
    
    function init() {
        var defer = $.Deferred();
        var state = {};
        chrome.storage.local.get('mode', function(stored) {
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
    
    function doconfirm_to_scrape(state) {
        var defer = $.Deferred();
        citelet.scrape().done(function(data) {
            state.data = data;
            defer.resolve(state);
        });
        return defer;
    }
    
    function scrape_to_valid(state) {
        // Skip if publisher not found
        if (state.data['publisher'] === '') {
            // Break chain by returning a rejected deferred
            return $.Deferred().reject();
        }
        return state;
    }
        
    /* 
     * Check for reference in Chrome storage. Adds
     * 'sent' field to state.
     * 
     * @class valid_to_stored
     * @static
     * @param state {Object} Extension state so far
     * @param state.data {Object} Scraped data
     */
    function valid_to_stored(state) {
        var defer = $.Deferred();
        chrome.storage.local.get('sent', function(storage) {
            var _sent = 'sent' in storage ? storage.sent : {};
            state.sent = typeof(_sent[state.data['url']]) === 'undefined';
            defer.resolve(state);
        });
        return defer;
    }
    
    /* 
     * Check the sent field and get user confirmation. Adds
     * 'confirmed' field to state.
     * 
     * @class confirmed_to_send
     * @static
     * @param state {Object} Extension state so far
     * @param state.data {Object} Scraped data
     * @param state.confirmed {Boolean} Send confirmed?
     */
    function stored_to_confirmed(state) {
        if (state.sent) {
            var defer = $.Deferred();
            var confirm_defer = state.doconfirm ?
                                ext_confirm.confirm_jq() : 
                                $.when(true);
            confirm_defer.done(function(confirmed) {
                state.confirmed = confirmed;
                defer.resolve(state);
            });
            return defer;
        } else {
            console.log('References already sent. Quitting...');
            // Break chain by returning a rejected deferred
            return $.Deferred().reject();
        }
    }
    
    /* 
     * Process confirmation information and send references to server. Adds
     * 'res' field to state.
     * 
     * @class confirmed_to_send
     * @static
     * @param state {Object} Extension state so far
     * @param state.data {Object} Scraped data
     * @param state.confirmed {Boolean} Send confirmed?
     */
    function confirmed_to_send(state) {
        var defer = $.Deferred();
        if (state.confirmed) {
            console.log('Sending references...');
            citelet.send(state.data, {
                dataType : 'json',
                success : function(res) {
                    state.res = res;
                    defer.resolve(state);
                }
            });
        } else {
            console.log('Not confirmed. Quitting...');
            // Break chain by returning a rejected deferred
            return $.Deferred().reject();
        }
        return defer;
    }
    
    /* 
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
            console.log('Storing references in Chrome...');
            chrome.storage.local.get('sent', function(storage) {
                var sent = 'sent' in storage ? storage.sent : {};
                sent[state.data['url']] = state.data;
                chrome.storage.local.set({'sent' : sent});
            });
        }
    }
    

    /* 
     * Main method for the Citelet Chrome extension. Chains together the steps
     * involved in fetching article meta-data and sending them to the Citelet 
     * server.
     * 
     * @class ext
     * @static
     */
    function ext() {
        
        init()
            .then(doconfirm_to_scrape)
            .then(scrape_to_valid)
            .then(valid_to_stored)
            .then(stored_to_confirmed)
            .then(confirmed_to_send)
            .done(send_to_store);
            
    }
    
    // Expose public methods & data

    return {
        ext : ext,
    };

})();