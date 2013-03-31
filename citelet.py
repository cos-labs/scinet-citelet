# Flask imports
from flask import Flask
from flask import request
from flask import render_template
from flask.views import MethodView

# PyMongo imports
from flask.ext.pymongo import PyMongo
from pymongo.errors import ConnectionFailure

import json

# Initialize app
app = Flask(__name__)

# Set up database
try:
    mongo = PyMongo(app)
    connected = True
except ConnectionFailure:
    connected = False

def jsonpify(obj, callback):
    
    return '%s(%s)' % (callback, json.dumps(obj))

def request_to_ip(req):
    """Grab user IP address from flask request object."""
    
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

class SendRefsAJAX(MethodView):
    
    def get(self):
        
        # Get IP address
        ip_addr = request_to_ip(request)

        # Get arguments
        call = request.args.get('callback')
        publisher = request.args.get('publisher')
        head_ref_json = request.args.get('head_ref', '{}')
        cited_refs_json = request.args.get('cited_refs', '[]')
        
        # Parse JSON
        head_ref = json.loads(head_ref_json)
        cited_refs = json.loads(cited_refs_json)
        
        # Parse references
        pass

        # Add to database
        record = {
            'publisher' : publisher,
            'head_ref' : head_ref,
            'cited_refs' : cited_refs,
            'ip_addr' : ip_addr,
        }
        
        if connected:
            mongo.db.data.update(record, record, upsert=True)
        
        # Assemble results
        results = {
            'msg' : 'Received head reference %s and %s cited references.' % \
                (repr(head_ref), len(cited_refs)),
        }
        
        # Return response
        return app.response_class(
            jsonpify(results, call),
            mimetype='application/javascript'
        )

# Route to URL
app.add_url_rule('/bookmarklet/', view_func=Bookmarklet.as_view('bookmarklet'))
app.add_url_rule('/sendrefs/', view_func=SendRefsAJAX.as_view('sendrefs'))

# Launch app
if __name__ == '__main__':
    app.run()