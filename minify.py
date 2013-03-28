# Imports
import slimit

def minicite():
    
    # Read code
    with open('static/js/citelet.js') as code_file:
        code = code_file.read()

    # Read wrapper
    with open('static/js/wrapper.js') as wrap_file:
        wrap = wrap_file.read()
    
    # Wrap code
    wrapped_code = wrap % code

    # Minify wrapped code
    mini_code = slimit.minify(wrapped_code, mangle=True)
    
    # Write minified code
    with open('static/js/citelet.min.js', 'w') as min_file:
        min_file.write(mini_code)
