"""Vietnamese text primitives: normalization, accent handling, tokenization.

Kept dependency-light (stdlib + rapidfuzz) so it is fast enough for the
real-time autocomplete path.
"""
from __future__ import annotations

import re
import unicodedata
from typing import List

_WS = re.compile(r"\s+")
_VIETNAMESE_TONE_MARKS = frozenset({
    "\u0300",  # grave
    "\u0301",  # acute
    "\u0303",  # tilde
    "\u0309",  # hook above
    "\u0323",  # dot below
})
# Users commonly punctuate abbreviations (``b.v.``) even though dictionaries
# store them without dots.  Collapse only sequences of single-letter dotted
# components; ordinary full stops are handled by the lexical punctuation pass.
_DOTTED_ABBREV = re.compile(
    r"(?<!\w)(?:[^\W\d_]\.)+[^\W\d_]?(?:\.)?(?!\w)", re.UNICODE)


def nfc(s: str) -> str:
    """Canonical Unicode composition — critical for Vietnamese diacritics."""
    return unicodedata.normalize("NFC", s or "")


def normalize(s: str) -> str:
    """Lowercase, NFC, collapse whitespace, and normalize punctuation.

    Punctuation between words is treated as a separator, while punctuation
    inside numeric forms is preserved.  This keeps coordinates, decimal
    prices, times, ``24/7``, and house numbers such as ``72/3`` intact without
    making ``cafe,`` or ``bv.`` different lexical tokens.
    """
    s = nfc(s).strip().lower()
    s = _DOTTED_ABBREV.sub(lambda m: m.group(0).replace(".", ""), s)

    out = []
    size = len(s)
    for index, char in enumerate(s):
        if char.isalnum() or char.isspace():
            out.append(char)
            continue
        previous = s[index - 1] if index else ""
        following = s[index + 1] if index + 1 < size else ""
        # Numeric punctuation has map-search meaning.  A leading minus is also
        # retained for coordinates, but alphabetic hyphens become separators
        # so ``cafe-wifi`` tokenizes like ``cafe wifi``.
        numeric_inner = previous.isdigit() and following.isdigit()
        numeric_sign = char == "-" and following.isdigit() \
            and (not previous or previous.isspace() or previous in ",;(")
        if char in ".,/:;-" and (numeric_inner or numeric_sign):
            out.append(char)
        else:
            out.append(" ")
    s = "".join(out)
    s = _WS.sub(" ", s).strip()
    return s


def strip_accents(s: str) -> str:
    """Remove Vietnamese diacritics: 'Bệnh viện Bạch Mai' -> 'benh vien bach mai'."""
    s = nfc(s)
    s = s.replace("đ", "d").replace("Đ", "D")
    decomposed = unicodedata.normalize("NFD", s)
    stripped = "".join(c for c in decomposed if unicodedata.category(c) != "Mn")
    return unicodedata.normalize("NFC", stripped)


def fold(s: str) -> str:
    """Accent-insensitive comparison key: lowercase + no diacritics + normalized."""
    return _WS.sub(" ", strip_accents(normalize(s))).strip()


def tokenize(s: str) -> List[str]:
    return [t for t in normalize(s).split(" ") if t]


def fold_tokens(s: str) -> List[str]:
    return [t for t in fold(s).split(" ") if t]


# Coordinate detection: "21.028,105.852" or "21.028 105.852"
_COORD = re.compile(
    r"^\s*(-?\d{1,3}(?:\.\d+)?)\s*[,;\s]\s*(-?\d{1,3}(?:\.\d+)?)\s*$")


def parse_coordinates(s: str):
    """Return (lat, lng) if the string is a coordinate pair, else None."""
    m = _COORD.match(s or "")
    if not m:
        return None
    lat, lng = float(m.group(1)), float(m.group(2))
    if -90 <= lat <= 90 and -180 <= lng <= 180:
        return (lat, lng)
    return None


def has_accents(s: str) -> bool:
    """True if the string already contains Vietnamese diacritics."""
    return fold(s) != normalize(s)


def has_tone_mark(s: str) -> bool:
    """True when text contains an explicit Vietnamese tone mark.

    Vietnamese vowel shape (``a/ă/â``, ``o/ô/ơ``, ``u/ư``) is distinct from
    tone.  Typeahead users often enter the shape first (``phơ``) and add the
    tone on the next keystroke (``phở``).
    """
    return any(char in _VIETNAMESE_TONE_MARKS
               for char in unicodedata.normalize("NFD", nfc(s)))


def strip_tones(s: str) -> str:
    """Remove Vietnamese tone marks while preserving vowel shape and ``đ``."""
    decomposed = unicodedata.normalize("NFD", nfc(s))
    stripped = "".join(char for char in decomposed
                       if char not in _VIETNAMESE_TONE_MARKS)
    return unicodedata.normalize("NFC", stripped)


def accent_prefix_compatible(typed: str, expected: str) -> bool:
    """Accent-safe progressive token match for Vietnamese typeahead.

    Accentless input is deliberately permissive.  Once a user supplies vowel
    shape it must agree.  An explicit tone must also agree, while a shape-only
    prefix may still complete to any tone on that same vowel.
    """
    typed_normalized = normalize(typed)
    expected_normalized = normalize(expected)
    if not typed_normalized:
        return False
    if not has_accents(typed_normalized):
        return fold(expected_normalized).startswith(fold(typed_normalized))
    if has_tone_mark(typed_normalized):
        return expected_normalized.startswith(typed_normalized)
    return strip_tones(expected_normalized).startswith(
        strip_tones(typed_normalized))


def title_vi(s: str) -> str:
    """Title-case while keeping small connector words lower (best effort)."""
    small = {"và", "của", "ở", "tại", "gần"}
    out = []
    for i, w in enumerate(s.split(" ")):
        if i and w.lower() in small:
            out.append(w.lower())
        elif w:
            out.append(w[0].upper() + w[1:])
    return " ".join(out)
