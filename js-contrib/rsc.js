/**
 * Tools for handling citations from the Royal Society of Chemistry
 *
 * @module rsc
 * @author jmcarp
 */

new PublisherDetector.MetaPublisherDetector('rsc', [
    ['name', 'dc.Publisher'],
    ['content', 'Royal Society of Chemistry'],
]);

new CitationExtractor.MetaCitationExtractor('rsc');

new ReferenceExtractor.SelectorReferenceExtractor(
    'rsc',
    'span[id^="cit"]'
);

new ContactExtractor.SelectorContactExtractor(
    'rsc',
    'span.italic a[href^="mailto:"]'
);