# Imports
import os
import urlparse
from pymongo import MongoClient

# Project imports
import config

def dbsetup():

    MONGO_URI = os.environ.get('MONGOLAB_URI')

    if MONGO_URI:
        client = MongoClient(MONGO_URI)
        db_name = urlparse.urlparse(MONGO_URI).path[1:]
        database = client[db_name]
    else:
        client = MongoClient(MONGO_URI)
        database = client[config.DBNAME]

    return client, database
