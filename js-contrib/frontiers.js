/*
 * @module frontiers
 * @author jmcarp
 */

new PublisherDetector.MetaPublisherDetector('frontiers', [
    ['name', 'citation_publisher'],
    ['content', 'Frontiers'],
]);

/* Frontiers stores author information in their abstract pages,
 * but not in their full text pages. To get author info, we extract
 * the other parameters as usual and append the author names from the
 * 'div.authors a' elements.
 */
new CitationExtractor.CitationExtractor(
    'frontiers',
    function() {

        // Extract information from meta tags
        var cit = CitationExtractor.meta_extract();

        // Add authors
        var author = $('div.authors a[href]').map(function() {
            return $(this).text()
        });

        // jQuery -> JavaScript
        author = author.get();

        // Add author info to citation
        cit['author'] = author;

        // Return citation
        return cit;

    }
);

new ReferenceExtractor.SelectorReferenceExtractor(
    'frontiers',
    'div.References'
);

new ContactExtractor.ContactExtractor('frontiers', function() {

    var email = $('div.AbstractSummary').text().match(email_rgx);
    
    return {
        email : email,
    };
    
});