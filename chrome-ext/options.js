// Initialize mode <select> to currently stored value
function get_mode() {
    chrome.storage.local.get('mode', function(result) {
        $('#mode').val(result.mode);
    });
}

// Show progress
function get_progress() {
    chrome.storage.local.get('sent', function(stored) {
        var count = 'sent' in stored ? Object.keys(stored.sent).length : 0;
        $('#progress').text(count + ' articles contributed so far.');
    });
}

function init() {
    get_mode();
    get_progress();
}

//
init();

// Set up event handlers

// Save mode in Chrome storage
$('#submit').click(function() {
    chrome.storage.local.set({mode : $('#mode').val()});
});

// Refresh options data
$('#refresh').click(function() {
    init();
});

// Clear Chrome storage
$('#clear').click(function() {
    chrome.storage.local.clear(function() {
        init();
    });
});
