"""
"""

# Imports
from functools import wraps

def add_headers(resp):
    
    # Add CORS headers
    resp.headers.add(
        'Access-Control-Allow-Origin', 
        '*'
    )
    resp.headers.add(
        'Access-Control-Allow-Methods', 
        'POST'
    )
    resp.headers.add(
        'Access-Control-Max-Age', 
        '604800'
    )

def corsify(fun):
    
    # Create decorated function
    @wraps(fun)
    def corsified(*args, **kwargs):
        resp = fun(*args, **kwargs)
        add_headers(resp)
        return resp
    
    # Returned decorated function
    return corsified
