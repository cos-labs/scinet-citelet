/*
 * @author jmcarp
 */

new PublisherDetector.MetaPublisherDetector('nas', [
    ['name', 'citation_publisher'],
    ['content', 'National Acad Sciences'],
]);

new HeadExtractor.MetaHeadExtractor('nas');

new ReferenceExtractor.SelectorReferenceExtractor('nas', 'ol.cit-list > li');