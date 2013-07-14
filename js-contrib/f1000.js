/**
 * Tools for handing citations from Faculty of 1000 Research
 *
 * @module f1000
 * @author jmcarp
 */
    
new PublisherDetector.TitlePublisherDetector(
    'f1000', 
    /f1000research/i
);

new CitationExtractor.MetaCitationExtractor('f1000');

new ReferenceExtractor.SelectorReferenceExtractor(
    'f1000', 
    'div.ref-list span.citation'
)

new ContactExtractor.ContactExtractor('f1000', function() {
    
    var contact = {};

    contact['email'] = $('div.article-information').text().
        match(ContactExtractor.email_rgx);
    
    return contact;
        
});