// Initialize mode <select> to currently stored value
chrome.storage.local.get('mode', function(result) {
    $('#mode').val(result.mode);
});

// Save mode in Chrome storage
$('#submit').click(function() {
    chrome.storage.local.set({mode : $('#mode').val()});
});

// Clear Chrome storage
$('#clear').click(function() {
    chrome.storage.local.clear();
});

// Show progress
chrome.storage.local.get('sent', function(stored) {
    var count = 'sent' in stored ? Object.keys(stored.sent).length : 0;
    $('#progress').text(count + ' articles contributed so far.');
});
