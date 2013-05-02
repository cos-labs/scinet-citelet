# Imports
import slimit

code_names = [
    'publisherdetector',
    'headextractor',
    'referenceextractor',
    'citelet',
]

def minicite():
    '''Concatenate, wrap, and minify project JavaScript files.'''
    
    # Read code
    code = []
    for code_name in code_names:
        with open('static/js/%s.js' % (code_name)) as code_file:
            code.append(code_file.read())
    
    # Concatenate code
    code = '\n'.join(code)

    # Read wrapper
    with open('static/js/wrapper.js') as wrap_file:
        wrap = wrap_file.read()
    
    # Wrap code
    # Note: Wrapper file must contain %s for interpolation
    wrapped_code = wrap % code

    # Minify wrapped code
    mini_code = slimit.minify(wrapped_code, mangle=True)
    
    # Write minified code
    with open('static/js/citelet.min.js', 'w') as min_file:
        min_file.write(mini_code)

# Run if called from CLI
if __name__ == '__main__':
    minicite()
