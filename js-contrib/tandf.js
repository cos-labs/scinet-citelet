/*
 * PLoS module contributed by jmcarp
 */

new PublisherDetector.MetaPublisherDetector('tandf', [
    ['property', 'og:site_name'],
    ['content', 'Taylor and Francis'],
]);

new HeadExtractor.MetaHeadExtractor('tandf');

new ReferenceExtractor.SelectorReferenceExtractor('tandf', 'ul.references > li');