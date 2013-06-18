# Imports
import json

def drop_fields(obj, fields=['_id', 'url']):
    
    return {k:obj[k] for k in obj if k not in fields}

def make_fixture(fname, obj):
    
    with open(fname, 'w') as fh:
        json.dump(drop_fields(obj), fh)
