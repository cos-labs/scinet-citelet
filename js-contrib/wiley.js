/**
 * Tools for handling citations from Wiley
 *
 * @module wiley
 * @author jmcarp
 */
    
new PublisherDetector.TitlePublisherDetector('wiley', /wiley online library/i);

new CitationExtractor.MetaCitationExtractor('wiley');

new ReferenceExtractor.SelectorReferenceExtractor('wiley', 'ul.plain > li');

new ContactExtractor.RegexContactExtractor(
    'wiley',
    'div#authorsDetail'
);