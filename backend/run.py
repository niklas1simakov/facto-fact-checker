"""Server startup script."""

import sys

import uvicorn

if __name__ == "__main__":
    # if --prod is passed, run in production mode
    if "--prod" in sys.argv:
        uvicorn.run(
            "app.main:app",
            host="0.0.0.0",
            port=8000,
            reload=False,
        )
    else:
        uvicorn.run(
            "app.main:app",
            host="0.0.0.0",
            port=8000,
            reload=True,
        )
