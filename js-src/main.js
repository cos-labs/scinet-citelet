var defer = citelet.scrape();
defer.done(function(data) {
    citelet.send(data);
});