/**
 * Non-persistent background page
 */

// Message listener
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

    if (request.message === 'inject') {

        var extension = request.filename.split('.').slice(-1);

        // Choose appropriate Chrome function for injection
        var fun = {
            'js' : chrome.tabs.executeScript,
            'css' : chrome.tabs.insertCSS,
        }[extension];

        // Call function; null indicates current tab; callback must
        // send a response, else injection Deferred() will never resolve
        fun(
            null,
            {file : request.filename},
            function() {
                sendResponse({farewell : 'injected'});
            }
        );
    }

    //
    return true;

});