"""
"""

# Imports
import os

# 
DBNAME = 'citelet'
COLLNAME = 'data'

# Paths
path = os.path.abspath(
    os.path.split(__file__)[0]
)

payload_path = os.path.join(path, 'tests/payloads')
