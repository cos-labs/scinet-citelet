/*
 * @author jmcarp
 */

new PublisherDetector.MetaPublisherDetector('biomed', [
    ['name', 'citation_publisher'],
    ['content', 'BioMed Central Ltd'],
]);

new CitationExtractor.MetaCitationExtractor('biomed');

new ReferenceExtractor.SelectorReferenceExtractor('biomed', 'ol#references > li');
