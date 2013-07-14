/**
 * Tools for handling citations from Taylor & Francis
 *
 * @module tandf
 * @author jmcarp
 */

new PublisherDetector.MetaPublisherDetector('tandf', [
    ['property', 'og:site_name'],
    ['content', 'Taylor and Francis'],
]);

new CitationExtractor.MetaCitationExtractor('tandf');

new ReferenceExtractor.SelectorReferenceExtractor(
    'tandf',
    'ul.references > li'
);