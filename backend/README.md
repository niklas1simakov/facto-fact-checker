# Fast API Backend for an AI Facts & Information Checker

## Overview

This is a Fast API backend for an AI facts and information checker. It is built with FastAPI and uses the OpenAI API to check the facts and information of a given text.

## Requirements

- UV package manager (Python 3.13+)
- OpenAI API key
- Rapid API key (for instagram and tiktok scraping)

## Setup

1. Clone the repository
2. Add your OpenAI API key to the `.env` file (see `.env.example`) or set the `OPENAI_API_KEY` environment variable
3. Add your Rapid API key to the `.env` file (see `.env.example`). Get it from [Rapid API](https://rapidapi.com/hub)
4. Install the dependencies

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
# Test with default text
uv run test_ws_client.py [optional_client_id]

# Test with Instagram URL
uv run test_ws_client.py [optional_client_id] --instagram

# Test with TikTok URL
uv run test_ws_client.py [optional_client_id] --tiktok

# Test with custom input
uv run test_ws_client.py [optional_client_id] "Your custom text or URL here"
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

2. Progress updates:

```json
{
  "type": "progress",
  "stage": "started",
  "message": "Starting fact check process",
  "progress": 0
}
```

3. Video processing (for URLs):

```json
{
  "type": "progress",
  "stage": "video-processing",
  "message": "Extracting text from video",
  "progress": 10
}
```

4. Transcript retrieval (for URLs):

```json
{
  "type": "progress",
  "stage": "video-processing",
  "message": "Getting transcript from Instagram/TikTok",
  "progress": 20
}
```

5. Statement extraction:

```json
{
  "type": "progress",
  "stage": "extraction",
  "message": "Extracting statements from text/transcript",
  "progress": 30/40
}
```

6. Extraction complete:

```json
{
  "type": "progress",
  "stage": "extraction_complete",
  "message": "Found X statements to verify",
  "progress": 50,
  "statements": ["statement1", "statement2", ...]
}
```

7. Statement verification:

```json
{
  "type": "progress",
  "stage": "verification",
  "message": "Checking statement X of Y",
  "progress": 50-100,
  "current_statement": "statement being checked"
}
```

8. Completion:

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

9. Error:

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
