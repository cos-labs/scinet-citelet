/* 
 * @module citelet_ext
 */
var citelet_ext = (function(citelet) {

    function ext() {
        
        // Get reference information from page
        var data = citelet.scrape();
        
        // Skip if publisher not found
        if (data['publisher'] === '') {
            return;
        }
        
        // Check for reference information in Chrome storage
        // Send information to server and save in storage if not already stored
        chrome.storage.local.get(data['url'], function(items) {
            
            // Reference information not found in storage
            if (Object.keys(items).length == 0) {
                
                console.log('Sending reference information to server...');

                // Send reference information to server
                citelet.send(data, {dataType : 'json'});
                //send(data);
                
                // Store reference information
                var storage = {};
                storage[data['url']] = data;
                chrome.storage.local.set(storage);

                console.log('Sent reference information to server...');
            
            // Reference information found in storage
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
