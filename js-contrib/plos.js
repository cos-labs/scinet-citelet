/*
 * @author jmcarp
 */
 
// Detect PLoS
new PublisherDetector.MetaPublisherDetector('plos', [
        ['name', 'citation_publisher'],
        ['content', 'Public Library of Science'],
    ]);

// Extract PLoS head reference
new HeadExtractor.MetaHeadExtractor('plos');

// Extract PLoS cited references
new ReferenceExtractor.SelectorReferenceExtractor('plos', 'ol.references > li');