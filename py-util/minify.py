# Imports
import sys
import slimit
import argparse

def minicite(js_names, do_wrap, do_minify):
    '''Concatenate, wrap, and minify project JavaScript files.'''
    
    # Read code
    js_files = [open(js_name).read() for js_name in js_names]
    
    # Concatenate code
    js = '\n\n'.join(js_files)

    # Optionally wrap code
    # Note: Wrapper file must contain %s for interpolation
    if do_wrap:

        # Read wrapper
        with open('js-util/wrapper.js') as wrap_file:
            wrap = wrap_file.read()
        
        # Wrap code
        js = wrap % js

    # Optionally minify code
    if do_minify:
        js = slimit.minify(js, mangle=True)
    
    # Return code
    return js

# Initialize argument parser
parser = argparse.ArgumentParser()

# Define arguments
parser.add_argument('--wrap', action='store_true')
parser.add_argument('--minify', action='store_true')
parser.add_argument('--files', nargs='*')

# Parse arguments
args = parser.parse_args()

print minicite(args.files, args.wrap, args.minify)
