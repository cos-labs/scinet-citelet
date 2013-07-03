/*
 * @module plos
 * @author jmcarp
 */
 
// Detect PLoS
new PublisherDetector.MetaPublisherDetector('plos', [
        ['name', 'citation_publisher'],
        ['content', 'Public Library of Science'],
    ]);

// Extract PLoS head reference
new CitationExtractor.MetaCitationExtractor('plos');

// Extract PLoS cited references
new ReferenceExtractor.MultiReferenceExtractor(
    'plos',
    new ReferenceExtractor.SelectorReferenceExtractor('', 'ol.references > li'),
    new ReferenceExtractor.SelectorReferenceExtractor('', 'meta[name="citation_reference"]')
)

new ContactExtractor.ContactExtractor('plos', function() {
    
    var contact = {};
    
    contact['email'] = $.unique(
        $('div.author_meta a[href]')
            .map(ContactExtractor.clean_addr)           // Clean email address
            .get()                                      // jQuery -> JavaScript
    );
    
    return contact;
        
});