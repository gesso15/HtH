from itertools import islice
from flask import *
import requests
import json
import jinja2
import random
import api_utils

app = Flask(__name__)

# number of objects to return from search
ROWS = 10

@app.route('/')
def hello_world():
    # q = search field and type (blob_ss ensures only objects with images)
    # fl = filter for returned things from search
    # rows = number of objects to return
    # result = query(q='''objtype_s:"archaeology" AND objproddate_txt:(+Manchu +(Qing) +Dynasty) AND blob_ss:[* TO *]''', fl="blob_ss,objname_s,objproddate_txt", rows=ROWS+1)['response']
    # result = query(q='''objproddate_txt:(+Manchu +(Qing) +Dynasty) AND blob_ss:[* TO *]''', fl="blob_ss,objname_s,objproddate_txt", rows=ROWS+1)['response']
    result = api_utils.query(q='''objtype_s:"ethnography" AND (objfilecode_ss:"2.2 Personal Adornments and Accoutrements") AND blob_ss:[* TO *]''', fl="blob_ss,objname_s,objproddate_txt, objfcp_txt", rows=ROWS+1)['response']
    print result # debug
    # Pick a random object on page reload
    rand_obj = random.randint(0,ROWS)
    object_name = result[u'docs'][rand_obj][u'objname_s']
    # obj_proddate = result[u'docs'][rand_obj][u'objproddate_txt']
    object_field_collection_place = result[u'docs'][rand_obj][u'objfcp_txt']
    imageURL = api_utils.imagequery(id=result[u'docs'][rand_obj][u'blob_ss'][0],derivative="Medium")
    # print imageURL # debug
    return render_template('hello.html', img_url = imageURL, objname_s = object_name, objproddate_begin_dt = "test", objfcp_txt = object_field_collection_place)#obj_proddate)


if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=8888)
