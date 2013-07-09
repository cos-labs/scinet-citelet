/*
 * @module springer
 * @author jmcarp
 */

new PublisherDetector.TitlePublisherDetector('springer', /springer/i);

new CitationExtractor.CitationExtractor('springer', function () {

    // Initialize info
    var cit = {};

    // Get context information
    var context_div = $('div.ContextInformation');
    context_div.children('span').each(function () {
        key = this.className.replace(/article/i, '');
        val = this.innerText;
        cit[key] = val;
    });

    // Get author information
    cit['authors'] = $('span.AuthorName').map(function () {
        return this.innerText;
    }).get();

    // Done
    return cit;

});

new ReferenceExtractor.SelectorReferenceExtractor(
    'springer',
    '#abstract-references li, div.Citation'
);
