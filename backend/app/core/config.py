"""Application configuration."""

import os

from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# OpenAI API key
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Rapid API key
RAPID_API_KEY = os.getenv("RAPID_API_KEY")

# Models
DEFAULT_MODEL = "gpt-4o"

# API configuration
MAX_STATEMENTS = 10
