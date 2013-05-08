# Imports
import json

# Flask imports
from flask import Flask
from flask import jsonify
from flask import request
from flask import render_template
from flask.views import MethodView

# PyMongo imports
from flask.ext.pymongo import PyMongo
from pymongo.errors import ConnectionFailure

# Initialize app
app = Flask(__name__)

# Set up database
# Access from Flask using mongo.db.data
# Access from PyMongo using MongoClient().citelet.data
try:
    mongo = PyMongo(app)
    connected = True
except ConnectionFailure:
    connected = False

def jsonpify(obj, callback):
    '''Prepare object data for JSONP response: convert to JSON,
    then wrap in function call.
    
    Args:
        obj : data to be encoded as JSON
        callback: name of callback function for wrapping JSON
    Returns:
        JSONP-style string

    '''
    
    return '%s(%s)' % (callback, json.dumps(obj))

def request_to_ip(req):
    '''Grab user IP address from flask request object.'''
    
    if not request.headers.getlist("X-Forwarded-For"):
       return request.remote_addr
    return request.headers.getlist("X-Forwarded-For")[0] 

class Bookmarklet(MethodView):
    
    def get(self):

        # Read bookmarket.js
        with open('static/js/bookmarklet.js') as bookmarklet_file:
            bookmarklet = bookmarklet_file.read()

        # Return rendered template
        return render_template('bookmarklet.html', bookmarklet=bookmarklet)

# Route to URL
app.add_url_rule('/bookmarklet/', view_func=Bookmarklet.as_view('bookmarklet'))

class SendRefsAJAX(MethodView):
    
    def get(self):
        
        # Get IP address
        ip_addr = request_to_ip(request)

        # Get arguments
        call = request.args.get('callback', None)
        url = request.args.get('url')
        publisher = request.args.get('publisher')
        head_ref_json = request.args.get('head_ref', '{}')
        cited_refs_json = request.args.get('cited_refs', '[]')
        
        # Parse JSON
        head_ref = json.loads(head_ref_json)
        cited_refs = json.loads(cited_refs_json)
        
        # Parse references
        pass

        # Add to database
        # TODO: Pass in OSF login / create custom bookmarklet
        record = {
            'url' : url,
            'publisher' : publisher,
            'head_ref' : head_ref,
            'cited_refs' : cited_refs,
            'ip_addr' : ip_addr,
        }
        
        if connected:
            mongo.db.data.update(record, record, upsert=True)
        
        # Assemble results
        results = {}
        if publisher != '':
            results['msg'] = ('Received from publisher %s ' + \
                'head reference %s with %s cited references.') % \
                (publisher.upper(), repr(head_ref), len(cited_refs))
        else:
            results['msg'] = 'Could not identify publisher.'
        
        if call is not None:
            # Build JSONP response
            resp = app.response_class(
                jsonpify(results, call),
                mimetype='application/javascript'
            )
        else:
            # Build JSON response
            resp = jsonify(**results)

        # Return response
        return resp

# Route to URL
app.add_url_rule('/sendrefs/', view_func=SendRefsAJAX.as_view('sendrefs'))

# Launch app
if __name__ == '__main__':
    app.run()
