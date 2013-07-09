/**
 * Tools for handling citations from Ovid
 *
 * @module ovid
 * @author jmcarp
 */

new PublisherDetector.MetaPublisherDetector('ovid', [
    ['name', 'Ovid'],
], ['^=']);

new CitationExtractor.CitationExtractor('ovid', function () {
    var head_info = {};
    var journal_title = $('div.fulltext-SOURCEFULL').text();
    var split;
    if (journal_title) head_info['Title'] = journal_title;
    $('div#fulltext-source-info div').each(function () {
        split = this.innerText.split(':');
        if (split.length > 1) head_info[split[0]] = split[1];
    });
    return head_info;
});

new ReferenceExtractor.SelectorReferenceExtractor('ovid', 'p.fulltext-REFERENCES');
