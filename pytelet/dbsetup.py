# Imports
import os
import urlparse
from pymongo import MongoClient

# Project imports
import config

def dbsetup():
    '''
    '''
    
    # 
    MONGOLAB_URI = os.environ.get('MONGOLAB_URI')

    # Heroku branch
    if MONGOLAB_URI:
        client = MongoClient(MONGOLAB_URI)
        dbname = urlparse.urlparse(MONGOLAB_URI).path[1:]
        #database = client[db_name]
    # Localhost branch
    else:
        client = MongoClient()
        dbname = config.DBNAME
        #database = client[config.DBNAME]

    # 
    database = client[dbname]
    
    print client, database
    return client, database
