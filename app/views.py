# Imports
import os
import json

# Flask imports
from flask import jsonify
from flask import request
from flask import render_template

# Project imports
import config
import dbsetup
from cors import corsify

# Set up database
client, database = dbsetup.dbsetup()

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

@app.route('/sendrefs/', methods=['POST'])
@corsify
def sendrefs():
    """Receive and parse citation info, save to
    database, and send status response.
    
    """
    # Get IP address
    ip_addr = request_to_ip(request)
    
    # Get data from form
    data = request.form

    # Get arguments
    testid = data.get('testid')
    callback = data.get('callback')
    url = data.get('url')
    meta_json = data.get('meta', '{}')
    publisher = data.get('publisher')
    citation_json = data.get('citation', '{}')
    references_json = data.get('references', '[]')
    contacts_json = data.get('contacts', '{}')
    
    # Parse JSON
    meta = json.loads(meta_json)
    citation = json.loads(citation_json)
    references = json.loads(references_json)
    contacts = json.loads(contacts_json)

    # Add IP address to meta
    meta['ip_addr'] = ip_addr
    meta['contacts'] = contacts
    
    # Parse references
    pass

    # Add to database
    # TODO: Pass in OSF login / create custom bookmarklet
    record = {
        'url' : url,
        'meta' : meta,
        'publisher' : publisher,
        'citation' : citation,
        'references' : references,
    }

    """    
    # Get collection
    if testid is not None:
        # Send data to test database
        collection = database[testid]
    else:
        # Send data to production database
        collection = database[config.COLLNAME]
    
    # TODO: Check whether submission is new
    
    # Send data to mongo
    collection.update(record, record, upsert=True)
    """
    import requests
    url = "http://localhost:5001/raw"
    print "Sending payload to crowdscholar"
    headers = {"content-type": "application/json"}
    resp = requests.post(url, data=json.dumps(record), headers=headers)
    print resp
    # @todo: do something with this response
     
    # Assemble results
    results = {}
    if publisher != '':
        results['status'] = 'success'
        results['msg'] = ('Received from publisher %s ' + \
            'head reference %s with %s cited references.') % \
            (publisher.upper(), repr(citation), len(references))
    else:
        results['status'] = 'failure'
        results['msg'] = 'Could not identify publisher.'
    
    # Build JSON response
    resp = jsonify(**results)

    # Return completed response
    return resp
