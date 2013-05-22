# Imports
import os
import sys
import json
#import urlparse

# Flask imports
from flask import Flask
from flask import jsonify
from flask import request
from flask import render_template
from flask.views import MethodView

## Mongo imports
#from pymongo import MongoClient
#from pymongo.errors import ConnectionFailure

# Project imports
import config
import dbsetup

## Set up database
#MONGO_URI = os.environ.get('MONGOLAB_URI')
#if MONGO_URI:
#    mongo = MongoClient(MONGO_URI)
#    db_name = urlparse.urlparse(MONGO_URI).path[1:]
#    database = mongo[db_name]
#else:
#    mongo = MongoClient(MONGO_URI)
#    database = mongo[DBNAME]
#try:
#    mongo = MongoClient()
#except ConnectionFailure:
#    pass
#    #sys.exit('Couldn\'t open MongoDB!')

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

@app.route('/')
def index():
    return 'hi guys!'

class Bookmarklet(MethodView):
    
    def get(self):

        # Read bookmarket.js
        with open('%s/static/js/bookmarklet.js' % (here)) as bookmarklet_file:
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
        testid = request.args.get('testid', None)
        callback = request.args.get('callback', None)
        url = request.args.get('url')
        publisher = request.args.get('publisher', '')
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
        
        # Get collection
        if testid is not None:
            # Send data to test database
            #database = getattr(mongo, TESTDB)
            #collection = getattr(database, testid)
            collection = database[testid]
        else:
            # Send data to production database
            #database = getattr(mongo, PRODDB)
            collection = database[config.COLLNAME]
            #collection = getattr(database, PRODCOLL)
        
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

        # Return response
        return resp

# Route to URL
app.add_url_rule('/sendrefs/', view_func=SendRefsAJAX.as_view('sendrefs'))

# Launch app
if __name__ == '__main__':

    # Start Flask app
    app.run()
