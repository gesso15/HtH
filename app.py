from itertools import islice
from flask import *
import requests
import json
import jinja2
import random
import api_utils
import dateutil.parser as parser

app = Flask(__name__)

class Artifact_card:
    def __init__(self):
        name = None
        fcp = None
        prod_date_begin = None
        prod_date_end = None
        prod_date_s = None
        asso_cult = None
        object_id = None
        img_id = None
        img_URL = None
        description = None
        obj_file_code = None

# My hacky global variable
myfirstcard = Artifact_card()

###
# q = search field and type (blob_ss ensures only objects with images)
# fl = filter for returned things from search
# rows = number of objects to return
###
def query_constructor(query_terms = '(objproddate_begin_dt:[-9000-01-23T00:00:00Z TO 1931-01-01T00:00:00Z] OR objproddate_end_dt:[-9000-01-01T00:00:00Z TO 1931-01-01T00:00:00Z]) AND blob_ss:[* TO *]', search_filter = "objname_s, objfcp_s, objproddate_begin_dt, objproddate_end_dt, objproddate_s, objassoccult, id, blob_ss, objdescr_s, objfilecode_ss", max_results = 100):
    # result = query(q='''objtype_s:"archaeology" AND objproddate_txt:(+Manchu +(Qing) +Dynasty) AND blob_ss:[* TO *]''', fl="blob_ss,objname_s,objproddate_txt", rows=ROWS+1)['response']
    # result = api_utils.query(q='''objtype_s:"ethnography" AND (objfilecode_ss:"2.2 Personal Adornments and Accoutrements") AND blob_ss:[* TO *]''', fl="", rows=ROWS+1)['response']
    return api_utils.query(q = query_terms, fl = search_filter, rows = max_results)['response']

# number of objects to return from search
ROWS = 100000000

@app.route('/', methods = ['GET'])
def hello_world():
    # rand_obj = random.randint(0,ROWS)
    result = query_constructor(max_results = ROWS)
    rand_obj = random.randint(0, len(result[u'docs'])-1)
    print len(result[u'docs'])
    # print result
    # myfirstcard = Artifact_card()
    myfirstcard.name = result[u'docs'][rand_obj].get(u'objname_s')
    myfirstcard.fcp = result[u'docs'][rand_obj].get(u'objfcp_s')
    myfirstcard.prod_date_begin = result[u'docs'][rand_obj].get(u'objproddate_begin_dt')
    myfirstcard.prod_date_end = result[u'docs'][rand_obj].get(u'objproddate_end_dt')
    myfirstcard.prod_date_s = result[u'docs'][rand_obj].get(u'objproddate_s')
    myfirstcard.asso_cult = result[u'docs'][rand_obj].get(u'objassoccult')
    myfirstcard.object_id = result[u'docs'][rand_obj].get(u'id')
    myfirstcard.img_id = result[u'docs'][rand_obj].get(u'blob_ss')
    myfirstcard.img_URL = api_utils.imagequery(id=result[u'docs'][rand_obj][u'blob_ss'][0],derivative="Medium")
    myfirstcard.description = result[u'docs'][rand_obj].get(u'objdescr_s')
    myfirstcard.obj_file_code = result[u'docs'][rand_obj].get(u'objfilecode_ss')
        
    return render_template('hello.html', card = myfirstcard) 

# Method to 
@app.route('/', methods = ['POST'])
def handle_guess():
    # Grab the value from the form created in the js
    guess_val = request.form.get('date_guess')
    
    # Convert to ISO date format
    date = (parser.parse(guess_val))
    print(date.isoformat())
    
    # Check the date range and return result
    if guess_val >= myfirstcard.prod_date_begin and guess_val <= myfirstcard.prod_date_end:
        return u'You got it right!'
    else:
        return u'Try again'

    # TODO: Return true/false and the actual dates (and remove the dates from the display)

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=8888)
