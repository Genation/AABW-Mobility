"""Pydantic request/response models for the Tasco Maps AI API."""
from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field, field_validator, model_validator


# Public input bounds protect the synchronous normalization/retrieval paths from
# accidental oversized payloads.  Autocomplete prefixes are intentionally
# tighter than complete search queries because they are sent on every keystroke.
MAX_QUERY_LENGTH = 512
MAX_AUTOCOMPLETE_LENGTH = 256


class UnderstandRequest(BaseModel):
    query: str = Field(
        ..., min_length=1, max_length=MAX_QUERY_LENGTH,
        examples=["cafe có sân vườn gần Hồ Tây"])
    boost: bool = Field(False, description="Use the OpenRouter LLM boost if available")

    @field_validator("query", mode="before")
    @classmethod
    def normalize_query_input(cls, value):
        return value.strip() if isinstance(value, str) else value


class UnderstandResponse(BaseModel):
    raw: str = Field(max_length=MAX_QUERY_LENGTH)
    normalized_query: str = Field(max_length=MAX_QUERY_LENGTH)
    intent: str
    entities: Dict[str, Any]
    confidence: float = Field(ge=0, le=1)
    source: str


class SearchRequest(BaseModel):
    query: str = Field(
        ..., min_length=1, max_length=MAX_QUERY_LENGTH,
        examples=["khách sạn có phòng họp tại Hà Nội"])
    top_k: int = Field(5, ge=1, le=50)
    candidate_k: Optional[int] = Field(
        None, ge=1, le=500,
        description="Optional retrieval overfetch; adaptive when omitted")
    lat: Optional[float] = Field(None, ge=-90, le=90)
    lng: Optional[float] = Field(None, ge=-180, le=180)
    as_of: Optional[datetime] = Field(
        None, description="Local/offset-aware time used for 'open now'")

    @field_validator("query", mode="before")
    @classmethod
    def normalize_query_input(cls, value):
        return value.strip() if isinstance(value, str) else value

    @model_validator(mode="after")
    def validate_location_pair(self):
        if (self.lat is None) != (self.lng is None):
            raise ValueError("lat and lng must be supplied together")
        return self


class SearchResult(BaseModel):
    poi_id: str
    source: str = ""
    identity_key: str = ""
    name: str
    display_name: str
    address: str = ""
    category: str
    district: str = ""
    city: str = ""
    brand: Optional[str] = None
    lat: Optional[float] = Field(None, ge=-90, le=90)
    lng: Optional[float] = Field(None, ge=-180, le=180)
    rating: Optional[float] = Field(None, ge=0, le=5)
    review_count: int = Field(0, ge=0)
    score: float = Field(ge=0, le=1)
    reasons: List[str] = Field(default_factory=list)
    signals: Dict[str, float] = Field(default_factory=dict)


class SearchResponse(BaseModel):
    query: str
    understanding: Dict[str, Any]
    required_attributes: List[str]
    excluded_attributes: List[str] = Field(default_factory=list)
    results: List[SearchResult]
    diagnostics: Dict[str, Any] = Field(default_factory=dict)


class Suggestion(BaseModel):
    text: str = Field(min_length=1, max_length=MAX_QUERY_LENGTH)
    type: str = Field(min_length=1, max_length=128)
    score: float = Field(ge=0, le=1)
    source: str = Field(min_length=1, max_length=128)
    display: Optional[str] = Field(      # accented form (Track 4 service)
        None, max_length=MAX_QUERY_LENGTH)
    raw: Optional[str] = Field(          # accent-less form (Track 4 service)
        None, max_length=MAX_QUERY_LENGTH)


class AutocompleteResponse(BaseModel):
    prefix: str = Field(max_length=MAX_AUTOCOMPLETE_LENGTH)
    suggestion_type: Optional[str]
    suggestions: List[Suggestion] = Field(max_length=12)
    source: str = "local"               # "track-4-service" | "local" | "local-fallback"
    latencyMs: Optional[float] = Field(None, ge=0)


# --- RouteMate: route-aware discovery (unifies P6 + P7 + P9) ---------------
class LatLng(BaseModel):
    lat: float = Field(ge=-90, le=90)
    lng: float = Field(ge=-180, le=180)


class DestinationInput(BaseModel):
    name: str = Field(min_length=1, max_length=MAX_QUERY_LENGTH)
    lat: Optional[float] = Field(None, ge=-90, le=90)
    lng: Optional[float] = Field(None, ge=-180, le=180)

    @model_validator(mode="after")
    def validate_location_pair(self):
        if (self.lat is None) != (self.lng is None):
            raise ValueError("destination lat and lng must be supplied together")
        return self


class RouteMatePlanRequest(BaseModel):
    origin: LatLng
    destination: DestinationInput
    vehicle_type: str = Field("petrol", max_length=32)
    distance_km: Optional[float] = Field(None, ge=0, le=5000)
    duration_min: Optional[float] = Field(None, ge=0, le=100000)
    free_text: Optional[str] = Field(None, max_length=MAX_QUERY_LENGTH)
    use_llm: bool = False
    corridor_km: float = Field(8.0, ge=0.2, le=25.0)
    limit_per_need: int = Field(4, ge=1, le=10)
    # Advanced: preferred place attributes (e.g. "wifi", "yên tĩnh", "hồ bơi").
    # `attributes` is a global fallback; `attributes_by_need` targets a specific
    # bucket ("cafe" | "food" | "hotel"). Applied to café / restaurant / hotel.
    attributes: List[str] = Field(default_factory=list, max_length=20)
    attributes_by_need: Dict[str, List[str]] = Field(default_factory=dict)
    # Ordered route points from the client (OSRM). Sampling is fine; the first
    # and last points anchor origin/destination when the list is sparse.
    route_polyline: List[LatLng] = Field(default_factory=list, max_length=2000)


class RouteMateRecommendation(BaseModel):
    poi_id: str
    name: str
    category: str
    brand: Optional[str] = None
    address: str = ""
    city: str = ""
    lat: float = Field(ge=-90, le=90)
    lng: float = Field(ge=-180, le=180)
    rating: Optional[float] = Field(None, ge=0, le=5)
    review_count: int = Field(0, ge=0)
    score: float = Field(ge=0, le=1)
    reasons: List[str] = Field(default_factory=list)
    detour_km: float = Field(ge=0)
    detour_min: int = Field(ge=0)
    progress: float = Field(0.0, ge=0, le=1)
    progress_km: float = Field(0.0, ge=0)
    source: str = ""


class RouteMateGroup(BaseModel):
    need_key: str
    category: str
    categories: List[str] = Field(default_factory=list)
    label: str
    why: str = ""
    slider: Optional[Dict[str, float]] = None
    target_default: Optional[float] = None
    recommendations: List[RouteMateRecommendation] = Field(default_factory=list)


class RouteMatePlanResponse(BaseModel):
    origin: LatLng
    destination: LatLng
    destination_name: str
    vehicle_type: str
    route_length_km: float = Field(ge=0)
    corridor_km: float = Field(ge=0)
    needs: List[str] = Field(default_factory=list)
    groups: List[RouteMateGroup] = Field(default_factory=list)
    source: str = "deterministic"       # "deterministic" | "llm"
    understanding: Optional[Dict[str, Any]] = None
    diagnostics: Dict[str, Any] = Field(default_factory=dict)
