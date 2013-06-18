// Note: Fire extension on window load (rather than document ready)
// to avoid complications with Oxford journals, which hide parts of
// JQueryUI elements on window load.
$(window).load(function(){
    citelet_ext.ext()
});
