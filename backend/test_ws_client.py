"""Test script for WebSocket client interaction."""

import asyncio
import json
import sys

import websockets


async def test_ws_client_text():
    """Test WebSocket client interaction with fact-checking service."""
    print("Connecting to WebSocket server...")

    # Generate a client ID or use one provided as argument
    client_id = sys.argv[1] if len(sys.argv) > 1 else "test-client"

    try:
        async with websockets.connect(
            f"ws://localhost:8000/ws/fact-check/{client_id}"
        ) as websocket:
            print(f"Connected with client ID: {client_id}")

            # Receive initial connection message
            response = await websocket.recv()
            print(f"Initial response: {response}")

            # Example data to send
            test_data = {
                "data": "Die katholische und die evangelische Kirche in Deutschland verfügt nach Schätzungen über ein Vermögen von ungefähr 400 dreiig Milliarden Euro. Davon 160 Milliarden in Aktien, 220 Milliarden in Immobilien, 65 Milliarden in Stiftungen und anderen Vermögenstiteln."
            }

            print(f"Sending test data: {json.dumps(test_data)}")
            await websocket.send(json.dumps(test_data))

            # Process responses until complete or error
            while True:
                response = await websocket.recv()
                data = json.loads(response)

                if data.get("type") == "complete":
                    print("\n=== RESULTS ===")
                    for i, result in enumerate(data.get("results", [])):
                        print(f"\nStatement {i + 1}: {result.get('statement')}")
                        print(f"Probability: {result.get('probability')}")
                        print(f"Reason: {result.get('reason')}")
                        print(f"Sources: {', '.join(result.get('sources', []))}")
                    break
                elif data.get("type") == "error":
                    print(f"\nERROR: {data.get('message')}")
                    break
                else:
                    # Progress update
                    progress = data.get("progress", 0)
                    message = data.get("message", "")
                    print(f"\rProgress: {progress:.1f}% - {message}", end="")
                    sys.stdout.flush()

    except websockets.exceptions.ConnectionClosed:
        print("\nConnection closed unexpectedly")
    except Exception as e:
        print(f"\nError: {str(e)}")


if __name__ == "__main__":
    asyncio.run(test_ws_client_text())
