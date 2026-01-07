from pydantic import BaseModel
from typing import List, Dict, Any, Optional


class UserGameData(BaseModel):
    appId: int
    playtimeForever: int
    playtimeTwoWeeks: Optional[int] = None
    achievements: Optional[Dict[str, Any]] = None


class GameInfo(BaseModel):
    appId: int
    name: str
    genres: Optional[List[str]] = None
    isFree: bool = False
    metacriticScore: Optional[int] = None


class AnalysisRequest(BaseModel):
    userId: int
    userGames: List[UserGameData]
    gamesInfo: List[GameInfo]


class PersonaResult(BaseModel):
    clusterId: int
    personaName: str
    confidence: float
    description: str
    traits: List[str]
    insights: List[str]


class AnalysisResponse(BaseModel):
    userId: int
    featureVector: List[float]
    persona: PersonaResult
    topGenres: List[str]
    totalGames: int
    totalPlaytime: float
    featureDetails: Dict[str, Any]
