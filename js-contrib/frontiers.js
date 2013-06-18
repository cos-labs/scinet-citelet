/*
 * @module frontiers
 * @author jmcarp
 */

new PublisherDetector.MetaPublisherDetector('frontiers', [
    ['name', 'citation_publisher'],
    ['content', 'Frontiers'],
]);

new CitationExtractor.MetaCitationExtractor('frontiers');

new ReferenceExtractor.SelectorReferenceExtractor('frontiers', 'div.References');

new ContactExtractor.ContactExtractor('frontiers', function() {
    
    var contact = {};
    
    contact['email'] = $('div.AbstractSummary').text().match(email_rgx);
    
    return contact;
    
});