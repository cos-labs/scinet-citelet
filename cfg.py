"""
"""

# URLs
CITELET_BASE_URL = 'http://scinet.osf.io/citelet'
CITELET_TRIM_URL = 'scinet.osf.io/citelet'
SCINET_BASE_URL = 'http://scinet.osf.io/scinet'

# Ensure URLs do not end in trailing slash
CITELET_BASE_URL = CITELET_BASE_URL.strip('/')
CITELET_TRIM_URL = CITELET_TRIM_URL.strip('/')
SCINET_BASE_URL = SCINET_BASE_URL.strip('/')

# Send mode: ['LOCAL'|'REMOTE']
MODE = 'REMOTE'

# Ping Scholar service: ['true'|'false']
PING = 'true'
