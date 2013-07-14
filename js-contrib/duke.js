/**
 * Tools for handing citations from Duke University Press
 *
 * @module duke
 * @author jmcarp
 */

new PublisherDetector.MetaPublisherDetector(
    'duke',
    [
        ['name', 'citation_publisher'],
        ['content', 'Duke University Press'],
    ]
);

new CitationExtractor.MetaCitationExtractor('duke');

new ReferenceExtractor.SelectorReferenceExtractor(
    'duke',
    'div#references div.ref-block'
);