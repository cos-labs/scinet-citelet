// Modified from http://benalman.com/code/javascript/jquery/jquery.ba-run-code-bookmarklet.js

(function( window, document, req_version, callback, $, script, done, readystate ){
  
    // If jQuery isn't loaded, or is a lower version than specified, load the
    // specified version and call the callback, otherwise just call the callback.
    if ( !($ = window.jQuery) || req_version > $.fn.jquery || callback( $ ) ) {
        
        // Create a script element.
        script = document.createElement( 'script' );
        script.type = 'text/javascript';
        
        // Load the specified jQuery from the Google AJAX API server (minified).
        script.src = '//ajax.googleapis.com/ajax/libs/jquery/' + req_version + '/jquery.min.js';
        
        // When the script is loaded, remove it, execute jQuery.noConflict( true )
        // on the newly-loaded jQuery (thus reverting any previous version to its
        // original state), and call the callback with the newly-loaded jQuery.
        script.onload = script.onreadystatechange = function() {
            if ( !done && ( !( readystate = this.readyState )
                || readystate == 'loaded' || readystate == 'complete' ) ) {
            
                callback( ($ = window.jQuery).noConflict(1), done = 1 );
            
                $( script ).remove();
            }
        };
        
        // Modified by @whatthecarp
        // Loop over document child nodes until reaching a head or body,
        // then append jQuery <script>. Needed to avoid appending to a
        // comment, etc.
        var nodes = document.documentElement.childNodes,
            nodeName;
        for (nodeidx in nodes) {
            nodeName = nodes[nodeidx].nodeName.toLowerCase();
            if (['head', 'body'].indexOf(nodeName) > -1) {
                nodes[nodeidx].appendChild( script );
                break;
            }
        }
        
    }
  
})( window, document,
  
    // Minimum jQuery version required. Change this as-needed.
    '1.9.1',
    
    // Your jQuery code goes inside this callback. $ refers to the jQuery object,
    // and L is a boolean that indicates whether or not an external jQuery file
    // was just "L"oaded.
    function( $, L ) {
        '$:nomunge, L:nomunge'; // Used by YUI compressor.
    
        %s
    
    }
);
