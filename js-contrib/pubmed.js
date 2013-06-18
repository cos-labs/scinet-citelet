/*
 * @module pubmed
 * @author jmcarp
 */

new PublisherDetector.MetaPublisherDetector('pubmed', [
    ['name', 'ncbi_db'],
    ['content', 'pmc'],
]);

new CitationExtractor.MetaCitationExtractor('pubmed');

new ReferenceExtractor.ReferenceExtractor('pubmed', function () {
    var refs_v1 = $('li[id^="B"]'),
        refs_v2 = $('div.ref-cit-blk');
    return refs_v1.length ? refs_v1 : refs_v2;
});

new ContactExtractor.ContactExtractor('pubmed', function() {
    
    var contact = {};
    
    contact['email'] = $('ul.authorGroup img')        // Find <img> within authorGroup
        .parent('a')                                  // Find containing <a>
        .map(ContactExtractor.clean_addr)             // Clean email address
        .get();                                       // jQuery -> JavaScript
    
    return contact;
        
});
