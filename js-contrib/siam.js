/**
 * Tools for handing citations from Society for Industrial and Applied Mathematics
 *
 * @module siam
 * @author jmcarp
 */

new PublisherDetector.MetaPublisherDetector(
    'siam',
    [
        ['name', 'dc.Publisher'],
        ['content', 'Society for Industrial and Applied Mathematics'],
    ]
);

new CitationExtractor.MetaCitationExtractor('siam');

new ReferenceExtractor.SelectorReferenceExtractor(
    'siam',
    'div.abstractReferences li.reference'
);