/*
 * @author jmcarp
 */

new PublisherDetector.MetaPublisherDetector('biomed', [
    ['name', 'citation_publisher'],
    ['content', 'BioMed Central Ltd'],
]);

new HeadExtractor.MetaHeadExtractor('biomed');

new ReferenceExtractor.SelectorReferenceExtractor('biomed', 'ol#references > li');