ORGANIZATION_LIST_URL = "http://107.170.102.176/scinet/getgroups/"

// Initialize mode <select> to currently stored value
function get_mode() {
    chrome.storage.local.get('mode', function(result) {

        // Set mode to confirm if not set
        if (typeof(result.mode) === 'undefined') {
            var result = {mode : 'confirm'};
            chrome.storage.local.set(result);
        }
        
        // Set dropdown value
        $('#mode').val(result.mode);

    });
}

function get_organization() {
    chrome.storage.local.get('organization', function(result) {
        $('#test-organization').val(result.organization);
    });
}

// Show progress
function get_progress() {
    chrome.storage.local.get('sent', function(stored) {
        var count = 'sent' in stored ? Object.keys(stored.sent).length : 0;
        $('#progress').text(count + ' articles contributed so far.');
    });
}

function get_org_progress() {
        //TODO make dynamic
    chrome.storage.local.get('org_sent', function(stored) {
        var org_count = 'org_sent' in stored ? Object.keys(stored.org_sent).length : "NOT YET AVAILABLE";
        $('#org_progress').text(org_count + ' articles contributed so far by your organization.');

    });
}

function init() {
    get_mode();
    get_organization();
    get_progress();
    get_org_progress();
}

//
init();

// Set up event handlers

// Save mode in Chrome storage
$('#submit').click(function() {
    chrome.storage.local.set({mode : $('#mode').val()});
    chrome.storage.local.set({organization: $('#organization').val()});

});

// Refresh options data
$('#refresh').click(function() {
    init();
        chrome.storage.local.get('organization', function(result){
        $('#test-organization').text(result.organization);
    });
});

// Clear Chrome storage
$('#clear').click(function() {
    chrome.storage.local.clear(function() {
        init();
    });
});

$(document).ready(function() {

    getOptions('organization');

    function getOptions(ddId) {
        var dd = $('#' + ddId);

        $.getJSON(ORGANIZATION_LIST_URL, function(opts) {
            if(opts) {
                //opts.forEach(function(organization){
                //    alert(organization["_id"]);
                //});
                $.each(opts, function(organization) {
                    console.log(opts[organization]["name"]);
                    dd.append($('<option/>').val(organization).text(opts[organization]["name"]));
                });
            }
        });
    }

});
