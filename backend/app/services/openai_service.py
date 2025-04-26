"""Service for interacting with OpenAI API."""

from openai import OpenAI
from openai.types.responses import ParsedResponse

from app.core.config import DEFAULT_MODEL, OPENAI_API_KEY
from app.models.schemas import StatementCheck, StatementList


class OpenAIService:
    """Service for OpenAI API operations."""

    def __init__(self):
        self.client = OpenAI(api_key=OPENAI_API_KEY)

    def extract_statements(self, text: str) -> list[str]:
        """Extract statements from text using OpenAI."""
        prompt = """
        Extract the statements from the following text.
        """

        response = self.client.responses.parse(
            model=DEFAULT_MODEL,
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
        return statements

    def check_statement(self, statement: str) -> tuple[StatementCheck, list[str]]:
        """Check if a statement is true using web search."""
        prompt = """
        Check if the following statement is rather true or not, use the web search tool to check if the statement is true. 
        Reason why it is true or fake. Return a high probability if the statement is true, a low probability if the statement is fake and an uncertain probability if it is unclear.
        Return the result in the following format:
        {
            "probability": high | low | uncertain,
            "reason": "The statement is fake because..."
        }
        """

        response = self.client.responses.parse(
            model=DEFAULT_MODEL,
            input=[
                {
                    "role": "system",
                    "content": prompt,
                },
                {
                    "role": "user",
                    "content": statement,
                },
            ],
            text_format=StatementCheck,
            tools=[{"type": "web_search_preview"}],
            stream=False,
            max_output_tokens=600,
        )

        sources = self._get_sources(response)
        statement_response = response.output_parsed

        return statement_response, sources

    def _get_sources(self, response: ParsedResponse) -> list[str]:
        """Extract source URLs from OpenAI response."""
        sources = []
        for output in response.output:
            if output.type == "message":
                for item in output.content:
                    if item.type == "output_text":
                        for annotation in item.annotations:
                            if annotation.type == "url_citation":
                                sources.append(annotation.url)
        return sources
