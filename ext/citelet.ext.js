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
            //ext_send(data, do_confirm)
            
            // Skip if publisher not found
            if (data['publisher'] === '') {
                return;
            }
            
            var chain = $.Deferred();
            chrome.storage.local.get(data['url'], function(items) {
                chain.resolve(items);
            });
    
            chain.pipe(function(items) {
                if (typeof(items[data['url']]) === 'undefined') {
                    return confirm_defer = do_confirm ?
                                           ext_confirm_jq() : 
                                           true
                } else {
                    console.log('References already sent. Quitting...');
                    return false
                }
            }).pipe(function(confirmed) {
                var defer = $.Deferred();
                if (confirmed) {
                    console.log('Sending references...');
                    citelet.send(data, {
                        dataType : 'json',
                        success : function(res) {
                            defer.resolve(res);
                        }
                    });
                } else {
                    console.log('Not confirmed. Quitting...');
                    defer.resolve({});
                }
                return defer;
            }).done(function(res) {
                if (res.status == 'success') {
                    console.log('Storing references in Chrome...');
                    var storage = {};
                    storage[data['url']] = data;
                    chrome.storage.local.set(storage);
                }
            });
    
        });
                    
    }
    
    // Expose public fields

    return {
        ext : ext,
    };

})(citelet);