from sqlalchemy import Column, Integer, String, Boolean, DateTime
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    steamId = Column("steamId", String, unique=True, index=True)
    displayName = Column("displayName", String)
    avatar = Column(String, nullable=True)
    profileUrl = Column("profileUrl", String, nullable=True)
    accountCreatedAt = Column("accountCreatedAt", DateTime, nullable=True)
    isPublic = Column("isPublic", Boolean, default=True)
    country = Column(String(2), nullable=True)
    lastUpdatedAt = Column("lastUpdatedAt", DateTime, nullable=True)
    createdAt = Column("createdAt", DateTime)
    updatedAt = Column("updatedAt", DateTime)
