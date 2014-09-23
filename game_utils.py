# A module for game utilites

SCORE_SCALE = 1000

## Given the relvant metrics for a card, return a score and possible score.
def score_card(user_guess, card_begin, card_end):
    card_range = card_end - card_begin + 1
    possible_score = int((1.0/card_range)*SCORE_SCALE)
    score = 0
    # If the user was in the cards range, give them the cards score value.
    if user_guess >= card_begin and user_guess <= card_end:
        score = possible_score
    # If the user was close, give them some percentage of the points based on how close they were and the cards range.
    elif user_guess > card_end:
        score = int(possible_score-(user_guess - card_end + card_range))
    elif user_guess < card_end:
        score = int(possible_score-(card_begin - user_guess + card_range))
    # If the user guessed really poorly, just give them 0 points, not a negative score.
    if score < 0:
        score = 0
    return score, possible_score
