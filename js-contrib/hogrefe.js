/**
 * Tools for handling citations from Hogrefe
 *
 * @module hogrefe
 * @author jmcarp
 */

new PublisherDetector.PublisherDetector('hogrefe', function() {
    return $('div#header')
        .text()
        .match(/hogrefe/i);
});

new CitationExtractor.CitationExtractor('hogrefe', function() {

    var cit = {};

    cit['title'] = $('h3.title').text();

    cit['author'] = $('p.center strong').map(function() {
        return $(this).text();
    }).get();

    cit_parts = $('div[style="font-size: small; float: left;white-space:nowrap;"]')
        .text()
        .split(/\s{2,}/);
    cit['journal_title'] = cit_parts[0];

    var doi = $('div#header')
        .text()
        .match(CitationExtractor.doi_pattern);
    if (doi)
        cit['doi'] = doi[0];

    return cit;

});

new ReferenceExtractor.SelectorReferenceExtractor(
    'hogrefe',
    'p.hang'
);

new ContactExtractor.SelectorContactExtractor(
    'hogrefe',
    'address a[href^="mailto:"]'
);