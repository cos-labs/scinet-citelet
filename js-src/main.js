/*var defer = citelet.scrape();
defer.done(function(data) {
    citelet.send(data, {
        source : 'bookmarklet'
    });
});*/
citelet.scrape().done(function(data) {
    citelet.send(data, {
        source : 'bookmarklet'
    });
});
