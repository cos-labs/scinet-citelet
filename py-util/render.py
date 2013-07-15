"""
"""

# Imports
import argparse
from jinja2 import Template
from jinja2 import contextfunction

@contextfunction
def get_context(context):
    dct = context.get_all()
    return {
        key : dct[key] for key in dct
            if not callable(dct[key])
            and not key.startswith('__')
    }

# Add current directory to path so we can import cfg
import os, sys
sys.path.insert(0, os.getcwd())

import cfg

# Initialize argument parser
parser = argparse.ArgumentParser()

# Define arguments
parser.add_argument('--i')
parser.add_argument('--o')

# Parse arguments
args = parser.parse_args()

# Open context with input, output files
with open(args.i, 'r') as ifp, \
        open(args.o, 'w') as ofp:
    
    # Create template
    template = Template(ifp.read())
    
    # Add context function to template
    template.globals['context'] = get_context
    
    # Render template and write to output
    ofp.write(template.render(vars(cfg)))
