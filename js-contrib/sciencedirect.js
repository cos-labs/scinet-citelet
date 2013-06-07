/*
 * PLoS module contributed by jmcarp
 */
    
new PublisherDetector.TitlePublisherDetector('sciencedirect', /sciencedirect/i);

new HeadExtractor.HeadExtractor('sciencedirect', function() {
    
    // ScienceDirect meta-data is a mess, so 
    // only DOI is extracted for now
    var head_info = {};
    
    // DOI
    var ddDoi = $('a#ddDoi');
    var ddlink = ddDoi.attr('href');
    ddlink = ddlink.replace(/.*?dx\.doi\.org.*?\//, '');
    head_info['doi'] = ddlink;
    
    // Article title
    var article_title = $('.svTitle').text();
    if (article_title) {
        head_info['article_title'] = article_title;
    }
    
    // Journal title
    var journal_title_exec = /go to (.*?) on sciverse sciencedirect/i
        .exec(document.documentElement.innerHTML);
    if (journal_title_exec) {
        head_info['journal_title'] = journal_title_exec[1];
    }
    
    // Authors
    var authors = $('.authorName');
    if (authors.length > 0) {
        head_info['authors'] = authors.map(function() {
            return this.outerHTML;
        }).get();
    }
    
    // 
    return head_info;
    
});

new ReferenceExtractor.ReferenceExtractor('sciencedirect', function () {
    
    /**
     * ScienceDirect lazy-loads references. The base page is loaded first, and
     * then references and other elements are loaded asynchronously. This function
     * checks whether the references are available by finding in-text citations
     * (which are loaded synchronously) and then checking whether the corresponding
     * links in the reference section exist.
     * 
     * @class check_refs
     * @static
     * @return {Boolean} References available?
     */
    function check_refs() {
        
        // Get href attributes of in-text references
        // Regex may need work: in-text references have IDs including
        // ancbbb1, ancbb1, ancbbib1, etc.
        var text_refs = $('a.intra_ref').filter(function() {
            return /ancb.*?b\d+/.test($(this).attr('id'))
        }).map(function() {
            return $(this).attr('href')}
        );
        
        // Get unique in-text references
        text_refs = $.unique(text_refs);
        
        // Initialize variables
        var cited_refs,
            success = true;
        
        // Loop over in-text references and look for corresponding 
        // bibliographic references; set success to false if any missing
        $.each(text_refs, function(idx, val) {
            cited_refs = $('.label').filter(function() {
                return $(this).attr('href') == val;
            });
            if (cited_refs.length == 0) {
                success = false;
                return false;
            }
        });
        
        // Return reference availability
        return success;
        
    }
    
    // Return references if available
    if (check_refs()) {
        return $('ul.reference');
    }
    
    // References not available; set up deferred object
    var defer = $.Deferred(),
        refs = $([]);
        tryidx = 1;
    
    // Check for references until available or timeout; return
    // deferred object
    var timer = window.setInterval(function() {
        if (check_refs()) {
            defer.resolve($('ul.reference'));
            window.clearInterval(timer);
        }
        if (tryidx >= 20) {
            defer.resolve(refs);
            window.clearInterval(timer);
        }
        tryidx += 1;
    }, 500);
    
    // Return deferred object
    return defer;
    
});
