from itertools import islice
from flask import Flask, request, session, render_template, redirect
import requests
import json
import jinja2
import random
import api_utils
import dateutil.parser as parser
from pahmasettings import FLASK_SESSION_SECRET
# import model # for database. not in use yet

# Number of objects to return from search
ROWS = 100
NUM_ARTIFACTS_IN_EXHIBIT = 5
SCORE_SCALE = 10000

app = Flask(__name__)
app.config.update(
    SECRET_KEY=FLASK_SESSION_SECRET,  # for session cookie
    # SESSION_COOKIE_HTTPONLY = False # put this back if things break!
)

app.jinja_env.undefined = jinja2.StrictUndefined


# Data structure to capture results from Hearst API queries
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
        museum_num = None


###
# Constructs Hearst API queries and returns results.
# q = search field and type (blob_ss ensures only objects with images)
# fl = filter for returned things from search
# rows = number of objects to return
###
def query_constructor(query_terms='objproddate_begin_dt:[* TO *]' +
                      'AND objproddate_end_dt:[* TO *]' +
                      'AND blob_ss:[* TO *]',
                      search_filter="objname_s, objfcp_s," +
                      "objproddate_begin_dt, objproddate_end_dt," +
                      "objproddate_s, objassoccult_ss, id, blob_ss," +
                      "objdescr_s, objfilecode_ss, objmusno_s",
                      max_results=100):
    # result = query(q='''objtype_s:"archaeology" AND objproddate_txt:(+Manchu +(Qing) +Dynasty) AND blob_ss:[* TO *]''', fl="blob_ss,objname_s,objproddate_txt", rows=ROWS+1)['response']
    # result = api_utils.query(q='''objtype_s:"ethnography" AND (objfilecode_ss:"2.2 Personal Adornments and Accoutrements") AND blob_ss:[* TO *]''', fl="", rows=ROWS+1)['response']
    return api_utils.query(q=query_terms,
                           fl=search_filter,
                           rows=max_results)['response']


# Returns artifact card object instance
def make_artifact_card(result, index):
    card = Artifact_card()
    card.name = result[u'docs'][index].get(u'objname_s')
    card.fcp = result[u'docs'][index].get(u'objfcp_s')
    # Process begin and end dates into just the year
    prod_date_begin = result[u'docs'][index].get(u'objproddate_begin_dt')
    prod_date_end = result[u'docs'][index].get(u'objproddate_end_dt')
    card.prod_date_begin = parser.parse(prod_date_begin).year
    card.prod_date_end = parser.parse(prod_date_end).year
    # Get the rest of the artifact info...
    card.prod_date_s = result[u'docs'][index].get(u'objproddate_s')
    card.asso_cult = result[u'docs'][index].get(u'objassoccult_ss', [])
    card.object_id = result[u'docs'][index].get(u'id')
    card.img_id = result[u'docs'][index].get(u'blob_ss')
    card.img_URL = api_utils.imagequery(id=result[u'docs'][index][u'blob_ss'][0],
                                            derivative="Medium")
    card.description = result[u'docs'][index].get(u'objdescr_s')
    card.obj_file_code = result[u'docs'][index].get(u'objfilecode_ss')
    card.museum_num = result[u'docs'][index].get(u'objmusno_s')
    return card


# Returns a random artifact card
def get_random_artifact():
    result = query_constructor(max_results=ROWS)
    rand_index = random.randint(0, len(result[u'docs'])-1)
    print "NUMBER OF RESULTS: ", len(result[u'docs'])  # debug
    card = make_artifact_card(result, rand_index)
    return card

# Returns a list of random artifact cards
def get_random_artifacts():
    result = query_constructor(max_results=ROWS)
    #print "NUMBER OF RESULTS: ", len(result[u'docs'])  # debug
    cards = list()
    indexes = list()
    for x in range(0,NUM_ARTIFACTS_IN_EXHIBIT):
        rand_index = random.randint(0, len(result[u'docs'])-1)
	while rand_index in indexes:
            rand_index = random.randint(0, len(result[u'docs'])-1)
	indexes.append(rand_index)
        cards.append(make_artifact_card(result, rand_index))
    return cards


# Returns artifact card with specific museum_num
def get_artifact_by_museum_num(museum_num):
    result = query_constructor(query_terms=u'objmusno_s:%s' % museum_num)
    card = make_artifact_card(result, 0)
    return card


