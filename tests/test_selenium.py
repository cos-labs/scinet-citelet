# Imports
import unittest
import json
import glob
import time
import uuid
import os

# Project imports
from drivers import ChromeExtensionDriver, \
                    ChromeBookmarkletDriver, \
                    FirefoxBookmarkletDriver \

from make_fixtures import drop_id

# 
from pymongo import MongoClient

# 
path = '/Users/jmcarp/Dropbox/projects/citelet'

#TESTDB = 'citelet_test'
DBNAME = 'citelet'

def suite_factory(driver_class):

    class suite(unittest.TestCase):
        
        @classmethod
        def setUpClass(cls):
            
            cls.driver = driver_class()

            # Set up client 
            cls.client = MongoClient()
           
            # Clear database
            cls.client.drop_database(TESTDB)
            cls.database = getattr(cls.client, TESTDB)

        @classmethod
        def tearDownClass(cls):
            
            # Quit browser
            cls.driver.browser.quit()
            
            # Delete database
            cls.client.drop_database(TESTDB)

            # Close client
            cls.client.close()
    
    return suite

suites = [
    suite_factory(ChromeBookmarkletDriver),
#    suite_factory(FirefoxBookmarkletDriver),
#    suite_factory(ChromeExtensionDriver),
]

def add_test(fixture):
    
    # Load fixture data
    json_fixture = json.load(open(fixture))
    short_name = os.path.split(fixture)[-1]\
        .split('.json')[0]

    # Define test method
    def _test(self):

        # Get collection
        testid = uuid.uuid4()
        collection = getattr(self.database, str(testid))

        # Run driver
        self.driver.drive(json_fixture['url'], testid)

        # Listen for database
        for tryidx in range(25):
            cursor = collection.find({
                'url' : json_fixture['url'],
            })
            if cursor.count():
                break
            time.sleep(0.5)

        # Test cursor count
        self.assertEqual(cursor.count(), 1)
        self.assertEqual(drop_id(cursor[0]), json_fixture)
    
    # Add test method to class
    for suite in suites:
        setattr(suite, 'test_%s' % (short_name), _test)

# Load fixtures
fixtures = glob.glob('%s/tests/fixtures/*.json' % (path))

# Generate tests for each fixture
for fixture in fixtures:
    add_test(fixture)

# Run tests
if __name__ == '__main__':
    for s in suites:
        suite = unittest.TestSuite()
        suite.addTests(unittest.makeSuite(s))
        unittest.TextTestRunner().run(suite)
