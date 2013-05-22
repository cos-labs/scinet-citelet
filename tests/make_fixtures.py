# Imports
import json

def drop_id(obj):
    
    return {k:obj[k] for k in obj if k != '_id'}

def make_fixture(fname, obj):
    
    with open(fname, 'w') as fh:
        json.dump(drop_id(obj), fh)
