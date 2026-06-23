DISCLAIMER = (
    "This is general product guidance only and is not tax, legal, financial, "
    "or accounting advice. Please consult a qualified tax professional for personalized advice."
)

UNSAFE_TOPICS = [
    "refund", "guarantee", "definitely", "qualify", "legal advice",
    "tax advice", "accounting advice", "financial advice", "you must",
    "you will get", "you are guaranteed",
]

PRODUCT_DESCRIPTIONS = {
    "free": {
        "name": "Free",
        "price": "CAD $0",
        "best_for": "Simple personal tax returns with salary or student income and no deductions.",
        "supports": ["salary income", "student income", "basic personal return"],
        "does_not_support": ["medical expenses", "donations", "investment income", "rental income",
                             "self-employment income", "business income", "expert help"],
    },
    "deluxe": {
        "name": "Deluxe",
        "price": "CAD $30",
        "best_for": "Users with common deductions such as medical expenses, donations, or employment expenses.",
        "supports": ["salary income", "student income", "medical expenses", "donations",
                     "employment expenses", "family deductions"],
        "does_not_support": ["investment income", "rental income", "self-employment income", "corporate filing"],
    },
    "premier": {
        "name": "Premier",
        "price": "CAD $50",
        "best_for": "Users with investments, rental income, capital gains, or foreign income.",
        "supports": ["investment income", "capital gains", "foreign income", "rental income",
                     "medical expenses", "donations"],
        "does_not_support": ["self-employment income", "corporate filing"],
    },
    "self-employed": {
        "name": "Self-Employed",
        "price": "CAD $70",
        "best_for": "Freelancers, contractors, gig workers, and sole proprietors.",
        "supports": ["freelance income", "gig-work income", "business expenses", "home-office expenses",
                     "vehicle expenses", "investment income", "rental income"],
        "does_not_support": ["incorporated business filing"],
    },
    "expert-assist": {
        "name": "Expert Assist",
        "price": "CAD $120",
        "best_for": "Users who want to file themselves but need expert guidance.",
        "supports": ["all personal tax situations", "expert chat", "expert video call", "expert review"],
        "does_not_support": ["full handoff filing", "incorporated business filing"],
    },
    "expert-full-service": {
        "name": "Expert Full Service",
        "price": "CAD $250",
        "best_for": "Users who want an expert to prepare and file their return.",
        "supports": ["all personal tax situations", "document upload", "expert prepares return",
                     "expert files return", "progress tracking"],
        "does_not_support": ["incorporated business filing"],
    },
    "business-corporate": {
        "name": "Business Corporate",
        "price": "CAD $400",
        "best_for": "Incorporated companies with revenue.",
        "supports": ["corporate tax return", "business revenue", "business expenses", "corporate filing review"],
        "does_not_support": ["personal tax return"],
    },
    "nil-corporate-return": {
        "name": "Nil Corporate Return",
        "price": "CAD $175",
        "best_for": "Incorporated companies with no revenue.",
        "supports": ["incorporated company filing", "no-revenue company", "nil return"],
        "does_not_support": ["personal tax return", "companies with revenue"],
    },
}


def _check_unsafe(question: str) -> bool:
    lower = question.lower()
    return any(phrase in lower for phrase in UNSAFE_TOPICS)


def _build_product_summary(product_id: str) -> str:
    p = PRODUCT_DESCRIPTIONS.get(product_id)
    if not p:
        return ""
    return (
        f"{p['name']} ({p['price']}) — {p['best_for']} "
        f"Supports: {', '.join(p['supports'][:4])}."
    )


def get_assistant_response(question: str) -> dict:
    lower = question.lower()

    if _check_unsafe(question) and any(
        phrase in lower for phrase in [
            "guarantee", "guaranteed", "you will get", "definitely get",
            "you must", "legal advice", "tax advice"
        ]
    ):
        return {
            "answer": (
                "Based on the product rules, I can help you identify which product may suit your situation. "
                "However, I cannot guarantee any specific tax outcome, refund, or eligibility. "
                "Please consult a qualified tax professional for personalized advice."
            ),
            "recommendedProduct": None,
            "confidence": "n/a",
            "reasons": ["Questions about guaranteed outcomes fall outside product guidance."],
            "disclaimer": DISCLAIMER,
        }

    if "refund" in lower and ("guarantee" in lower or "will i" in lower or "can i" in lower):
        return {
            "answer": (
                "I'm not able to comment on whether you will receive a refund or how much. "
                "Tax outcomes depend on many factors beyond product selection. "
                "Please consult a qualified tax professional for personalized tax advice."
            ),
            "recommendedProduct": None,
            "confidence": "n/a",
            "reasons": ["Refund guarantees are outside the scope of product guidance."],
            "disclaimer": DISCLAIMER,
        }

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

        return {
            "answer": (
                "I can help compare products. Please tell me which two products you'd like to compare, "
                "or describe your income and deduction situation so I can find the best match for you."
            ),
            "recommendedProduct": None,
            "confidence": "low",
            "reasons": ["More details needed to provide a specific comparison."],
            "disclaimer": DISCLAIMER,
        }

    return {
        "answer": (
            "Based on the provided product rules, I wasn't able to identify a specific product match "
            "from your question. Could you share more details such as your income type (salary, freelance, "
            "investment), any deductions you plan to claim (medical, donations), and whether you need "
            "expert help? This will help me suggest the most appropriate product."
        ),
        "recommendedProduct": None,
        "confidence": "low",
        "reasons": ["Insufficient details to determine a product recommendation."],
        "disclaimer": DISCLAIMER,
    }
