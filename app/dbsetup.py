# Imports
import os
import urlparse
from pymongo import MongoClient

# Project imports
import config

def dbsetup(test=False):
    '''
    '''
    
    # 
    if test:
        MONGOLAB_URI = os.environ.get('CITELET_TEST_MONGOLAB_URI')
    else:
        MONGOLAB_URI = os.environ.get('MONGOLAB_URI')
    
    # MongoLab branch
    if MONGOLAB_URI:
        client = MongoClient(MONGOLAB_URI)
        dbname = urlparse.urlparse(MONGOLAB_URI).path[1:]
    # Localhost branch
    else:
        client = MongoClient()
        dbname = config.DBNAME

    # 
    database = client[dbname]
    
    return client, database
