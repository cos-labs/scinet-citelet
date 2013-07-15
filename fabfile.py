"""
"""

# Imports
import os
from fabric.api import env
from fabric.api import sudo
from fabric.api import local
from fabric.api import execute
from fabric.context_managers import cd

env.hosts = ['localhost']
env.user = os.environ.get('USER')
env.path = os.path.abspath(os.getcwd())

def rlocal():
    env.run = local

def rsudo():
    env.run = sudo

def _runall(mode):
    
    with cd(env.path):
        execute(app_cfg, mode)
        execute(build_js_cfg, mode)
        execute(build_bookmarklet_js, mode)
        execute(build_chrome_js, mode)
        execute(build_chrome_manifest, mode)

def clean():
    """ Run all tasks in clean mode. """

    _runall('clean')

def deploy():
    """ Run all tasks in deploy mode. """

    _runall('deploy')

def app_cfg(mode):
    """ Copy config file to app. """
    
    if mode == 'deploy':

        env.run('cp cfg.py app/citelet_cfg.py')

    elif mode == 'clean':
        
        env.run('rm app/citelet_cfg.py')

def build_js_cfg(mode):
    """ Create JavaScript config file. """
    
    if mode == 'deploy':

        env.run('''
            python py-util/render.py \
                --i js-cfg/cfg.js.jinja \
                --o js-cfg/cfg.js
        ''')

    elif mode == 'clean':
        
        env.run('rm js-cfg/cfg.js')

def build_chrome_manifest(mode):
    """ Render Chrome manifest. """
    
    if mode == 'deploy':

        env.run('''
            python py-util/render.py \
                --i chrome-ext/manifest.json.jinja \
                --o chrome-ext/manifest.json
        ''')

    elif mode == 'clean':
        
        env.run('rm chrome-ext/manifest.json')

def build_bookmarklet_js(mode):
    """ Minify bookmarklet JavaScript. """
    
    if mode == 'deploy':

        env.run('''
            python py-util/minify.py \
                --wrap \
                --minify \
                --files \
                    js-cfg/*.js \
                    js-req/*.js \
                    js-src/_*.js \
                    js-contrib/*.js \
                    js-src/main.js \
                > app/static/js/citelet.min.js
        ''')

    elif mode == 'clean':
        
        env.run('rm app/static/js/citelet.min.js')

def build_chrome_js(mode):
    """ Minify Chrome JavaScript. """
    
    if mode == 'deploy':

        env.run('''
            python py-util/minify.py \
                --files \
                    js-cfg/*.js \
                    js-req/*.js \
                    js-src/_*.js \
                    js-contrib/*.js \
                > chrome-ext/citelet.min.js
        ''')

    elif mode == 'clean':
        
        env.run('rm chrome-ext/citelet.min.js')
