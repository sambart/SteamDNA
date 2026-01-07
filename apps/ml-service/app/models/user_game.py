from sqlalchemy import Column, Integer, DateTime, Numeric
from sqlalchemy.dialects.postgresql import JSON
from app.database import Base


class UserGame(Base):
    __tablename__ = "user_games"

    id = Column(Integer, primary_key=True, index=True)
    userId = Column("userId", Integer, index=True)
    gameId = Column("gameId", Integer, index=True)
    appId = Column("appId", Integer)
    playtimeForever = Column("playtimeForever", Integer, default=0)
    playtimeTwoWeeks = Column("playtimeTwoWeeks", Integer, nullable=True)
    lastPlayedAt = Column("lastPlayedAt", DateTime, nullable=True)
    firstPurchasedAt = Column("firstPurchasedAt", DateTime, nullable=True)
    purchasePrice = Column("purchasePrice", Numeric(10, 2), nullable=True)
    achievements = Column(JSON, nullable=True)
    createdAt = Column("createdAt", DateTime)
    updatedAt = Column("updatedAt", DateTime)
