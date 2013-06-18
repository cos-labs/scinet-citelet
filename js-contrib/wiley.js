/*
 * @module wiley
 * @author jmcarp
 */
    
new PublisherDetector.TitlePublisherDetector('wiley', /wiley online library/i);

new CitationExtractor.MetaCitationExtractor('wiley');

new ReferenceExtractor.SelectorReferenceExtractor('wiley', 'ul.plain > li');

new ContactExtractor.ContactExtractor('wiley', function() {
    
    var contact = {};
    
    contact['email'] = $('div#authorsDetail').text().
        match(ContactExtractor.email_rgx);
    
    return contact;
        
});
