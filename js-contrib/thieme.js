/**
 * Tools for handling citations from Thieme
 *
 * @module thieme
 * @author jmcarp
 */

new PublisherDetector.MetaPublisherDetector('thieme', [
    ['name', 'citation_publisher'],
    ['content', 'Thieme Medical Publishers'],
]);

new CitationExtractor.MetaCitationExtractor('thieme');

new ReferenceExtractor.ReferenceExtractor('thieme', function () {
    return $($('.literaturliste')[0])
        .children('li')
        .filter(function () {
            return $(this).find('h3').length == 0;
        });
});

new ContactExtractor.SelectorContactExtractor(
    'thieme',
    'a.anchorb[href^="mailto:"]'
);