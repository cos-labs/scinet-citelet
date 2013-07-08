"""
"""

# Imports
import os
import json
import requests

# Flask imports
from flask import jsonify
from flask import request
from flask import render_template
from flask.views import MethodView

# Project imports
import config
from cors import corsify

# Import app
from main import app, basic_auth

# Get current path
here = os.path.split(__file__)[0]

def request_to_ip(req):
    """ Grab user IP address from flask request object. """
    
    if not request.headers.getlist("X-Forwarded-For"):
       return request.remote_addr
    return request.headers.getlist("X-Forwarded-For")[0] 

@app.route('/bookmarklet/')
def bookmarklet():
    """ Display link to bookmarklet. """

    # Read bookmarket.js
    with open('%s/static/js/bookmarklet.js' % (here)) as bookmarklet_file:
        bookmarklet = bookmarklet_file.read()

    # Return rendered template
    return render_template('bookmarklet.html', bookmarklet=bookmarklet)

@app.route('/fixture/<name>/')
@basic_auth.required
def fixture(name):

    return open('%s/tests/fixtures/%s.html' % (here, name)).read()

class Field(object):
    """
    """
    
    def __init__(self, key, default=None, function=None):
        
        # Memorize arguments
        self.key = key
        self.default = default
        self.function = function

    def fetch(self, data):
        
        # 
        value = data.get(self.key, self.default)

        # 
        if self.function:
            value = self.function(value)

        return value

class SendRefs(MethodView):
    
    decorators = [corsify()]

    fields = {
        'url' : Field('url'),
        'publisher' : Field('publisher'),
        'testid' : Field('testid'),
        'meta' : Field('meta', '{}', json.loads),
        'citation' : Field('citation', '{}', json.loads),
        'contacts' : Field('contacts', '{}', json.loads),
        'references' : Field('references', '[]', json.loads),
    }
    
    def _load_data(self):
        
        # Initialize data
        data = {}

        # Extract data from request.form
        for name, field in self.fields.iteritems():
            value = field.fetch(request.form)
            if value:
                data[name] = value

        # Cleanup
        if 'meta' not in data:
            data['meta'] = {}
        
        # Log IP address
        data['meta']['ip_addr'] = request_to_ip(request)
        
        # Move contacts to meta field
        if 'contacts' in data:
            data['meta']['contacts'] = data['contacts']
            del data['contacts']
        
        # Return parsed data
        return data
    
    def _make_resp(self, data):
        
        # Initialize results
        results = {}
        
        if data['publisher']:
            results['status'] = 'success'
            results['msg'] = ('Received from publisher %s ' + \
                'head reference %s with %s cited references.') % \
                (data['publisher'].upper(), repr(data['citation']), len(data['references']))
        else:
            results['status'] = 'failure'
            results['msg'] = 'Could not identify publisher.'
        
        # Build JSON response
        resp = jsonify(**results)

        # Return completed response
        return resp

class ScholarSendRefs(SendRefs):
    
    def _to_scholar(self, data):
        
        # Send data to Scholarly
        resp = requests.post(
            config.SCHOLAR_URL,
            data=json.dumps(data),
            headers={
                'content-type' : 'application/json',
            }
        )

        return resp

    def post(self):
        
        # Parse form data
        data = self._load_data()

        # Send parsed data to Scholarly
        resp = self._to_scholar(data)

        # Return response
        return self._make_resp(data)

class LocalSendRefs(SendRefs):
    
    def _to_mongo(self, data):
        
        # Get collection
        if 'testid' in data and data['testid'] is not None:
            # Send data to test database
            collection = database[testid]
        else:
            # Send data to production database
            collection = database[config.COLLNAME]
        
        # Send data to MongoDB
        collection.update(data, data, upsert=True)

    def post(self):
        
        # Parse form data
        data = self._load_data()

        # Send parsed data to MongoDB 
        self._to_mongo(data)

        # Return response
        return self._make_resp(data)

if config.MODE == 'LOCAL':
    
    import dbsetup
    client, database = dbsetup.dbsetup()

    app.add_url_rule(
        '/sendrefs/',
        view_func = LocalSendRefs.as_view('sendrefs')
    )

elif config.MODE == 'REMOTE':

    app.add_url_rule(
        '/sendrefs/', 
        view_func = ScholarSendRefs.as_view('sendrefs')
    )

