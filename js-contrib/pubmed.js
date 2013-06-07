/*
 * @author jmcarp
 */

new PublisherDetector.MetaPublisherDetector('pubmed', [
    ['name', 'ncbi_db'],
    ['content', 'pmc'],
]);

new HeadExtractor.MetaHeadExtractor('pubmed');

new ReferenceExtractor.ReferenceExtractor('pubmed', function () {
    var refs_v1 = $('li[id^="B"]'),
        refs_v2 = $('div.ref-cit-blk');
    return refs_v1.length ? refs_v1 : refs_v2;
});