import logging
import os
import re
from pathlib import Path

from .models import Product

try:
    from dotenv import load_dotenv
except ImportError:  # The rule-based assistant must work without optional packages.
    load_dotenv = None


if load_dotenv:
    load_dotenv(Path(__file__).resolve().parents[1] / ".env")


logger = logging.getLogger(__name__)

DISCLAIMER = "This is general product guidance only and is not tax, legal, financial, or accounting advice."

GEMINI_SYSTEM_INSTRUCTION = (
    "You are a safe tax software product guidance assistant. You only explain fictional "
    "product recommendations using the provided product rules. You must not provide tax, "
    "legal, financial, or accounting advice. You must not guarantee refunds, deductions, "
    "tax outcomes, or government acceptance. If asked for professional advice, refuse safely "
    "and recommend consulting a qualified tax professional."
)

GEMINI_MODEL = "gemini-2.5-flash"

UNSAFE_TOPICS = [
    "refund", "guarantee", "definitely", "qualify", "legal advice",
    "tax advice", "accounting advice", "financial advice", "you must",
    "you will get", "you are guaranteed",
]


PROJECT_KEYWORDS = (
    "product", "tax", "income", "salary", "student", "investment", "capital gain", "rental",
    "freelance", "self-employed", "gig", "donation", "medical", "employment expense", "home office",
    "vehicle", "business", "incorporated", "company", "file", "expert", "deduction",
)

# This is the assistant's deterministic boundary.  Keep fixed, non-product replies
# together so they are consistent, easy to review, and do not spend Gemini credits.
ACKNOWLEDGEMENT_PATTERN = re.compile(r"^(?:ok|oky|okay)$", re.IGNORECASE)
GREETING_PATTERN = re.compile(r"^(?:hi|hello|hey)$", re.IGNORECASE)
GEMINI_INFO_PATTERN = re.compile(r"^(?:gemini|what is gemini|are you gemini)$", re.IGNORECASE)
AFFIRMATIVE_PATTERN = re.compile(
    r"^(?:yes|yes please|yeah|yep|y|sure|sure thing|please|of course|certainly|i do|go ahead|continue|more|tell me more)$",
    re.IGNORECASE,
)
NEGATIVE_PATTERN = re.compile(
    r"^(?:no|nope|nah|not now|no thanks|no thank you|not really|that's all|all good)$",
    re.IGNORECASE,
)

FIXED_RESPONSES = {
    "acknowledgement": {
        "answer": "Would you like to explore another TaxAdvisor product option?",
        "recommendedProduct": None,
        "confidence": "low",
        "reasons": ["The message was a single-word acknowledgement."],
    },
    "follow_up_prompt": {
        "answer": "What would you like to know about TaxAdvisor products?",
        "recommendedProduct": None,
        "confidence": "low",
        "reasons": ["The user accepted the offer to explore another product topic."],
    },
    "follow_up_closed": {
        "answer": "No problem—ask a TaxAdvisor product question whenever you’re ready.",
        "recommendedProduct": None,
        "confidence": "low",
        "reasons": ["The user declined the optional follow-up."],
    },
    "greeting": {
        "answer": "Hello—tell me about your income, deductions, or level of expert help and I’ll suggest a TaxAdvisor product.",
        "recommendedProduct": None,
        "confidence": "low",
        "reasons": ["More product-selection details are needed."],
    },
    "gemini_info": {
        "answer": "Gemini only improves the wording; TaxAdvisor’s configured product rules always make the recommendation.",
        "recommendedProduct": None,
        "confidence": "low",
        "reasons": ["Gemini does not independently choose a product."],
    },
    "safety": {
        "answer": "I can’t guarantee tax outcomes or provide professional advice; I can only offer general TaxAdvisor product guidance.",
        "recommendedProduct": None,
        "confidence": "n/a",
        "reasons": ["The request is outside safe product guidance."],
    },
    "out_of_scope": {
        "answer": "I can only help with TaxAdvisor product selection, such as income, deductions, expert help, or product features.",
        "recommendedProduct": None,
        "confidence": "low",
        "reasons": ["The question is outside the product-guidance scope."],
    },
    "comparison_details": {
        "answer": "Tell me which TaxAdvisor products you want to compare, or share your income and deductions so I can find a suitable match.",
        "recommendedProduct": None,
        "confidence": "low",
        "reasons": ["More details are needed for a specific comparison."],
    },
    "missing_details": {
        "answer": "Please share your income, deductions, and preferred level of help so I can suggest a suitable TaxAdvisor product.",
        "recommendedProduct": None,
        "confidence": "low",
        "reasons": ["Insufficient details to determine a product recommendation."],
    },
}


def _fixed_response(name: str) -> dict:
    """Return a concise, reviewed response for a non-recommendation intent."""
    return {**FIXED_RESPONSES[name], "disclaimer": DISCLAIMER}


def _check_unsafe(question: str) -> bool:
    lower = question.lower()
    return any(phrase in lower for phrase in UNSAFE_TOPICS)


def _is_project_related(question: str) -> bool:
    lower = question.lower()
    return any(keyword in lower for keyword in PROJECT_KEYWORDS)


