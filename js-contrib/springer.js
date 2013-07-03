/*
 * @module springer
 * @author jmcarp
 */

new PublisherDetector.TitlePublisherDetector('springer', /springer/i);

new CitationExtractor.CitationExtractor('springer', function () {

    // Initialize info
    var head_info = {};

    // Get context information
    var context_div = $('div.ContextInformation');
    context_div.children('span').each(function () {
        key = this.className.replace(/article/i, '');
        val = this.innerText;
        head_info[key] = val;
    });

    // Get author information
    head_info['authors'] = $('span.AuthorName').map(function () {
        return this.innerText;
    }).get();

    // Done
    return head_info;

});

new ReferenceExtractor.SelectorReferenceExtractor(
    'springer',
    '#abstract-references li, div.Citation'
);
