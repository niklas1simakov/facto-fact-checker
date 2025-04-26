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
uv run run.py
```

Production mode:

```bash
uv run run.py --prod
```

5. Test the API endpoints

Check swagger UI: http://localhost:8000/docs

## API Endpoints

### REST API

- `POST /fact-check` - Check facts in text or URLs (Instagram and TikTok supported)

### WebSocket API

The WebSocket API provides real-time progress updates during fact checking.

- `ws://localhost:8000/ws/fact-check/{client_id}` - WebSocket endpoint for fact checking with progress updates

To test the WebSocket endpoint, you can use the provided test client:

```bash
uv run test_ws_client.py [optional_client_id]
```

#### WebSocket Message Format

**Request data format:**

```json
{
  "data": "text to check or URL"
}
```

**Response formats:**

1. Connection established:

```json
{
  "type": "connection",
  "message": "Connected to fact checking service",
  "client_id": "your-client-id"
}
```

2. Extract text from video (if URL is provided):

If instead of a URL a text is provided, the server will skip this step and continue with the next step.

```json
{
  "type": "video-processing",
  "message": "Extracting text from video"
}
```

3. Progress updates: Extract statements from text:

```json
{
  "type": "statement-extraction",
  "stage": "extraction",
  "message": "Extracting statements from text",
  "progress": 30
}
```

4. Completion:

```json
{
  "type": "complete",
  "message": "Fact checking complete",
  "progress": 100,
  "results": [
    {
      "statement": "Statement text",
      "probability": "high|low|uncertain",
      "reason": "Reason for determination",
      "sources": ["source1", "source2"]
    }
  ]
}
```

5. Error:

```json
{
  "type": "error",
  "message": "Error message"
}
```

## Development Notes

- Use ruff to format the code (recommended to use the `ruff` VSCode extension)

```bash
ruff check --fix .
```

- This project doesn't use `__init__.py` files since it's built with Python 3.13+, which supports implicit namespace packages (PEP 420). Package directories without `__init__.py` files are automatically recognized as packages by Python 3.3+.