def _short_rule_explanation(rule_response: dict) -> str:
    product = rule_response.get("recommendedProduct")
    if not product:
        return "Please share your income type, deductions, and preferred level of help so I can suggest a suitable product."

    product_name = product.split(" — ", 1)[0]
    try:
        best_for = Product.objects.only("best_for").get(name=product_name).best_for.rstrip(".")
        return f"{product_name} appears suitable for {best_for[0].lower() + best_for[1:]}."
    except (Product.DoesNotExist, IndexError):
        return f"{product_name} appears suitable based on your selected income, deductions, and help preference."


def _get_rule_based_response(question: str, conversation_context: str | None = None) -> dict:
    lower = question.lower()
    normalized = " ".join(lower.split()).strip(".!? ")

    if _check_unsafe(question):
        return _fixed_response("safety")

    if ACKNOWLEDGEMENT_PATTERN.fullmatch(normalized):
        return _fixed_response("acknowledgement")

    if conversation_context == "awaiting_product_topic":
        if AFFIRMATIVE_PATTERN.fullmatch(normalized):
            return _fixed_response("follow_up_prompt")
        if NEGATIVE_PATTERN.fullmatch(normalized):
            return _fixed_response("follow_up_closed")

    if GREETING_PATTERN.fullmatch(normalized):
        return _fixed_response("greeting")

    if GEMINI_INFO_PATTERN.fullmatch(normalized):
        return _fixed_response("gemini_info")

    if not _is_project_related(question):
        return _fixed_response("out_of_scope")

    if "nil" in lower or ("incorporated" in lower and "no revenue" in lower) or ("company" in lower and "no revenue" in lower):
        return {
            "answer": (
                "Based on the provided product rules, if you own an incorporated company with no revenue, "
                "the Nil Corporate Return product appears suitable. It is specifically designed for incorporated "
                "companies that had zero revenue during the tax year."
            ),
            "recommendedProduct": "Nil Corporate Return — CAD $175",
            "confidence": "high",
            "reasons": [
                "You mentioned an incorporated company with no revenue.",
                "Nil Corporate Return covers incorporated company filing with zero revenue.",
            ],
            "disclaimer": DISCLAIMER,
        }

    if "incorporated" in lower or ("company" in lower and "revenue" in lower and "no revenue" not in lower):
        return {
            "answer": (
                "Based on the provided product rules, for an incorporated company with revenue, "
                "the Business Corporate product appears suitable. It handles corporate tax returns, "
                "business revenue reporting, and corporate filing review."
            ),
            "recommendedProduct": "Business Corporate — CAD $400",
            "confidence": "high",
            "reasons": [
                "You mentioned an incorporated company.",
                "Business Corporate covers corporate tax filing for companies with revenue.",
            ],
            "disclaimer": DISCLAIMER,
        }

    if "expert" in lower and ("file for me" in lower or "file my" in lower or "someone else" in lower or "do it for me" in lower):
        return {
            "answer": (
                "Based on the provided product rules, if you want an expert to prepare and file your return, "
                "Expert Full Service appears suitable. An expert handles everything — document upload, "
                "return preparation, and filing — with progress tracking throughout."
            ),
            "recommendedProduct": "Expert Full Service — CAD $250",
            "confidence": "high",
            "reasons": [
                "You want someone else to prepare and file your return.",
                "Expert Full Service provides full expert handling of your return.",
            ],
            "disclaimer": DISCLAIMER,
        }

    if "expert" in lower and ("help" in lower or "assist" in lower or "guidance" in lower or "review" in lower):
        return {
            "answer": (
                "Based on the provided product rules, Expert Assist appears suitable. "
                "You file your own return, but a tax expert is available via chat or video call "
                "to answer questions and review your return before you submit."
            ),
            "recommendedProduct": "Expert Assist — CAD $120",
            "confidence": "high",
            "reasons": [
                "You want expert guidance while filing your own return.",
                "Expert Assist provides expert chat, video call, and review before filing.",
            ],
            "disclaimer": DISCLAIMER,
        }

    if any(w in lower for w in ["freelance", "freelancer", "self-employ", "self employ", "contractor",
                                  "gig", "home office", "home-office", "vehicle expense", "business expense",
                                  "sole propri"]):
        return {
            "answer": (
                "Based on the provided product rules, Self-Employed appears suitable for your situation. "
                "It covers freelance income, gig-work income, business expenses, home-office expenses, "
                "and vehicle expenses. Note that Free would not be suitable because it does not support "
                "self-employment income or business-related deductions."
            ),
            "recommendedProduct": "Self-Employed — CAD $70",
            "confidence": "high",
            "reasons": [
                "Self-employment or gig income detected.",
                "Self-Employed covers all common freelance and contractor tax situations.",
                "Free does not support self-employment income.",
            ],
            "disclaimer": DISCLAIMER,
        }

    has_investment = any(w in lower for w in ["investment", "invest", "capital gain", "rental", "foreign income"])
    if has_investment:
        return {
            "answer": (
                "Based on the provided product rules, Premier appears suitable. "
                "It supports investment income, capital gains, rental income, and foreign income, "
                "in addition to common deductions."
            ),
            "recommendedProduct": "Premier — CAD $50",
            "confidence": "high",
            "reasons": [
                "Investment, rental, or capital gains income detected.",
                "Premier covers all investment-related income types.",
            ],
            "disclaimer": DISCLAIMER,
        }

    has_deductions = any(w in lower for w in ["medical", "donation", "employ", "charity"])
    has_salary = any(w in lower for w in ["salary", "employment income", "t4", "wage"])
    if has_deductions and (has_salary or "donation" in lower):
        return {
            "answer": (
                "Based on the provided product rules, Deluxe appears suitable. "
                "It supports salary income plus common deductions including medical expenses, "
                "charitable donations, and employment expenses."
            ),
            "recommendedProduct": "Deluxe — CAD $30",
            "confidence": "high",
            "reasons": [
                "Salary income with deductions such as medical expenses or donations detected.",
                "Deluxe covers these common personal tax deductions.",
            ],
            "disclaimer": DISCLAIMER,
        }

    if "difference" in lower or "compare" in lower or "vs" in lower or "versus" in lower:
        if "premier" in lower and ("self" in lower or "employ" in lower):
            return {
                "answer": (
                    "Based on the provided product rules, here is the key difference: "
                    "Premier is designed for people with investment income, capital gains, rental income, "
                    "or foreign income — but not self-employment. "
                    "Self-Employed is designed for freelancers, contractors, gig workers, and sole proprietors "
                    "with business expenses, home-office expenses, or vehicle expenses. "
                    "If you have both investment income and self-employment income, Self-Employed is the better fit "
                    "as it covers a broader range of situations."
                ),
                "recommendedProduct": None,
                "confidence": "medium",
                "reasons": [
                    "Premier: best for investment/rental/foreign income.",
                    "Self-Employed: best for freelance/gig/business income.",
                ],
                "disclaimer": DISCLAIMER,
            }

        return _fixed_response("comparison_details")

    return _fixed_response("missing_details")


