/**
 * Tools for handing citations from eLife
 *
 * @module elife
 * @author jmcarp
 */

new PublisherDetector.MetaPublisherDetector(
    'elife',
    [
        ['name', 'citation_publisher'],
        ['content', 'eLife Sciences Publications Limited'],
    ]
);

new CitationExtractor.MetaCitationExtractor('elife');

new ReferenceExtractor.MultiReferenceExtractor(
    'elife',
    new ReferenceExtractor.SelectorReferenceExtractor('', 'div.elife-reflink-main'),
    new ReferenceExtractor.SelectorReferenceExtractor('', 'meta[name="citation_reference"]')
)

new ContactExtractor.ContactExtractor('elife', function() {

    var email = $('img.corresp-icon')
        .parent('a')
        .map(ContactExtractor.clean_addr)
        .get();

    return {
        email : email,
    };

});
