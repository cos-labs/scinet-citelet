/* 
 * @module citelet_ext
 */
var citelet_ext = (function(citelet) {
    
    /* 
     * @class ext
     * @static
     */
    function ext() {
        
        chrome.storage.local.get('mode', function(items) {
            console.log(items.mode);
            if (typeof(items.mode) === 'undefined') {
                var items = {mode : 'confirm'};
                chrome.storage.local.set(items);
            }
            switch(items.mode) {
                case 'noconfirm':
                    ext_inner(false);
                    break;
                case 'confirm':
                    ext_inner(true);
                    break;
            }
        });

    }
    
    function ext_confirm() {
        return $.when(confirm('Send references to Citelet?'));
    }
    
    function ext_confirm_jq() {
        
        var container_id = 'citelet-container';
        var dialog_id = 'citelet-dialog';
        
        // Create dialog <div> if it doesn't exist
        if ($('#' + dialog_id).length == 0) {
            
            // Create container
            var container = document.createElement('div');
            container.setAttribute('id', container_id);
            
            // Create dialog
            var dialog = document.createElement('div');
            dialog.setAttribute('id', dialog_id);
            dialog.setAttribute('title', 'Confirmation');
            dialog.innerText = 'Send references to Citelet?';
            
            // Append dialog to container
            container.appendChild(dialog);
            
            // Append container to body
            document.body.appendChild(container);
            
        }
        
        // Create deferred object
        var defer = $.Deferred();
        
        // Show modal dialog
        $('#' + dialog_id).dialog({
            modal : true,
            appendTo : '#' + container_id,
            buttons : {
                Yes : function() {
                    $(this).dialog('close');
                    defer.resolve(true);
                },
                No : function() {
                    $(this).dialog('close');
                    defer.resolve(false);
                },
            },
        });
        
        // Return deferred object
        return defer;
        
    }
    
    /* 
     * @class ext_inner
     * @static
     * @param do_confirm {Boolean} Confirm before sending?
     */
    function ext_inner(do_confirm) {
        
        // Get reference information from page
        var defer = citelet.scrape();
        
        // Call ext_send() when done
        defer.done(function(data) {
            ext_send(data, do_confirm)
        });
                    
    }
    
    /* 
     * @class ext_send
     * @static 
     * @param data {Object} Data to send
     * @param do_confirm {Boolean} Confirm before sending?
     */
    function ext_send(data, do_confirm) {
        
        // Skip if publisher not found
        if (data['publisher'] === '') {
            return;
        }
        
        // Check for reference information in Chrome storage
        // Send information to server and save in storage if not already stored
        chrome.storage.local.get(data['url'], function(items) {
        
            // Reference information not found in storage
            if (typeof(items[data['url']]) === 'undefined') {
                
                // 
                var confirm_defer = do_confirm ?
                                    ext_confirm_jq() : 
                                    $.when(true);
                
                // 
                confirm_defer.done(function(confirmed) {
                    
                    if (confirmed) {
                        
                        console.log('Sending reference information to server...');

                        // Send reference information to server
                        citelet.send(data, {dataType : 'json'});
            
                        // Store reference information
                        var storage = {};
                        storage[data['url']] = data;
                        chrome.storage.local.set(storage);

                        console.log('Sent reference information to server...');
                                        
                    } else {
                        
                        console.log('Send not confirmed. Quitting...');
                        return;
                        
                    }
                    
                });
                
            } else {
                
                console.log('Not sending; references already sent...');
                
            }
            
        });
        
    };

    
    // Expose public fields

    return {
        ext : ext,
    };

})(citelet);