import os
from urllib.parse import urlparse

import fastapi
from dotenv import load_dotenv
from fastapi import HTTPException
from openai import OpenAI
from pydantic import BaseModel, HttpUrl

load_dotenv()

app = fastapi.FastAPI()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


class BodyData(BaseModel):
    data: HttpUrl | str


class StatementList(BaseModel):
    statements: list[str]


@app.post("/fake-check")
async def fake_check(data: BodyData):
    data = data.data
    # Check if it appears to be a URL or just text content
    parsed_url = urlparse(str(data))
    if parsed_url.netloc:
        print(f"Checking url: {data}")
        return _fake_check_url(data)
    else:
        print(f"Checking text: {data}")
        return _fake_check_text(str(data))


def _fake_check_url(url: HttpUrl):
    if _check_instagram_url(url):
        return _check_instagram(url)
    elif _check_tiktok_url(url):
        return _check_tiktok(url)
    else:
        raise HTTPException(
            status_code=400,
            detail="Invalid URL (only Instagram and TikTok are supported)",
        )


def _fake_check_text(text: str):
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
    prompt = """
    Extract the statements from the following text.
    """

    response = client.responses.parse(
        model="gpt-4o",
        input=[
            {
                "role": "system",
                "content": prompt,
            },
            {
                "role": "user",
                "content": text,
            },
        ],
        text_format=StatementList,
        stream=False,
        max_output_tokens=1000,
    )

    statements = response.output_parsed.statements
    print(statements)
    return statements


def _check_statements(statements: list[str]) -> list[tuple[bool, str]]:
    results = []
    for statement in statements:
        result = _check_statement(statement)
        results.append(result)
    return results


def _check_statement(statement: str) -> tuple[bool, str]:
    # Implement using OpenAI API (the api returns a boolean and a reason)
    return (False, "This is a fake statement")
