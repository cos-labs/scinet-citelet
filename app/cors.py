"""
Functions for adding headers to Flask views.
"""

# Imports
from functools import wraps
from flask import make_response

def headify(headers):
    """Decorate Flask view with headers.

    :param headers: Headers to be added to response

    >>> @headify({'X-Robots-Tag' : 'noindex'})
    ... def view():
    ...     return 'Hello, world!'
    ...

    """
    # Create decorator factory
    def corsify_decorator(fun):
        
        # Create decorated function
        @wraps(fun)
        def corsified(*args, **kwargs):
            
            # Get original response
            resp = make_response(fun(*args, **kwargs))
            
            # Add headers to response
            for header in headers:
                resp.headers.add(
                    header,
                    headers[header]
                )
             
            # Return response with headers
            return resp
        
        # Returned decorated function
        return corsified
    
    # Return decorator
    return corsify_decorator

# Default CORS headers
cors_headers = {
    'Access-Control-Allow-Origin' : '*',
    'Access-Control-Allow-Headers' : '*',
    'Access-Control-Allow-Methods' : 'POST',
    'Access-Control-Max-Age' : '604800',
}

def corsify(headers=cors_headers):
    """Decorate Flask view with CORS headers.

    :param cors_headers: CORS headers to be added to response

    >>> @corsify()
    ... def view():
    ...     return 'Hello, world!'
    ...

    """
    # Call headify() with CORS headers
    return headify(cors_headers)