def _safe_gemini_explanation(question: str, rule_response: dict) -> str | None:
    """Use Gemini only to reword an already rule-selected recommendation."""
    api_key = os.getenv("GEMINI_API_KEY")
    recommended_product = rule_response.get("recommendedProduct")

    # Do not send unsafe, ambiguous, or non-recommendation questions to Gemini.
    if not api_key or not recommended_product or _check_unsafe(question):
        return None

    selected_name = recommended_product.split(" — ", 1)[0]
    try:
        configured_product = Product.objects.only(
            "name", "price", "currency", "description", "best_for"
        ).get(name=selected_name)
    except Product.DoesNotExist:
        return None
    except Exception:
        logger.info("Product configuration unavailable; using the rule-based assistant.")
        return None

    prompt = (
        f"User question: {question}\n\n"
        f"Rule-determined product: {recommended_product}\n"
        f"Rule-determined reasons: {' '.join(rule_response['reasons'])}\n\n"
        f"Product configuration: {configured_product.name} ({configured_product.currency} "
        f"${configured_product.price}) — {configured_product.description} Best for: "
        f"{configured_product.best_for}\n\n"
        f"Reply with exactly one complete sentence of at most 40 words that includes '{selected_name}'. "
        "Do not choose a product, mention another product, introduce new facts, provide professional advice, "
        "or make guarantees."
    )

    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=GEMINI_SYSTEM_INSTRUCTION,
                temperature=0.2,
                max_output_tokens=64,
                # This is a concise wording task, not a reasoning task. Disabling
                # thinking keeps the small output budget available for the reply.
                thinking_config=types.ThinkingConfig(thinking_budget=0),
            ),
        )
        explanation = (response.text or "").strip()
    except Exception:
        logger.info("Gemini wording unavailable; using the rule-based assistant.")
        return None

    prohibited_phrases = (
        "guarantee", "guaranteed", "refund", "deduction eligibility", "government acceptance",
        "tax advice", "legal advice", "financial advice", "accounting advice",
    )
    explanation = " ".join(explanation.split())
    if (
        not explanation
        or selected_name.lower() not in explanation.lower()
        or len(explanation.split()) > 40
        or not explanation.endswith((".", "!", "?"))
        or any(phrase in explanation.lower() for phrase in prohibited_phrases)
    ):
        return None

    try:
        other_product_names = Product.objects.exclude(pk=configured_product.pk).values_list("name", flat=True)
    except Exception:
        logger.info("Product configuration unavailable; using the rule-based assistant.")
        return None

    for product_name in other_product_names:
        if product_name != selected_name and product_name.lower() in explanation.lower():
            return None

    return explanation


def get_assistant_response(question: str, conversation_context: str | None = None) -> dict:
    """Return rule-grounded guidance, optionally polished by Gemini."""
    rule_response = _get_rule_based_response(question, conversation_context)
    response = {**rule_response, "source": "rule-based"}
    explanation = _safe_gemini_explanation(question, rule_response)

    if explanation:
        response["answer"] = explanation
        response["source"] = "gemini"
    elif response["recommendedProduct"]:
        response["answer"] = _short_rule_explanation(rule_response)

    return response
