"""
"""

# Imports
import os
import json

# Project imports
from .. import config
from .. import dbsetup

# Set up database
client, database = dbsetup.dbsetup()

#def drop_fields(obj, fields=['_id', 'url']):
#    
#    return {k:obj[k] for k in obj if k not in fields}

def get_payload_name(publisher):
    """
    
    :param publisher:

    """
    # Initialize counter
    counter = 0

    # Loop until file name nonexistent
    while True:

        # Build file name
        suffix = '_' + str(counter) if counter else ''
        payload_name = os.path.join(
            config.payload_path,
            '{0}{1}.json'.format(publisher, suffix)
        )

        # Return file name if not exists
        if not os.path.exists(payload_name):
            return payload_name

        # Increment file counter
        counter += 1

def db_to_payloads(collname=config.COLLNAME):
    """

    :param collname:

    """
    # Get Mongo collection
    collection = database[collname]

    citations = collection.find(
        {},
        {'_id' : False}
    )

    for citation in citations:
        publisher = citation['publisher']
        payload_name = get_payload_name(publisher)
        make_payload(payload_name, citation)

def make_payload(fname, obj):
    """

    :param fname:
    :param obj:

    """
    with open(fname, 'w') as fh:
        json.dump(obj, fh, indent=4)
        #json.dump(drop_fields(obj), fh)

