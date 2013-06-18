/*
 * @module highwire
 * @author jmcarp
 */

new PublisherDetector.MetaPublisherDetector('highwire', [
    ['name', 'HW.ad-path'],
]);

new CitationExtractor.MetaCitationExtractor('highwire');

new ReferenceExtractor.SelectorReferenceExtractor('highwire', 'ol.cit-list > li');

new ContactExtractor.ContactExtractor('highwire', function() {
    
    var contact = {};
    
    contact['email'] = $('li.corresp a[href]')
        .map(ContactExtractor.clean_addr)
        .get();
    
    return contact;
    
});
