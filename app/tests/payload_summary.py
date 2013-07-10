"""
Get original and compressed sizes of payload files.
"""

# Imports
import os
import glob
import gzip

# Project imports
from .. import config

def process_file(fname, tmpname='__tmpgz'):
    
    # Get original file size
    fsize = os.stat(fname).st_size / 1024.
    
    # Compress file
    tmp = gzip.open(tmpname, 'wb')
    tmp.writelines(open(fname, 'rb'))
    tmp.close()

    # Get compressed file size
    cfsize = os.stat(tmpname).st_size / 1024.
    
    # Delete compressed file
    os.remove(tmpname)
    
    # Return sizes
    return fsize, cfsize, cfsize / fsize

def mean(vals):
    
    return sum(vals) / float(len(vals))

def summarize_payloads():
    
    payloads = glob.glob('{0}/*.json'.format(config.payload_path))

    fsizes, cfsizes, ratios = ([], [], [])

    for payload in payloads:

        fsize, cfsize, ratio = process_file(payload)

        fsizes.append(fsize)
        cfsizes.append(cfsize)
        ratios.append(ratio)

    print 'original sizes', mean(fsizes)
    print 'compressed sizes', mean(cfsizes)
    print 'ratios', mean(ratios)
