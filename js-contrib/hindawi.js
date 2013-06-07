/*
 * @author jmcarp
 */

new PublisherDetector.MetaPublisherDetector('hindawi', [
    ['name', 'citation_publisher'],
    ['content', 'Hindawi Publishing Corporation'],
]);

new HeadExtractor.MetaHeadExtractor('hindawi');

new ReferenceExtractor.SelectorReferenceExtractor('hindawi', 'ol > li[id^="B"]');