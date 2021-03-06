/**
 * Tools for handling citations from the American Medical Association
 *
 * @module ama
 * @author jmcarp
 */

new PublisherDetector.MetaPublisherDetector('ama', [
    ['name', 'citation_publisher'],
    ['content', 'American Medical Association'],
]);

new CitationExtractor.MetaCitationExtractor('ama');

new ReferenceExtractor.SelectorReferenceExtractor(
    'ama',
    'div.referenceSection div.refRow'
);