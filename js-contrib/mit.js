/**
 * Tools for handling citations from MIT Press
 *
 * @module mit
 * @author jmcarp
 */

new PublisherDetector.RegexPublisherDetector('mit', 'meta', [
    ['name', 'dc.publisher'],
    ['content', 'mit press'],
]);

new CitationExtractor.MetaCitationExtractor('mit');

new ReferenceExtractor.SelectorReferenceExtractor('mit', 'td.refnumber + td');
