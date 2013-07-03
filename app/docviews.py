# Imports
import os
import json

# Flask imports
from flask import send_from_directory

# Import app
from main import app

@app.route('/jsdoc/<path:filename>')
def jsdoc(filename):
    """ Serve static files from jsdoc. """
    
    # Build path to jsdoc folder
    jsdoc_path = app.config['JSDOC_FOLDER']
    if jsdoc_path.startswith('/'):
        jsdoc_path = jsdoc_path[1:]
    full_path = os.path.join(app.root_path, jsdoc_path)

    # Serve files from folder
    return send_from_directory(
        full_path,
        filename
    )
