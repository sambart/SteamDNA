from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.dialects.postgresql import ARRAY, JSONB
from app.database import Base


class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(Integer, primary_key=True, index=True)
    userId = Column("userId", Integer, index=True)
    gamingPersona = Column("gamingPersona", String(100))
    topGenres = Column("topGenres", ARRAY(String), nullable=True)
    totalGames = Column("totalGames", Integer, default=0)
    totalPlaytime = Column("totalPlaytime", Integer, default=0)
    avgPlaytimePerGame = Column("avgPlaytimePerGame", Integer, default=0)
    analysisData = Column("analysisData", JSONB, nullable=True)
    analyzedAt = Column("analyzedAt", DateTime)
    createdAt = Column("createdAt", DateTime)
    updatedAt = Column("updatedAt", DateTime)
