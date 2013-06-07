/*
 * PLoS module contributed by jmcarp
 */
    
new PublisherDetector.TitlePublisherDetector('wiley', /wiley online library/i);

new HeadExtractor.MetaHeadExtractor('wiley');

new ReferenceExtractor.SelectorReferenceExtractor('wiley', 'ul.plain > li');