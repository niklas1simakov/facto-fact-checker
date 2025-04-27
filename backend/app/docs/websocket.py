"""WebSocket documentation examples for Swagger/OpenAPI."""

# WebSocket connection example
WEBSOCKET_DESCRIPTION = """
## WebSocket API for Real-time Fact Checking

Connect to the WebSocket endpoint to receive real-time updates during the fact checking process.

### Connection
```
wss://{host}/ws/fact-check/{client_id}
```

- **client_id**: A unique identifier for the client connection. If not provided or "undefined", a UUID will be generated.

### Message Exchange

1. **Client Request:**
   Send a JSON message with the content to fact check:
   ```json
   {
       "data": "Text content or URL to fact check"
   }
   ```

2. **Server Responses:**
   The server will send progress updates with the following types:

   - **Connection Confirmation:**
     ```json
     {
         "type": "connection",
         "message": "Connected to fact checking service",
         "client_id": "your-client-id"
     }
     ```

   - **Progress Updates:**
     ```json
     {
         "type": "progress",
         "stage": "extraction",
         "message": "Extracting statements from text",
         "progress": 30
     }
     ```

   - **Statements Extracted:**
     ```json
     {
         "type": "progress",
         "stage": "extraction_complete",
         "message": "Found 3 statements to verify",
         "progress": 50,
         "statements": ["Statement 1", "Statement 2", "Statement 3"]
     }
     ```

   - **Verification Progress:**
     ```json
     {
         "type": "progress",
         "stage": "verification",
         "message": "Checking statement 1 of 3",
         "progress": 60,
         "current_statement": "Statement 1"
     }
     ```

   - **Final Results:**
     ```json
     {
         "type": "complete",
         "message": "Fact checking complete",
         "progress": 100,
         "results": [
             {
                 "statement": "Statement 1",
                 "probability": "high",
                 "reason": "Multiple reliable sources confirm this.",
                 "sources": ["https://example.com/source1", "https://example.com/source2"]
             },
             {
                 "statement": "Statement 2",
                 "probability": "low",
                 "reason": "Contradicted by reliable sources.",
                 "sources": ["https://example.com/source3"]
             }
         ]
     }
     ```

   - **Error Response:**
     ```json
     {
         "type": "error",
         "message": "Error message details"
     }
     ```

### Testing with WebSocket Clients
You can test this API using tools like:
- [WebSocket.org Echo Test](https://www.websocket.org/echo.html)
- Browser console with the WebSocket API
- Postman WebSocket client
"""
