# Imports
import os
import json

# Flask imports
from flask import Flask
from flask import jsonify
from flask import request
from flask import redirect
from flask import render_template
from flask.views import View, MethodView

# Project imports
import config
import dbsetup

# Set up database
client, database = dbsetup.dbsetup()

# Initialize app
app = Flask(__name__)
app.config['DEBUG'] = True

here = os.path.split(__file__)[0]

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
        with open('%s/static/js/bookmarklet.js' % (here)) as bookmarklet_file:
            bookmarklet = bookmarklet_file.read()

        # Return rendered template
        return render_template('bookmarklet.html', bookmarklet=bookmarklet)

# Route to URL
app.add_url_rule('/bookmarklet/', view_func=Bookmarklet.as_view('bookmarklet'))

#class SendRefsAJAX(MethodView):
class SendRefsAJAX(View):
    
    methods = ['GET', 'POST']

    def dispatch_request(self):
        
        # Get IP address
        ip_addr = request_to_ip(request)
        
        # 
        if request.method == 'GET':
            data = request.args
        elif request.method == 'POST':
            data = request.form

        # Get arguments
        testid = data.get('testid', None)
        callback = data.get('callback', None)
        url = data.get('url')
        publisher = data.get('publisher', '')
        head_ref_json = data.get('head_ref', '{}')
        cited_refs_json = data.get('cited_refs', '[]')
        
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
        
        # Get collection
        if testid is not None:
            # Send data to test database
            collection = database[testid]
        else:
            # Send data to production database
            collection = database[config.COLLNAME]
        
        # Send data to mongo
        collection.update(record, record, upsert=True)
        
        # Assemble results
        results = {}
        if publisher != '':
            results['status'] = 'success'
            results['msg'] = ('Received from publisher %s ' + \
                'head reference %s with %s cited references.') % \
                (publisher.upper(), repr(head_ref), len(cited_refs))
        else:
            results['status'] = 'failure'
            results['msg'] = 'Could not identify publisher.'
        
        if callback is not None:
            # Build JSONP response
            resp = app.response_class(
                jsonpify(results, callback),
                mimetype='application/javascript'
            )
        else:
            # Build JSON response
            resp = jsonify(**results)
            # Add CORS headers
            resp.headers.add('Access-Control-Allow-Origin', '*')
            resp.headers.add('Access-Control-Allow-Methods', \
                             'POST, GET, PUT, PATCH, DELETE, OPTIONS')
            resp.headers.add('Access-Control-Max-Age', '1728000')

        # Return response
        return resp

# Route to URL
app.add_url_rule('/sendrefs/', view_func=SendRefsAJAX.as_view('sendrefs'))

# Launch app
if __name__ == '__main__':

    # Start Flask app
    app.run()
