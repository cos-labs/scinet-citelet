# Imports
import os
import time
import urlparse

# Selenium imports
from selenium import webdriver
from selenium.common.exceptions import NoSuchElementException

# TODO: Fix this
#path = '/Users/jmcarp/Dropbox/projects/citelet'

# Get environment variables
USERNAME = os.environ.get('CITELET_AUTH_USERNAME')
PASSWORD = os.environ.get('CITELET_AUTH_PASSWORD')
BASE_URL = os.environ.get('CITELET_BASE_URL')

class Driver(object):

    def drive(self, url):
        raise NotImplementedError('Subclasses must implement drive()')

    def inject(self, testid):
        
        self.browser.execute_script('''
            var input = document.createElement('input');
            input.setAttribute('type', 'hidden');
            input.setAttribute('id', '__citelet_testid');
            input.setAttribute('data-testid', '%s');
            document.body.appendChild(input);
        ''' % (testid))

class BookmarkletDriver(Driver):

    # Bookmarklet script
    script = ('''
        var script = document.createElement('script');
        script.src = 'http://%s/static/js/citelet.min.js';
        document.body.appendChild(script);
    ''' % (BASE_URL))\
        .replace('\n', ' ')

    #def drive(self, url, testid=None):
    def drive(self, fixture, testid=None):
        
        # Get original URL
        url = 'http://%s/fixture/%s/' % (BASE_URL, fixture)

        # Add authentication to URL
        parse = list(urlparse.urlparse(url))
        parse[1] = '%s:%s@%s' % (USERNAME, PASSWORD, parse[1])
        url = urlparse.urlunparse(parse)

        # Browse to URL
        self.browser.get(url)
        
        # Inject test ID
        if testid is not None:
            self.inject(testid)

        # Run bookmarklet script
        self.browser.execute_script(self.script)

##########
# Chrome #
##########

class ChromeBookmarkletDriver(BookmarkletDriver):

    def __init__(self):

        self.browser = webdriver.Chrome()

class ChromeExtensionDriver(Driver):

    def __init__(self):

        opts = webdriver.ChromeOptions()
        opts.add_extension('%s/ext.crx' % (path))

        self.browser = webdriver.Chrome(chrome_options=opts)

    def drive(self, url):

        # Browse to URL
        self.browser.get(url)

        # Wait for confirmation button
        for tryidx in range(25):
            try:
                confirm_btn = self.browser.find_element_by_xpath(
                    '//div[@class="citelet"]//a[contains(@class, "btn-primary")]'
                )
                if confirm_btn:
                    break
            except NoSuchElementException:
                pass
            time.sleep(0.5)

        # Crash if no confirmation button
        if not confirm_btn:
            raise Exception('Couldn\'t find confirm button!')

        # Click confirmation button
        for tryidx in range(25):
            try:
                confirm_btn.click()
                break
            except:
                pass
            time.sleep(0.5)

###########
# Firefox #
###########

class FirefoxBookmarkletDriver(BookmarkletDriver):

    def __init__(self):

        self.browser = webdriver.Firefox()

##########
# Safari #
##########

class SafariBookmarkletDriver(BookmarkletDriver):

    def __init__(self):

        self.browser = webdriver.Safari()
