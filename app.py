from itertools import islice
from flask import *
import requests
import json
import jinja2
import random
import api_utils

app = Flask(__name__)


class Artifact_card:
    def __init__(self):
        name = None
        fcp = None
        prod_date_begin = None
        prod_date_end = None
        asso_cult = None
        object_id = None
        img_id = None
        description = None
        obj_file_code = None


###
# q = search field and type (blob_ss ensures only objects with images)
# fl = filter for returned things from search
# rows = number of objects to return
###
def query_constructor(query_terms = '(objproddate_begin_dt:[0000-01-23T00:00:00Z TO 1931-01-01T00:00:00Z] OR objproddate_end_dt:[0000-01-01T00:00:00Z TO 1931-01-01T00:00:00Z]) AND blob_ss:[* TO *]', search_filter = "objname_s, objfcp_s, objproddate_begin_dt, objproddate_end_dt, objassoccult, id, blob_ss, objdescr_s, objfilecode_ss", max_results = 100):
    # result = query(q='''objtype_s:"archaeology" AND objproddate_txt:(+Manchu +(Qing) +Dynasty) AND blob_ss:[* TO *]''', fl="blob_ss,objname_s,objproddate_txt", rows=ROWS+1)['response']
    # result = api_utils.query(q='''objtype_s:"ethnography" AND (objfilecode_ss:"2.2 Personal Adornments and Accoutrements") AND blob_ss:[* TO *]''', fl="", rows=ROWS+1)['response']
    return api_utils.query(q = query_terms, fl = search_filter, rows = max_results)['response']

# number of objects to return from search
ROWS = 100

@app.route('/')
def hello_world():
    rand_obj = random.randint(0,ROWS)
    result = query_constructor()
    myfirstcard = Artifact_card()
    myfirstcard.name = result[u'docs'][rand_obj][u'objname_s']
    # print myfirstcard.name # debug
    # print result # debug
    # Pick a random object on page reload
    object_name = result[u'docs'][rand_obj][u'objname_s']

    # obj_proddate = result[u'docs'][rand_obj][u'objproddate_txt']
    if result[u'docs'][rand_obj].get(u'objproddate_begin_dt'):
        object_date = result[u'docs'][rand_obj][u'objproddate_begin_dt']
    else:
        object_date = "No production date noted" 

    if result[u'docs'][rand_obj].get(u'objfcp_s'):
        object_field_collection_place = result[u'docs'][rand_obj][u'objfcp_s']
    else:
        object_field_collection_place = "No collection place noted" 

    imageURL = api_utils.imagequery(id=result[u'docs'][rand_obj][u'blob_ss'][0],derivative="Medium")
    # print imageURL # debug
    return render_template('hello.html', img_url = imageURL, objname_s = object_name, objproddate_begin_dt = object_date, objfcp_txt = object_field_collection_place)#obj_proddate)


if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=8888)
