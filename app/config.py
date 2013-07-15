"""
"""

# Imports
import os

# Project imports
from citelet_cfg import CITELET_BASE_URL, SCHOLAR_BASE_URL, MODE

# Scholarly URL
SCHOLAR_RAW_URL = os.path.join(SCHOLAR_BASE_URL, 'raw')
SCHOLAR_PING_URL = os.path.join(SCHOLAR_BASE_URL, 'ping')

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
