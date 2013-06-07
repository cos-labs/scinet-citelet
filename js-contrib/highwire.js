/*
 * @author jmcarp
 */

new PublisherDetector.MetaPublisherDetector('highwire', [
    ['name', 'HW.ad-path'],
]);

new HeadExtractor.MetaHeadExtractor('highwire');

new ReferenceExtractor.SelectorReferenceExtractor('highwire', 'ol.cit-list > li');