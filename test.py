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
import random
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

# number of objects to return from search
ROWS = 10

@app.route('/')
def hello_world():
    # q = search field and type (blob_ss ensures only objects with images)
    # fl = filter for returned things from search
    # rows = number of objects to return
    # result = query(q='''objtype_s:"archaeology" AND objproddate_txt:(+Manchu +(Qing) +Dynasty) AND blob_ss:[* TO *]''', fl="blob_ss,objname_s,objproddate_txt", rows=ROWS+1)['response']
    result = query(q='''objproddate_txt:(+Manchu +(Qing) +Dynasty) AND blob_ss:[* TO *]''', fl="blob_ss,objname_s,objproddate_txt", rows=ROWS+1)['response']
    print result # debug
    # Pick a random object on page reload
    rand_obj = random.randint(0,ROWS)
    object_name = result[u'docs'][rand_obj][u'objname_s']
    obj_proddate = result[u'docs'][rand_obj][u'objproddate_txt']
    imageURL = imagequery(id=result[u'docs'][rand_obj][u'blob_ss'][0],derivative="Medium")
    # print imageURL # debug
    return render_template('hello.html', img_url = imageURL, objname_s = object_name, objproddate_begin_dt = obj_proddate)


if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=8888)
