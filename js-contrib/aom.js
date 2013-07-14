/**
 * Tools for handing citations from Annals of Mathematics
 *
 * @module aom
 * @author jmcarp
 */

new PublisherDetector.TitlePublisherDetector(
    'aom',
    /annals of mathematics/i
);

new CitationExtractor.CitationExtractor('aom', function() {

    var cit = {};

    cit['journal_title'] = 'Annals of Mathematics';

    var title = $('title')
        .text()
        .replace(/\s*\|\s*annals of mathematics.*/i, '');
    if (title)
        cit['title'] = title;

    var author = $('span.author-name')
        .text()
        .replace(/\s*by\s*/i, '');
    if (author)
        cit['author'] = author;

    var year = $('div.entry-meta')
        .text()
        .match(/[12]\d{3}/);
    if (year)
        cit['year'] = year[0];

    var doi = $('div.metadata-headers').filter(function() {
        return $(this).text().match(/^doi$/i);
    }).closest('div.metadata')
        .text()
        .replace(/doi/i, '')
        .trim();
    if (doi)
        cit['doi'] = doi;

    return cit;

});

new ReferenceExtractor.SelectorReferenceExtractor(
    'aom',
    'div#bibliography li'
);