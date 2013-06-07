/*
 * @author jmcarp
 */

new PublisherDetector.PublisherDetector('lww', function() {
    return $('a').filter(function() {
        return /Lippincott Williams & Wilkins/.test(this.innerText);
    }).length > 0;
});

new HeadExtractor.MetaHeadExtractor('lww', /wkhealth_/i, /wkhealth_/i);
    
new ReferenceExtractor.SelectorReferenceExtractor('lww', '#ej-article-references div[id^=P]');
    