"""
Gemini + LangChain AI service.

Provides two main capabilities:
  1. `analyze_products`  — enriches product metadata with AI-generated tags,
     embeddings summary, and semantic category.
  2. `get_gemini_recommendations` — given a source product (or session context)
     returns a ranked list of product IDs with relevance scores.
"""

import json
import logging
import os

from langchain_core.prompts import PromptTemplate
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI

logger = logging.getLogger(__name__)


def _get_llm(streaming: bool = False) -> ChatGoogleGenerativeAI:
    api_key = os.getenv("GEMINI_API_KEY", "")
    model = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not set.")
    return ChatGoogleGenerativeAI(
        model=model,
        google_api_key=api_key,
        temperature=0.3,
        streaming=streaming,
    )


# ---------------------------------------------------------------------------
# Prompt templates
# ---------------------------------------------------------------------------

_RECOMMEND_SYSTEM = """You are an expert e-commerce recommendation engine.
Your job is to analyse product catalogs and return personalised recommendations.
Always respond with valid JSON only — no markdown, no explanation outside JSON."""

_RECOMMEND_PROMPT = PromptTemplate(
    input_variables=["source_product", "catalog", "user_context", "max_items"],
    template="""
Given the source product a user is currently viewing:
{source_product}

And the following product catalog (JSON list):
{catalog}

User context (recent viewed products / session history):
{user_context}

Return the top {max_items} most relevant products from the catalog to recommend.
Rank by relevance, complementary use, upsell potential, or similarity.

Respond ONLY with this JSON structure:
{{
  "recommendations": [
    {{"product_id": <int>, "score": <0.0-1.0>, "reason": "<short reason>"}}
  ]
}}
""",
)

_ANALYZE_PROMPT = PromptTemplate(
    input_variables=["product"],
    template="""
Analyse this product and return enriched metadata:
{product}

Respond ONLY with JSON:
{{
  "semantic_category": "<primary category>",
  "tags": ["<tag1>", "<tag2>", "<tag3>"],
  "target_audience": "<brief description>",
  "key_features": ["<feature1>", "<feature2>"],
  "complementary_categories": ["<cat1>", "<cat2>"]
}}
""",
)


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def analyze_product(product_dict: dict) -> dict:
    """
    Use Gemini to enrich a single product with semantic metadata.
    Returns a dict with extra fields; does NOT write to DB.
    """
    llm = _get_llm()
    product_str = json.dumps(
        {k: v for k, v in product_dict.items() if k in ("name", "description", "category", "tags", "price")},
        ensure_ascii=False,
    )
    prompt_text = _ANALYZE_PROMPT.format(product=product_str)
    messages = [
        SystemMessage(content=_RECOMMEND_SYSTEM),
        HumanMessage(content=prompt_text),
    ]
    response = llm.invoke(messages)
    raw = response.content.strip()
    # Strip accidental markdown fences
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    try:
        return json.loads(raw)
    except json.JSONDecodeError as exc:
        logger.warning("Gemini analyze JSON parse error: %s — raw: %s", exc, raw[:300])
        return {}


def get_gemini_recommendations(
    source_product: dict,
    catalog: list[dict],
    user_context: list[dict] = None,
    max_items: int = 6,
) -> list[dict]:
    """
    Call Gemini via LangChain to rank catalog products.
    Returns list of {product_id, score, reason}.
    """
    if not catalog:
        return []

    llm = _get_llm()

    # Trim catalog to avoid token overflow: keep id, name, category, price, tags
    slim_catalog = [
        {
            "id": p["id"],
            "name": p["name"],
            "category": p.get("category", ""),
            "price": p.get("price", 0),
            "tags": p.get("tags", []),
            "rating": p.get("rating", 0),
        }
        for p in catalog
        if p["id"] != source_product.get("id")
    ][:80]  # cap at 80 items for token budget

    slim_source = {k: source_product[k] for k in ("id", "name", "category", "price", "tags") if k in source_product}
    context_str = json.dumps(user_context or [], ensure_ascii=False)

    prompt_text = _RECOMMEND_PROMPT.format(
        source_product=json.dumps(slim_source, ensure_ascii=False),
        catalog=json.dumps(slim_catalog, ensure_ascii=False),
        user_context=context_str,
        max_items=max_items,
    )

    messages = [
        SystemMessage(content=_RECOMMEND_SYSTEM),
        HumanMessage(content=prompt_text),
    ]

    try:
        response = llm.invoke(messages)
        raw = response.content.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        data = json.loads(raw)
        return data.get("recommendations", [])
    except Exception as exc:
        logger.error("Gemini recommendation error: %s", exc)
        return []
