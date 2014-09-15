from pahmasettings import (HACK_ID, HACK_KEY, HACK_IMAGEURL, HACK_BASEURL)
from itertools import islice
from flask import *

import logging
import requests
import json
import urllib
import urlparse

# from display import HTML
import jinja2
#from jinja2 import Template
# from pandas import DataFrame, Series
# import pandas as pd
# import numpy as np

logging.basicConfig(filename='Experiment_20140910_HackPAHMA.log',level=logging.WARNING)
logger=logging.getLogger()


def query(q, fl="id,objmusno_s,objname_s", rows=10):
    url = "{base_url}?".format(base_url=HACK_BASEURL) + \
            urllib.urlencode({'q':q,
                              'fl':fl,
                              'wt':'json',
                              'rows': rows,
                              'app_id':HACK_ID,
                              'app_key':HACK_KEY})
    r = requests.get(url)
    return r.json()


def imagequery(id, derivative="Thumbnail"):
    url = "{base_url}/{id}/derivatives/{derivative}/content?".format(base_url=HACK_IMAGEURL,id=id,derivative=derivative)
    return url


app = Flask(__name__)

@app.route('/')
def hello_world():
    result = query(q='''objcollector_txt:Kroeber''', fl="objcollector_ss", rows=4)['response']
    print result
    imageURL = imagequery(id="c8055214-50e7-49b1-b15b",derivative="Medium")
    print imageURL
    return render_template('hello.html', MY_URL = imageURL)


if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=8888)
