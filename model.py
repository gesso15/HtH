import postgres_config
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import create_engine
from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship, backref
from sqlalchemy.orm import sessionmaker, scoped_session
from datetime import datetime

ENGINE = create_engine(postgres_config.win8path, echo=False)
session = scoped_session(sessionmaker(bind=ENGINE,
                                       autocommit=False,
                                       autoflush=False))
Base = declarative_base()
Base.query = session.query_property

### Classes: Table Definitions ###

# users to scores is one-to-many
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key = True)
    name = Column(String(64), nullable = True, unique=True) # Ensure this is unique?

# score to user is one-to-one
class Score(Base):
    __tablename__ = "scores"
    id = Column(Integer, primary_key = True)
    points = Column(Integer, nullable=True)
    score_time = Column(DateTime, default=datetime.utcnow())
    user_id = Column(Integer, ForeignKey('users.id'))

    user = relationship("User", backref=backref("scores", order_by=id))
               


### End Classes ###

def main():
    global Base
    Base.metadata.create_all(ENGINE)


if __name__ == "__main__":
    main()