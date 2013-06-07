/*
 * @author jmcarp
 */

new PublisherDetector.MetaPublisherDetector('acs', [
    ['name', 'dc.Publisher'],
    ['content', 'American Chemical Society'],
]);

new HeadExtractor.MetaHeadExtractor('acs');

new ReferenceExtractor.SelectorReferenceExtractor('acs', 'div.NLM_citation');