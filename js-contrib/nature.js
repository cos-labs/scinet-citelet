/*
 * @author jmcarp
 */

new PublisherDetector.RegexPublisherDetector('nature', 'meta', [
    ['name', 'dc.publisher'],
    ['content', 'nature publishing group'],
]);

new HeadExtractor.MetaHeadExtractor('nature');

/*
 * Nature has (at least) two article styles: 
 * one (for Nature, Nature Neuroscience, etc.) that uses the 
 * "ol.references > li" format, and a second (for Neuropsychopharmacology, etc.)
 * that uses the "div#References li" format.
 */
new ReferenceExtractor.SelectorReferenceExtractor(
    'nature', 'ol.references > li, div#References li'
);