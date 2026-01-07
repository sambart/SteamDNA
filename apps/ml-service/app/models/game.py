from sqlalchemy import Column, Integer, String, Text, Date, Numeric, Boolean, DateTime
from sqlalchemy.dialects.postgresql import ARRAY, JSON
from app.database import Base


class Game(Base):
    __tablename__ = "games"

    id = Column(Integer, primary_key=True, index=True)
    appId = Column("appId", Integer, unique=True, index=True)
    name = Column(String)
    shortDescription = Column("shortDescription", Text, nullable=True)
    headerImage = Column("headerImage", String, nullable=True)
    genres = Column(ARRAY(String), nullable=True)
    developers = Column(ARRAY(String), nullable=True)
    publishers = Column(ARRAY(String), nullable=True)
    releaseDate = Column("releaseDate", Date, nullable=True)
    currentPrice = Column("currentPrice", Numeric(10, 2), nullable=True)
    isFree = Column("isFree", Boolean, default=False)
    metacriticScore = Column("metacriticScore", Integer, nullable=True)
    steamRating = Column("steamRating", Integer, nullable=True)
    platforms = Column(JSON, nullable=True)
    createdAt = Column("createdAt", DateTime)
    updatedAt = Column("updatedAt", DateTime)
