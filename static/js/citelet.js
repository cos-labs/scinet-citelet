/*
    Resolve potential conflict in JSON.stringify with Prototype.js; see
    http://stackoverflow.com/questions/710586/json-stringify-bizarreness
*/
var stringify = Object.toJSON ? Object.toJSON : JSON.stringify;

/* Get page data */
var publisher = PublisherDetector.detect();
var head_ref = stringify(HeadExtractor.extract(publisher));
var cited_refs = stringify(RefExtractor.extract(publisher));

/*
Send data to server
    Note: Using JSONP instead of JSON to allow cross-domain calls
*/
$.ajax({
    url : 'http://127.0.0.1:5000/sendrefs/',
    dataType : 'jsonp',
    async : false,
    data : {
        publisher : publisher,
        head_ref : head_ref,
        cited_refs : cited_refs,
    },
    success : function(res) {
        alert(res['msg']);
    },
});