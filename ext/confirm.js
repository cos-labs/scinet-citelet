/*
 * @module ext_confirm
 */
var ext_confirm = (function() {
    
    /* 
     * Confirmation using JS default
     * 
     * @return {jquery.Deferred} Confirmation status
     */
    function confirm_js() {
        return $.when(confirm('Send references to Citelet?'));
    }
    
    /* 
     * Confirmation using JQueryUI modal dialog
     * 
     * @class confirm_jq
     * @return {jquery.Deferred} Confirmation status
     */
    function confirm_jq() {
        
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
    
    // Expose public methods & data
    
    return {
        confirm_js : confirm_js,
        confirm_jq : confirm_jq,
    };
    
})();