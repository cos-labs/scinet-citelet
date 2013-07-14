/**
 * Confirmation dialog tools
 *
 * @module ext_confirm
 * @author jmcarp
 */
var ext_confirm = (function() {
    
    var msg = 'Send references to Citelet?';
    
    /**
     * Create confirmation dialog using JS default
     * 
     * @class confirm_js
     * @static
     * @return {$.Deferred} Deferred true / false confirmation response
     */
    function confirm_js() {
        return $.when(confirm(msg));
    }
    
    /**
     * Create confirmation dialog using Twitter Bootstrap
     * 
     * @class confirm_tb
     * @static
     * @return {$.Deferred} Deferred true / false confirmation response
     */
    function confirm_tb() {
        
        // Append Citelet container <div>
        if ($('.citelet').length == 0) {
            $('<div id="citelet"></div>').appendTo('body');
        }
        
        // Hack: Clear keydown events
        // Fixes bug on PLoS journals
        var script = document.createElement('script');
        script.textContent = '$(document).off("keydown");';
        (document.head || document.documentElement).appendChild(script);
        script.parentNode.removeChild(script);
        
        // Build prompt message
        
        // Prompt container
        var prompt_div = document.createElement('div');
        
        // Main message
        var msg_div = document.createElement('div');
        msg_div.textContent = msg;
        
        // Text for extension options
        var opt_div = document.createElement('div');
        opt_div.textContent = 'Don\'t want to see this? ';
        opt_div.style.fontSize = '0.8em';
        
        // Link to extension options
        var opt_link = document.createElement('a');
        opt_link.textContent = 'Change confirmation settings.';
        opt_link.href = chrome.extension.getURL('options.html');
        opt_link.target = '_blank';
        
        // Putting it together
        opt_div.appendChild(opt_link);
        prompt_div.appendChild(msg_div);
        prompt_div.appendChild(opt_div);
        
        // Create deferred object
        var defer = $.Deferred();
        
        // Create confirmation dialog
        bootbox.confirm(prompt_div, function(result) {
            defer.resolve(result);
        });
        
        // Return deferred object
        return defer;
        
    }
    
    // Expose public methods & data
    
    return {
        confirm_js : confirm_js,
        confirm_tb : confirm_tb,
    };
    
})();
