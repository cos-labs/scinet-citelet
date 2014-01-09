"""
"""

# Imports
import os
import json
import requests

# Flask imports
from flask import jsonify
from flask import request
from flask import make_response
from flask import render_template
from flask.views import MethodView

# Project imports
import config
from cors import corsify

# Import app
from main import app, basic_auth

# Get current path
here = os.path.split(__file__)[0]

def get_ip():
    """ Grab user IP address from Flask request object. """
    
    return request.remote_addr

@app.route('/')
@app.route('/bookmarklet/')
def bookmarklet():
    """ Display Citelet installation and usage information. """

    # Return rendered template
    return render_template('bookmarklet.html', CITELET_BASE_URL=config.CITELET_BASE_URL)

@app.route('/faq/')
def faq():
    """ Display Citelet FAQ. """
    return render_template("faq.html")

@app.route('/fixture/<name>/')
@basic_auth.required
def fixture(name):

    return open('%s/tests/fixtures/%s.html' % (here, name)).read()

@app.route('/ping/', methods=['POST'])
@corsify()
def ping():
    """Send a hash of the Citelet payload to Scholarly to determine
    whether the full payload should be sent or not. HTTP code 204 
    indicates that the hash code has not been seen before; 201 indicates
    that is has been seen before. The client IP address is also sent
    so that users can optionally get credit for repeat submissions.

    """
    # Get hash code from form data
    hash = request.form.get('hash')
    
    # Quit if no hash
    if not hash:
        return 'false'
    
    # Send hash code to Scholar
    resp = requests.post(
        config.SCHOLAR_PING_URL,
        data={
            'hash' : hash,
            'ip' : get_ip(),
        }
    )
    
    # Check status code from Scholarly
    status = resp.status_code == 204

    # Cast status to lower-case string
    # Flask can't send a boolean as a response
    status = str(status).lower()

    # Return status to client
    return status

class Field(object):
    """ Class for extracting a field from form data. """
    
    def __init__(self, key, default=None, function=None):
        """ Constructor. """
        
        # Memorize arguments
        self.key = key
        self.default = default
        self.function = function

    def fetch(self, data):
        """Fetch field from data by key.

        :param data: Form data to fetch from
        
        """
        # Get value from data
        value = data.get(self.key, self.default)

        # Optionally apply function to value
        if self.function:
            value = self.function(value)
        
        # Return completed value
        return value

class SendRefs(MethodView):
    """ Base class for sendrefs view. """
    
    # Decorate post() with CORS headers
    decorators = [corsify()]

    # Fields to extract from form data
    fields = {
        'hash' : Field('hash'),
        'url' : Field('url'),
        'publisher' : Field('publisher'),
        'testid' : Field('testid'),
        'meta' : Field('meta', '{}', json.loads),
        'citation' : Field('citation', '{}', json.loads),
        'contacts' : Field('contacts', '{}', json.loads),
        'references' : Field('references', '[]', json.loads),
    }
    
    def _load_data(self):
        """ Extract and format form data. """
        
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
        data['meta']['ip_addr'] = get_ip()
        
        # Move contacts to meta field
        if 'contacts' in data:
            data['meta']['contacts'] = data['contacts']
            del data['contacts']
        
        # Return parsed data
        return data
    
    required_fields = ['publisher', 'citation', 'references']
    def _get_status(self, data):
        
        for field in self.required_fields:
            if field not in data or not data[field]:
                return False
        return True

    def _make_resp(self, data, status):
        
        # Initialize results
        results = {}
        
        if status:
            results['status'] = 'success'
            results['msg'] = ('Received from publisher %s ' + \
                'citation %s with %s references.') % (
                    data['publisher'].upper(), 
                    repr(data['citation']), 
                    len(data['references'])
                )
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
            config.SCHOLAR_RAW_URL,
            data=json.dumps(data),
            headers={
                'content-type' : 'application/json',
            }
        )

        return resp

    def post(self):
        
        # Parse form data
        data = self._load_data()
        
        # Check status of data
        status = self._get_status(data)

        # Send parsed data to Scholarly
        if status:
            resp = self._to_scholar(data)

        # Return response
        return self._make_resp(data, status)

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

        # Check status of data
        status = self._get_status(data)

        # Send parsed data to MongoDB 
        if status:
            self._to_mongo(data)

        # Return response
        return self._make_resp(data, status)

# Choose appropriate subclass of SendRefs view
# based on config.MODE

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
