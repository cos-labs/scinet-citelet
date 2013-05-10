// Initialize mode <select> to currently stored value
var mode = chrome.storage.local.get('mode', function(result) {
    $('#mode').val(result.mode);
});

// Save mode in Chrome storage
$('#submit').click(function() {
    chrome.storage.local.set({mode : $('#mode').val()});
});
