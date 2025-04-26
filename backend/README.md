# Fast API Backend for an AI Facts & Information Checker

## Overview

This is a Fast API backend for an AI facts and information checker. It is built with FastAPI and uses the OpenAI API to check the facts and information of a given text.

## Requirements

- UV package manager (Python 3.13+)
- OpenAI API key

## Setup

1. Clone the repository
2. Add your OpenAI API key to the `.env` file (see `.env.example`) or set the `OPENAI_API_KEY` environment variable
3. Install the dependencies

```bash
uv sync
```

4. Run the FastAPI server

Development mode:

```bash
uv run fastapi dev main.py
```

Production mode:

```bash
uv run fastapi run main.py
```

5. Test the API endpoints

Check swagger UI: http://localhost:8000/docs

## Development Notes

- use ruff to format the code (recommended to use the `ruff` VSCode extension)

```bash
ruff check --fix .
```
