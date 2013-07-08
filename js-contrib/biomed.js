/**
 * Tools for handling citations from BioMed Central
 *
 * @module biomed
 * @author jmcarp
 */

new PublisherDetector.MetaPublisherDetector('biomed', [
    ['name', 'citation_publisher'],
    ['content', 'BioMed Central Ltd'],
]);

new CitationExtractor.MetaCitationExtractor('biomed');

new ReferenceExtractor.SelectorReferenceExtractor('biomed', 'ol#references > li');
