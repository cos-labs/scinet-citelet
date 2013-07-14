/**
 * Tools for handling citations from Pubmed Central
 *
 * @module pubmed
 * @author jmcarp
 */

new PublisherDetector.MetaPublisherDetector('pubmed', [
    ['name', 'ncbi_db'],
    ['content', 'pmc'],
]);

new CitationExtractor.MetaCitationExtractor('pubmed');

new ReferenceExtractor.ReferenceExtractor('pubmed', function () {

    // List reference selectors
    var selectors = [
        'div#reference-list li[id^="R"]',
        'div#reference-list li[id^="B"]',
        'div#reference-list div.ref-cit-blk',
    ];

    // Loop over selectors until match
    for (var selidx = 0; selidx < selectors.length; selidx++) {
        var refs = $(selectors[selidx]);
        if (refs.length)
            return refs;
    }

});

new ContactExtractor.SelectorContactExtractor(
    'pubmed',
    'div.fm-authors-info a[href^="mailto:"]'
);