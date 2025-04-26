"""Service for interacting with OpenAI API."""
import requests
from openai import OpenAI
from openai.types.responses import ParsedResponse

from app.core.config import DEFAULT_MODEL, OPENAI_API_KEY
from app.models.schemas import StatementCheck, StatementList


def is_website_live(url):
    try:
        response = requests.get(url, timeout=5)
        return response.status_code == 200
    except requests.RequestException:
        return False


class OpenAIService:
    """Service for OpenAI API operations."""

    def __init__(self):
        self.client = OpenAI(api_key=OPENAI_API_KEY)

    def extract_statements(self, text: str) -> list[str]:
        """Extract statements from text using OpenAI."""
        prompt = """
        You are a professional assistant. Extract only clear, fact-checkable statements from the following input.
        Rules:
        1. Ignore emotions, jokes, opinions, rhetorical questions, casual comments, and non-factual chatter.
        2. Focus on standalone factual claims that can be proven true or false.
        3. Each extracted statement must be a full, clear sentence that can be independently checked.
        4. Extract a maximum of 10 statements. If there are more, select the most important, verifiable, and relevant ones.
        5. Preserve the original meaning of the statements without adding or changing facts.
        6. If no fact-checkable statements are found, return an empty list.
        Return only a list of strings.
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
        You are a professional, neutral fact-checker conducting an online search.
        Fact-check the following statement strictly according to these rules:
        1. Conduct an only online research to find reliable information. It is absolutely crucial you list all available and reliable sources you used to make the decision.
        2. Use only trusted sources (scientific journals, government sites, reputable news like Reuters, AP, BBC, academic institutions, international organizations).
        3. Never hallucinate. If no valid sources are found, state so clearly.
        4. Use the most recent available data unless historical context is needed.
        5. Minor numerical deviations do not invalidate the statement if the overall meaning holds.
        6. Assign probability:
           - "high" = confirmed by multiple trusted sources
           - "low" = weak or conflicting evidence
           - „uncertain“ = no reliable information found
        7. Stay fully neutral.
        8. Return the result exactly in this JSON format:
        {{
            "probability": "high | low | uncertain",
            "summary": "short neutral and concise explanation, no longer than 3 sentences",
            "sources": [
                "https://example.com/source1",
                "https://example.com/source2"
            ]
        }}
        9. If no sources are found, mention "Disclaimer: No sources found." in the summary.
        10. Ensure correct JSON syntax.
        11. JSON output language should match the input language from the statement.
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

        # merge sources from the response and the parsed response
        if statement_response.sources:
            for source in statement_response.sources:
                # check if source is real, by checking if it is a valid URL & response 200
                if is_website_live(source):
                    # check if source is already in sources
                    if source not in sources:
                        sources.append(source)
            sources.extend(statement_response.sources)

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
