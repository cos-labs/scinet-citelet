# Imports
from flask import Flask
from flask import request
from flask import render_template
from flask.views import MethodView
from flask.ext.pymongo import PyMongo

import json

# Initialize app
app = Flask(__name__)

# Set up DB
mongo = PyMongo(app)

def jsonpify(obj, callback):
    
    return '%s(%s)' % (callback, json.dumps(obj))

class Bookmarklet(MethodView):
    
    def get(self):
        
        # Read bookmarket.js
        with open('static/js/bookmarklet.js') as bookmarklet_file:
            bookmarklet = bookmarklet_file.read()

        # Return rendered template
        return render_template('bookmarklet.html', bookmarklet=bookmarklet)

class SendRefsAJAX(MethodView):
    
    def get(self):
        
        # Get arguments
        call = request.args.get('callback')
        head_json = request.args.get('head_ref', '{}')
        refs_json = request.args.get('refs', '[]')
        
        # Parse JSON
        head = json.loads(head_json)
        refs = json.loads(refs_json)
        
        # Parse references
        pass

        # Add to database
        pass

        # Assemble results
        results = {
            'msg' : 'Received head reference %s and %s cited references.' % \
                (head['doi'][0], len(refs)),
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
