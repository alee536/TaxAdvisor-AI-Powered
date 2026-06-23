DISCLAIMER = (
    "This recommendation provides general product guidance only and is not "
    "tax, legal, financial, or accounting advice."
)


def get_recommendation(answers: dict) -> dict:
    filing_type = answers.get("filing_type", "")
    income_sources = answers.get("income_sources", [])
    deductions = answers.get("deductions", [])
    help_preference = answers.get("help_preference", "")
    company_revenue = answers.get("company_revenue", "")

    reasons = []
    matched_inputs = []
    warnings = []
    optional_upgrade = None

    if filing_type == "incorporated_company":
        matched_inputs.append("Incorporated company filing")
        if company_revenue == "yes":
            reasons.append("You selected an incorporated company with revenue, which requires a full corporate tax return.")
            return {
                "recommendedProductId": "business-corporate",
                "recommendedProductName": "Business Corporate",
                "price": 400,
                "currency": "CAD",
                "confidence": "high",
                "reasons": reasons,
                "matchedInputs": matched_inputs + ["Company has revenue"],
                "optionalUpgrade": None,
                "warnings": ["This product covers corporate filing only. Personal tax returns are separate."],
                "disclaimer": DISCLAIMER,
            }
        else:
            reasons.append("You selected an incorporated company with no revenue, which requires a nil corporate return.")
            return {
                "recommendedProductId": "nil-corporate-return",
                "recommendedProductName": "Nil Corporate Return",
                "price": 175,
                "currency": "CAD",
                "confidence": "high",
                "reasons": reasons,
                "matchedInputs": matched_inputs + ["Company has no revenue"],
                "optionalUpgrade": {
                    "productId": "business-corporate",
                    "productName": "Business Corporate",
                    "reason": "If your company generates revenue in the future, upgrade to Business Corporate."
                },
                "warnings": ["This product is for incorporated companies with zero revenue only."],
                "disclaimer": DISCLAIMER,
            }

    if help_preference == "expert_file_for_me":
        matched_inputs.append("Expert to file return")
        reasons.append("You want an expert to prepare and file your tax return.")
        return {
            "recommendedProductId": "expert-full-service",
            "recommendedProductName": "Expert Full Service",
            "price": 250,
            "currency": "CAD",
            "confidence": "high",
            "reasons": reasons,
            "matchedInputs": matched_inputs,
            "optionalUpgrade": None,
            "warnings": ["This product covers personal tax situations only. Incorporated business filing is not included."],
            "disclaimer": DISCLAIMER,
        }

    if help_preference == "expert_help_while_filing":
        matched_inputs.append("Expert help while filing")
        reasons.append("You want expert assistance while preparing your own return.")
        return {
            "recommendedProductId": "expert-assist",
            "recommendedProductName": "Expert Assist",
            "price": 120,
            "currency": "CAD",
            "confidence": "high",
            "reasons": reasons,
            "matchedInputs": matched_inputs,
            "optionalUpgrade": {
                "productId": "expert-full-service",
                "productName": "Expert Full Service",
                "reason": "If you prefer an expert to handle everything, consider upgrading to Expert Full Service."
            },
            "warnings": ["This product covers personal tax situations only. Incorporated business filing is not included."],
            "disclaimer": DISCLAIMER,
        }

    self_employed_triggers = {
        "freelancer_self_employed": "You selected Freelancer / Self-Employed as your filing type.",
        "freelance_income": "You have freelance income.",
        "gig_work_income": "You have gig-work income.",
        "business_revenue": "You have business revenue as an individual.",
        "business_expenses": "You have business expenses.",
        "home_office_expenses": "You have home-office expenses.",
        "vehicle_expenses": "You have vehicle expenses.",
    }

    self_employed_reasons = []
    if filing_type == "freelancer_self_employed":
        self_employed_reasons.append(self_employed_triggers["freelancer_self_employed"])
        matched_inputs.append("Freelancer / Self-Employed filing type")

    for item in income_sources:
        if item in self_employed_triggers:
            self_employed_reasons.append(self_employed_triggers[item])
            matched_inputs.append(item.replace("_", " ").title())

    for item in deductions:
        if item in self_employed_triggers:
            self_employed_reasons.append(self_employed_triggers[item])
            matched_inputs.append(item.replace("_", " ").title())

    if self_employed_reasons:
        reasons.extend(self_employed_reasons)
        return {
            "recommendedProductId": "self-employed",
            "recommendedProductName": "Self-Employed",
            "price": 70,
            "currency": "CAD",
            "confidence": "high",
            "reasons": reasons,
            "matchedInputs": matched_inputs,
            "optionalUpgrade": {
                "productId": "expert-assist",
                "productName": "Expert Assist",
                "reason": "If you want guidance from a tax expert, consider upgrading to Expert Assist."
            },
            "warnings": ["This product does not support incorporated business filing."],
            "disclaimer": DISCLAIMER,
        }

    premier_triggers = {
        "investment_income": "You have investment income.",
        "capital_gains": "You have capital gains.",
        "rental_income": "You have rental income.",
        "foreign_income": "You have foreign income.",
    }

    premier_reasons = []
    for item in income_sources:
        if item in premier_triggers:
            premier_reasons.append(premier_triggers[item])
            matched_inputs.append(item.replace("_", " ").title())

    if premier_reasons:
        reasons.extend(premier_reasons)
        return {
            "recommendedProductId": "premier",
            "recommendedProductName": "Premier",
            "price": 50,
            "currency": "CAD",
            "confidence": "high",
            "reasons": reasons,
            "matchedInputs": matched_inputs,
            "optionalUpgrade": {
                "productId": "self-employed",
                "productName": "Self-Employed",
                "reason": "If you also have self-employment income, upgrade to Self-Employed."
            },
            "warnings": [],
            "disclaimer": DISCLAIMER,
        }

    deluxe_triggers = {
        "medical_expenses": "You have medical expenses.",
        "donations": "You have charitable donations.",
        "employment_expenses": "You have employment-related expenses.",
    }

    deluxe_reasons = []
    for item in deductions:
        if item in deluxe_triggers:
            deluxe_reasons.append(deluxe_triggers[item])
            matched_inputs.append(item.replace("_", " ").title())

    if deluxe_reasons:
        reasons.extend(deluxe_reasons)
        return {
            "recommendedProductId": "deluxe",
            "recommendedProductName": "Deluxe",
            "price": 30,
            "currency": "CAD",
            "confidence": "high",
            "reasons": reasons,
            "matchedInputs": matched_inputs,
            "optionalUpgrade": {
                "productId": "premier",
                "productName": "Premier",
                "reason": "If you have investment or rental income, consider upgrading to Premier."
            },
            "warnings": [],
            "disclaimer": DISCLAIMER,
        }

    for item in income_sources:
        if item in ("salary_income", "student_income"):
            matched_inputs.append(item.replace("_", " ").title())

    reasons.append("Your tax situation is straightforward with basic income and no special deductions.")
    return {
        "recommendedProductId": "free",
        "recommendedProductName": "Free",
        "price": 0,
        "currency": "CAD",
        "confidence": "high",
        "reasons": reasons,
        "matchedInputs": matched_inputs if matched_inputs else ["Simple personal return"],
        "optionalUpgrade": {
            "productId": "deluxe",
            "productName": "Deluxe",
            "reason": "If you have medical expenses or donations to claim, consider upgrading to Deluxe."
        },
        "warnings": [],
        "disclaimer": DISCLAIMER,
    }
