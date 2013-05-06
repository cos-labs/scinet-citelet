# Imports
import sys
import slimit

def minicite(js_names):
    '''Concatenate, wrap, and minify project JavaScript files.'''
    
    # Read code
    js_files = [open(js_name).read() for js_name in js_names]
    
    # Concatenate code
    js_concat = '\n'.join(js_files)

    # Read wrapper
    with open('js-util/wrapper.js') as wrap_file:
        wrap = wrap_file.read()
    
    # Wrap code
    # Note: Wrapper file must contain %s for interpolation
    wrapped_code = wrap % js_concat

    # Minify wrapped code
    js_mini = slimit.minify(wrapped_code, mangle=True)
    
    # Return minified code
    return js_mini

# Run if called from CLI
if __name__ == '__main__':
    print minicite(sys.argv[1:])
