/**
 * Resolve potential conflict in JSON.stringify with Prototype.js; see
 * http://stackoverflow.com/questions/710586/json-stringify-bizarreness
 */
var stringify = Object.toJSON ? Object.toJSON : JSON.stringify;

// Build data dictionary
var data = {};
data['url'] = window.location.href;
data['publisher'] = PublisherDetector.detect();
if (data['publisher'] !== '') {
    data['head_ref'] = stringify(HeadExtractor.extract(publisher));
    data['cited_refs'] = stringify(RefExtractor.extract(publisher));
}

/**
 * Send data to server
 *     Note: Using JSONP instead of JSON to allow cross-domain calls
 */
$.ajax({
    url : 'http://127.0.0.1:5000/sendrefs/',
    dataType : 'jsonp',
    data : data,
    success : function(res) {
        console.log(res['msg']);
    },
});