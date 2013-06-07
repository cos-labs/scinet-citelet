/*
 * @author jmcarp
 */

new PublisherDetector.MetaPublisherDetector('frontiers', [
    ['name', 'citation_publisher'],
    ['content', 'Frontiers'],
]);

new HeadExtractor.MetaHeadExtractor('frontiers');

new ReferenceExtractor.SelectorReferenceExtractor('frontiers', 'div.References');