/*
 * @module iop
 * @author jmcarp
 */

new PublisherDetector.MetaPublisherDetector(
    'iop',
    [
        ['name', 'citation_publisher'],
        ['content', 'IOP Publishing'],
    ]
);

new CitationExtractor.MetaCitationExtractor('iop');

new ReferenceExtractor.SelectorReferenceExtractor(
    'iop',
    'dl.citationlist cite:visible'
)

new ContactExtractor.SelectorContactExtractor(
    'iop',
    'div.affiliations a[href^="mailto:"]'
)