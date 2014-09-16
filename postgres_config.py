# hello, congrats for developing on multiple platforms. 
# you must be smart and brave.

# this file is to help you configure the postgres database for:
# ubuntu/mac vs. windows 8
# it specifies the postgres port information for each platform
# import this file into model.py and use the appropriate variable when creating the engine

# on mac/ubuntu use
unixpath = 'postgresql:///hearst'

# on windows 8 use
win8path = 'postgresql://postgres:postgres@localhost/hearst'