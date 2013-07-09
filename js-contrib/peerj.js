/**
 * Tools for handling citations from PeerJ
 *
 * @module peerj
 * @author jmcarp
 */

new PublisherDetector.MetaPublisherDetector(
    'peerj',
    [
        ['name', 'citation_publisher'],
        ['content', 'PeerJ Inc.'],
    ]
);

new CitationExtractor.MetaCitationExtractor('peerj');

new ReferenceExtractor.SelectorReferenceExtractor(
    'peerj',
    'ul.ref-list li.ref'
)

new ContactExtractor.SelectorContactExtractor(
    'peerj',
    'a.corresp'
)