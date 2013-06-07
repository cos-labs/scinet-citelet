/*
 * @author jmcarp
 */

new PublisherDetector.MetaPublisherDetector('thieme', [
    ['name', 'citation_publisher'],
    ['content', 'Thieme Medical Publishers'],
]);

new HeadExtractor.MetaHeadExtractor('thieme');

new ReferenceExtractor.ReferenceExtractor('thieme', function () {
    return $($('.literaturliste')[0])
        .children('li')
        .filter(function () {
            return $(this).find('h3').length == 0
        });
});
