/*
 * @author jmcarp
 */

new PublisherDetector.MetaPublisherDetector('royal', [
    ['name', 'DC.Publisher'],
    ['content', 'The Royal Society'],
]);

new HeadExtractor.MetaHeadExtractor('royal');

new ReferenceExtractor.SelectorReferenceExtractor('royal', 'ol.cit-list > li');