# Imports
import os

# Flask imports
from flask import Flask
from flask.ext.basicauth import BasicAuth

# Initialize app
app = Flask(__name__)
app.config['DEBUG'] = True
app.config['JSDOC_FOLDER'] = '/static/jsdoc/'

# Get name & pass from env
app.config['BASIC_AUTH_USERNAME'] = os.environ.get('CITELET_AUTH_USERNAME')
app.config['BASIC_AUTH_PASSWORD'] = os.environ.get('CITELET_AUTH_PASSWORD')

# Set up authentication
basic_auth = BasicAuth(app)

# Import views
from views import *
from docviews import *

# Main
if __name__ == '__main__':

    # Start Flask app
    app.run()
