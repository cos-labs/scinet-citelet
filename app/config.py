"""
"""

# Imports
import os
import urlparse

# Send mode 
MODE = 'LOCAL'

# Scholarly URL
SCHOLAR_BASE_URL = 'http://scholarly.io'
SCHOLAR_RAW_URL = urlparse.urljoin(SCHOLAR_BASE_URL, 'raw')
SCHOLAR_PING_URL = urlparse.urljoin(SCHOLAR_BASE_URL, 'ping')

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
