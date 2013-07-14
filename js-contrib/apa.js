/**
 * Tools for handling citations from the American Psychological Association
 *
 * @module apa
 * @author jmcarp
 */

new PublisherDetector.PublisherDetector('apa-ebsco', function() {

    // Test source paragraph
    var source_par = $('p.body-paragraph').filter(function() {
        return /source:/i.test(this.innerText);
    });
    if (/american psychological association/i.test(source_par.text())) {
        return true;
    };

});

new CitationExtractor.CitationExtractor('apa-ebsco', function() {

    // Initialize citation info
    var cit = {};

    cit['doi'] = $('p.body-paragraph').filter(function() {
        return $(this).text().match(/digital object identifier:\s\S+/i);
    }).text()
        .match(/digital object identifier:\s\S+/i)
        .map(function(match) {
                return match.replace(/digital object identifier:\s/i, '');
        });

    cit['title'] = $('title')
        .text()
        .replace(/ebscohost:\s/i, '')
        .trim();

    cit['author'] = $('div.center strong')
        .map(function() {
            return this.innerText.replace(/by:\s/i, '')
        }).get();

    // Return citation info
    return cit;

    /*
    //
    var dts = $('.citation-wrapping-div dt, .short-citation dt'),
        dds = $('.citation-wrapping-div dd, .short-citation dd');

    //
    var head_info = {};
    for (var idx = 0; idx < dts.length; idx++) {
        var key = dts[idx].innerHTML.replace(/^:|:$/g, ''),
            val = dds[idx].innerHTML;
        head_info[key] = val;
    }

    //
    return head_info;
    */

});

new ReferenceExtractor.ReferenceExtractor('apa-ebsco', function() {

    // Get link at top of references section
    var ref_link = $('a[title="References"][href="#toc"]');

    // Quit if no references link
    if (ref_link.length == 0) return false;

    // Get link parent span
    ref_span = ref_link.parent('span');

    // Quit if no parent span
    if (ref_span.length == 0) return false;

    // Get references
    var refs = ref_span.nextAll('p.body-paragraph');

    // Remove non-reference text
    refs = refs.filter(function () {
        return (!/this publication is protected/i.test(this.innerHTML)) &&
               (!/submitted.*?revised.*?accepted/i.test(this.innerHTML));
    });

    // Return references
    if (refs.length)
        return refs;

});

new PublisherDetector.PublisherDetector('apa-psycnet', function() {

    // Test copyright line
    var copyright_line = $('div.articleCopyrightLine');
    if (/american psychological association/i.test(copyright_line.text())) {
        return true;
    };

    return false;

});

new CitationExtractor.CitationExtractor('apa-psycnet', function() {

    // Initialize citation info
    var cit = {};

    // Get DOI
    cit['doi'] = $('div.articleCitationContainer')
        .text()
        .match(/doi:\S+/)
        .map(function(match) {
            return match.replace('doi:', '')
        });

    // Get title
    cit['title'] = $('meta[name="title"]')
        .attr('content')
        .trim();

    // Get journal
    cit['journal_title'] = $('ul#ftJournalTitle')
        .text()
        .trim();

    // Get authors
    cit['author'] = $('p.authorGroup a[href^="/index.cfm"]').map(function() {
        return this.innerText
    }).get();

    // Return citation info
    return cit;

});

new ReferenceExtractor.SelectorReferenceExtractor(
    'apa-psycnet',
    'ul.referenceList li[id^="c"]'
);