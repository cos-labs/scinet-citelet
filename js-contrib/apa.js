/*
 * @author jmcarp
 */

new PublisherDetector.PublisherDetector('apa', function() {
    
    // Test <dt> / <dd> tags
    var pub_dt = $('dt').filter(function () {
        return this.innerHTML == 'Publisher:';
    });
    if (pub_dt.length > 0) {
        var pub_dd = pub_dt.next('dd');
        if (/american psychological association/i.test(pub_dd.text())) {
            return true;
        }
    }
    
    // Test Source: paragraph
    var source_par = $('p.body-paragraph').filter(function() {
        return /source:/i.test(this.innerText);
    });
    if (/american psychological association/i.test(source_par.text())) {
        return true;
    };
    
    return false;
    
});

new CitationExtractor.CitationExtractor('apa', function () {
    var dts = $('.citation-wrapping-div dt, .short-citation dt'),
        dds = $('.citation-wrapping-div dd, .short-citation dd');
    var head_info = {};
    for (var idx = 0; idx < dts.length; idx++) {
        var key = dts[idx].innerHTML.replace(/^:|:$/g, ''),
            val = dds[idx].innerHTML;
        head_info[key] = val;
    }
    return head_info;
});

new ReferenceExtractor.ReferenceExtractor('apa', function () {
    var ref_link = $('a[title="References"][href="#toc"]');
    if (ref_link.length == 0) return false;
    ref_span = ref_link.parent('span');
    if (ref_span.length == 0) return false;
    var refs = ref_span.nextAll('p.body-paragraph');
    return refs.filter(function () {
        return (!/this publication is protected/i.test(this.innerHTML)) &&
               (!/submitted.*?revised.*?accepted/i.test(this.innerHTML));
    });
});
