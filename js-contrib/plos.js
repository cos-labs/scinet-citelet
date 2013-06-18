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
new ReferenceExtractor.ReferenceExtractor('plos', function() {
    
    // Extract references from document
    var text_refs = $('ol.references > li'),
        meta_refs = $('meta[name="citation_reference"]');
    
    // Skip <meta> references if length differs from text references
    if (text_refs.length != meta_refs.length)
        return text_refs;
    
    // Concatenate text and <meta> references
    var combined_refs = [];
    for (var idx = 0; idx < text_refs.length; idx++) {
        combined_refs[idx] = text_refs[idx].outerHTML + meta_refs[idx].outerHTML;
    }
    
    // Return combined references
    return combined_refs;
    
});

new ContactExtractor.ContactExtractor('plos', function() {
    
    var contact = {};
    
    contact['email'] = $.unique(
        $('div.author_meta a[href]')
            .map(ContactExtractor.clean_addr)           // Clean email address
            .get()                                      // jQuery -> JavaScript
    );
    
    return contact;
        
});
