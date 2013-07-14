/**
 * Tools for handling citations from PLoS
 *
 * @module plos
 * @author jmcarp
 */
 
// Detect PLoS
new PublisherDetector.MetaPublisherDetector('plos', [
        ['name', 'citation_publisher'],
        ['content', 'Public Library of Science'],
    ]);

// Extract PLoS citation
new CitationExtractor.MetaCitationExtractor('plos');

// Extract PLoS references
new ReferenceExtractor.MultiReferenceExtractor(
    'plos',
    new ReferenceExtractor.SelectorReferenceExtractor('', 'ol.references > li'),
    new ReferenceExtractor.SelectorReferenceExtractor('', 'meta[name="citation_reference"]')
);

// Extract PLoS contacts
new ContactExtractor.SelectorContactExtractor(
    'plos',
    'div.author_meta a[href^="mailto:"]'
);