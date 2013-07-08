"""
"""

# Imports
import os

# Send mode 
MODE = 'REMOTE'

# Scholarly URL
SCHOLAR_URL = 'http://50.16.225.235/raw'

# MongoDB parameters

DBNAME = 'citelet'
COLLNAME = 'data'

# Paths

# Base path
path = os.path.abspath(
    os.path.split(__file__)[0]
)

# Payload path
payload_path = os.path.join(path, 'tests/payloads')
