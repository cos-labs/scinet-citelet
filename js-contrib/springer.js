/**
 * Tools for handling citations from Springer
 *
 * @module springer
 * @author jmcarp
 */

new PublisherDetector.TitlePublisherDetector('springer', /springer/i);

new CitationExtractor.CitationExtractor('springer', function () {

    // Initialize citation info
    var cit = {};

    // Extract article title
    cit['title'] = $('h1.ArticleTitle').text();

    // Extract journal title
    cit['journal_title'] = $('span.JournalTitle').text();

    // Extract DOI
    cit['doi'] = $('span.ArticleDOI').text();

    // Extract author information
    cit['author'] = $('span.AuthorName').map(function () {
        return $(this).text();
    }).get();

    // Return citation info
    return cit;

});

new ReferenceExtractor.SelectorReferenceExtractor(
    'springer',
    '#abstract-references li, div.Citation'
);

new ContactExtractor.SelectorContactExtractor(
    'springer',
    'div.Contact a[href^="mailto:"]'
);