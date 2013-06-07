/*
 * @author jmcarp
 */

new PublisherDetector.RegexPublisherDetector('mit', 'meta', [
    ['name', 'dc.publisher'],
    ['content', 'mit press'],
]);

new HeadExtractor.MetaHeadExtractor('mit');

new ReferenceExtractor.SelectorReferenceExtractor('mit', 'td.refnumber + td');