"""
"""

# URLs
#CITELET_BASE_URL = 'http://scholarly.openscienceframework.org/citelet'
#CITELET_TRIM_URL = 'scholarly.openscienceframework.org/citelet'
#SCHOLAR_BASE_URL = 'http://localhost/crowdscholar'

CITELET_BASE_URL = 'http://107.170.102.176/citelet'
CITELET_TRIM_URL = '107.170.102.176/citelet'
SCHOLAR_BASE_URL = 'http://localhost/crowdscholar'

# Ensure URLs do not end in trailing slash
CITELET_BASE_URL = CITELET_BASE_URL.strip('/')
CITELET_TRIM_URL = CITELET_TRIM_URL.strip('/')
SCHOLAR_BASE_URL = SCHOLAR_BASE_URL.strip('/')

# Send mode: ['LOCAL'|'REMOTE']
MODE = 'REMOTE'

# Ping Scholar service: ['true'|'false']
PING = 'true'
