javascript:(function () {
    var script = document.createElement('script');
    script.setAttribute('src', '{{ CITELET_BASE_URL }}/static/js/citelet.min.js');
    document.body.appendChild(script);
 }());