# Turns an artifact card object instance into something JSON serializable
# and can be sent in an HTTP response
def art_to_dict(art_obj):
    result = {}
    result['name'] = art_obj.name
    result['fcp'] = art_obj.fcp
    result['prod_date_begin'] = art_obj.prod_date_begin
    result['prod_date_end'] = art_obj.prod_date_end
    result['prod_date_s'] = art_obj.prod_date_s
    result['asso_cult'] = art_obj.asso_cult
    result['object_id'] = art_obj.object_id
    result['img_id'] = art_obj.img_id
    result['img_URL'] = art_obj.img_URL
    result['description'] = art_obj.description
    result['obj_file_code'] = art_obj.obj_file_code
    result['museum_num'] = art_obj.museum_num
    return result


# ==== ROUTES (aka CONTROLLERS / HANDLERS) ===


# oh lookie! a session cookie! (use this to store player info?)
# set up session cookie with some default fields when the user first visits the app.
@app.before_first_request
def setup_session():
    session['game'] = {'score': 0, 'player_name': None, 'prev_cards': {}, 'current_card': None}
    print "SETTING UP SESSION", session
    # TODO: somewhere else in the app, allow user to put their name and record their score.
    # Optionally, we can save their final score to a real database and show a leaderboard.


@app.route('/test', methods=['GET'])
def test():
    return render_template('game.html')


# Resets the session cookie before starting a new game.
@app.route('/reset_session', methods=['GET'])
def reset():
    session['game'] = {'score': 0, 'player_name': None, 'prev_cards': {}, 'current_card': None}
    print "RESET", session
    return redirect('/')


# The main page
@app.route('/', methods=['GET'])
def hello_world():
    session['game'] = session.get('game', {'score': 0, 'player_name': None, 'prev_cards': {}, 'current_card': None})
    if session['game'].get('current_card') is None:
        card = get_random_artifact()
        session['game']['current_card'] = card.museum_num
        print "GOT FIRST CARD", session # debug
    else:
        card = get_artifact_by_museum_num(session['game']['current_card'])
    return render_template('game.html', card=card)


# Handles user date guesses
@app.route('/', methods=['POST'])
def handle_guess():
    # Grab the value from the form created in the js
    guess_val = request.form.get('date_guess')
    # print guess_val #debug
    guess = int(guess_val)

    # Query and create artifact card based on museum number
    museum_num = session['game']['current_card']
    actual = get_artifact_by_museum_num(museum_num)

    # Collect data to sent to frontend.
    result = {}
    result['guess'] = guess
    result['date_begin'] = actual.prod_date_begin
    result['date_end'] = actual.prod_date_end

    # Update session cookie
    # Store user guess and card's museum number
    session['game']['prev_cards'][museum_num] = guess
    # Set current card to None so we get a new card later
    session['game']['current_card'] = None

    print len(session['game']['prev_cards'])  # debug
    if len(session['game']['prev_cards']) >= NUM_ARTIFACTS_IN_EXHIBIT:
        result['game_end_flag'] = True
    else:
        result['game_end_flag'] = False

    print session #debug
    # Send JSON version of result to frontend
    return json.dumps(result)


# Gets data for a new artifact and sends it to the frontend as JSON
@app.route('/get_art', methods=['GET'])
def get_art():
    art_card = get_random_artifact()

    # Do not use cards that have already been seen
    while art_card.museum_num in session['game']['prev_cards']:
        art_card = get_random_artifact()
    # Add current card to list of seen cards in session cookie
    session['game']['current_card'] = art_card.museum_num
    print "PROVIDED NEW CARD", session  # debug
    art_dict = art_to_dict(art_card)
    return json.dumps(art_dict)


# Register user name
@app.route('/register', methods=['POST'])
def register_name():
    player_name = request.form.get('name')
    session['game']['player_name'] = player_name
    print "REGISTERED PLAYER AS ", player_name  # debug
    print session  # debug
    return "post success"


# Provides the game session information
@app.route('/get_score', methods=['GET'])
def get_score():
    template_values = []
    game_score = 0
    possible_score = 0
    for museum_num in session['game']['prev_cards']:
        card = get_artifact_by_museum_num(museum_num)
        guess = session['game']['prev_cards'][museum_num]
        card.guess = guess
	card_range = card.prod_date_end - card.prod_date_begin + 1
	card.score = int((1.0/card_range)*SCORE_SCALE)
	card.guess_score = 0
	if card.guess >= card.prod_date_begin and card.guess <= card.prod_date_end:
	    card.guess_score = card.score
	    game_score += card.score
        possible_score += card.score
        template_values.append(card)
        #  print template_values  # debug
    return render_template('_player_game_data.html', total_score=possible_score, final_score=game_score, cards=template_values)


if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=8888)
