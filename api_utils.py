from pahmasettings import (HACK_ID, HACK_KEY, HACK_IMAGEURL, HACK_BASEURL)

import json
import urllib
import urlparse
import requests


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
