from urllib.parse import urlparse

import fastapi
from fastapi import HTTPException
from pydantic import BaseModel, HttpUrl

app = fastapi.FastAPI()


class Url(BaseModel):
    url: HttpUrl


@app.post("/fake-check-url")
def fake_check_url(url: Url):
    if _check_instagram_url(url.url):
        return _check_instagram(url.url)
    elif _check_tiktok_url(url.url):
        return _check_tiktok(url.url)
    else:
        raise HTTPException(status_code=400, detail="Invalid URL")


@app.post("/fake-check-instagram")
def fake_check_instagram(url: Url):
    if not _check_instagram_url(url.url):
        raise HTTPException(status_code=400, detail="Invalid Instagram URL")

    return _check_instagram(url.url)


@app.post("/fake-check-tiktok")
def fake_check_tiktok(url: Url):
    if not _check_tiktok_url(url.url):
        raise HTTPException(status_code=400, detail="Invalid TikTok URL")

    return _check_tiktok(url.url)


@app.post("/fake-check-text")
def fake_check_text(text: str):
    statements = _extract_statements_from_text(text)
    return _check_statements(statements)


def _check_instagram_url(url: HttpUrl):
    parsed_url = urlparse(str(url))
    if (
        parsed_url.netloc != "www.instagram.com"
        and parsed_url.netloc != "instagram.com"
    ):
        return False

    return True


def _check_tiktok_url(url: HttpUrl):
    parsed_url = urlparse(str(url))
    if (
        parsed_url.netloc != "www.tiktok.com"
        and parsed_url.netloc != "tiktok.com"
        and parsed_url.netloc != "vm.tiktok.com"
    ):
        return False

    return True


def _check_instagram(url: HttpUrl) -> list[tuple[bool, str]]:
    transcript = _get_instagram_transcript(url)
    statements = _extract_statements_from_text(transcript)
    return _check_statements(statements)


def _check_tiktok(url: HttpUrl) -> list[tuple[bool, str]]:
    transcript = _get_tiktok_transcript(url)
    statements = _extract_statements_from_text(transcript)
    return _check_statements(statements)


def _get_instagram_transcript(url: HttpUrl) -> str:
    # TODO: Implement
    return "This is a fake transcript"


def _get_tiktok_transcript(url: HttpUrl) -> str:
    # TODO: Implement
    return "This is a fake transcript"


def _extract_statements_from_text(text: str) -> list[str]:
    # Implement using OpenAI API (the api returns a list of statements)
    return ["This is a fake statement", "This is another fake statement"]


def _check_statements(statements: list[str]) -> list[tuple[bool, str]]:
    results = []
    for statement in statements:
        result = _check_statement(statement)
        results.append(result)
    return results


def _check_statement(statement: str) -> tuple[bool, str]:
    # Implement using OpenAI API (the api returns a boolean and a reason)
    return (False, "This is a fake statement")
