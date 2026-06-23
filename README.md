# TaxAdvisor — AI-Powered Tax Software Product Recommender

An AI-assisted web application that helps users find the right tax software product based on their personal tax situation. Built as an interview assignment for the IT Officer position at Quaid-e-Azam Solar Power (Pvt) Ltd.

---

## Tech Stack

| Layer    | Technology                                                                 |
|----------|----------------------------------------------------------------------------|
| Frontend | React 19, Vite 7, TypeScript 5, Tailwind CSS 4, React Router v6, Axios    |
| Backend  | Python 3.x, Django 4.2, Django REST Framework 3.14, SQLite                 |
| AI       | Simulated rule-based assistant (no external API required)                  |
| Admin    | Django built-in protected Admin interface                                  |

---

## Routes and Pages Implemented

| Route | Page | Purpose |
|---|---|---|
| `/` | Landing page | Introduces TaxAdvisor, previews products, explains the workflow, and includes FAQs. |
| `/products` | Products page | Lists all products with search and sorting. |
| `/compare` | Product comparison page | Compares product prices and supported features side by side. |
| `/recommend` | Recommendation wizard | Collects questionnaire answers and displays a rule-based recommendation. |
| `/assistant` | AI assistant | Provides simulated, product-selection guidance with safety disclaimers. |
| `/admin/` | Django Admin | Protected staff-only product management interface. |

---

## Folder Structure

```
Project Folder/
├── .venv/                          ← Python virtual environment (created during setup)
├── Frontend/                       ← React + Vite frontend and frontend-only packages
│   └── src/
│       ├── api/api.ts              ← Axios API client
│       ├── pages/                  ← Route-level page components
│       ├── components/             ← Shared UI components
│       ├── App.tsx                 ← Router and layout
│       └── main.tsx                ← React entry point
├── Backend/
│   ├── config/                     ← Django settings, root URLs, WSGI
│   ├── products/                   ← Core Django app
│   │   ├── models.py               ← Product model
│   │   ├── views.py                ← API views
│   │   ├── serializers.py          ← DRF serializers
│   │   ├── urls.py                 ← App URL patterns
│   │   ├── admin.py                ← Django Admin registration
│   │   ├── recommendation_engine.py← Deterministic recommendation logic
│   │   ├── assistant_engine.py     ← Rule-based AI assistant logic
│   │   └── management/commands/
│   │       └── seed_products.py    ← Database seed command
│   ├── manage.py
│   ├── requirements.txt
│   └── db.sqlite3                  ← SQLite database (auto-created)
├── README.md
└── .gitignore
```

`Frontend/` contains the React source directly; it is not a symlink.

---

## Features Implemented

- **Landing page** — hero section, how-it-works, featured product cards, FAQ accordion, footer
- **Products page** — all 8 products with live search, sort by price, feature tags, CTA buttons
- **Compare page** — side-by-side feature comparison table for all 8 products
- **Recommendation wizard** — 4–5 step guided questionnaire with progress bar and dynamic routing (company revenue step only shown for incorporated companies)
- **Recommendation result** — structured card with product name, price, reasons, matched inputs, optional upgrade hint, and disclaimer
- **AI Assistant** — clean chat interface with 7 sample questions, typing indicator, keyword-based safe responses
- **Django Admin** — protected full CRUD for products at `/admin/` (requires a staff account)
- **SQLite database** — pre-seeded with all 8 products via management command

---

## Setup Instructions

### Prerequisites

- Python 3.9 or later
- Node.js 18 or later and pnpm

### Start the full project

From the project root, install dependencies once and then start Django and the React app together:

```bash
pnpm install
pnpm run dev
```

The backend runs at `http://127.0.0.1:8000`. The frontend normally uses `http://localhost:5173`; if that port is already busy, Vite selects the next available port and prints it in the terminal.

---

### Backend Setup

```bash
# Navigate to the Backend folder
cd Backend

# Create and activate the Python virtual environment
python -m venv ../.venv

# Activate (Linux / macOS)
source ../.venv/bin/activate

# Activate (Windows)
..\.venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Apply database migrations
python manage.py makemigrations
python manage.py migrate

# Seed all 8 products into the database
python manage.py seed_products

# (Optional) Create a Django Admin superuser
python manage.py createsuperuser

# Start the Django development server
python manage.py runserver
```

The Django API will be available at: **http://localhost:8000**

Django Admin panel: **http://localhost:8000/admin/**

---

### Frontend Setup

```bash
# Navigate to the Frontend folder
cd Frontend

# Install Node.js dependencies from the project root
pnpm install

# Start the Vite development server
pnpm run dev
```

The React app will be available at: **http://localhost:5173** (or the next available port).

> The Vite dev server automatically proxies all `/api/*` requests to the Django backend at `http://localhost:8000` — no extra configuration needed.

---

## API Endpoints

| Method | Endpoint               | Description                                        |
|--------|------------------------|----------------------------------------------------|
| GET    | `/api/products/`       | Returns all 8 tax software products                |
| POST   | `/api/recommend/`      | Accepts questionnaire answers, returns a recommendation |
| POST   | `/api/assistant/`      | Accepts a natural-language question, returns a safe rule-based response |
| —      | `/admin/`              | Protected Django Admin panel (full CRUD, requires a staff account) |

### POST `/api/recommend/` — Request Body

```json
{
  "filing_type": "personal | freelancer_self_employed | incorporated_company",
  "income_sources": ["salary_income", "investment_income", "rental_income", ...],
  "deductions": ["medical_expenses", "donations", "home_office_expenses", ...],
  "help_preference": "file_myself | expert_help_while_filing | expert_file_for_me",
  "company_revenue": "yes | no | null"
}
```

### POST `/api/assistant/` — Request Body

```json
{
  "question": "What is the difference between Premier and Self-Employed?"
}
```

---

## Product Model

Each product is stored in the SQLite database with the following fields:

| Field                 | Type    | Description                                         |
|-----------------------|---------|-----------------------------------------------------|
| `product_id`          | string  | Unique slug (e.g. `free`, `self-employed`)          |
| `name`                | string  | Display name (e.g. `Free`, `Deluxe`)                |
| `price`               | decimal | Price in CAD                                        |
| `currency`            | string  | Always `CAD`                                        |
| `description`         | text    | Short product description                           |
| `best_for`            | text    | Who this product is best suited for                 |
| `salary_income`       | boolean | Supports salary income                              |
| `student_income`      | boolean | Supports student income                             |
| `medical_expenses`    | boolean | Supports medical expense deductions                 |
| `donations`           | boolean | Supports charitable donation deductions             |
| `employment_expenses` | boolean | Supports employment-related expenses                |
| `investment_income`   | boolean | Supports investment income                          |
| `capital_gains`       | boolean | Supports capital gains                              |
| `foreign_income`      | boolean | Supports foreign income                             |
| `rental_income`       | boolean | Supports rental income                              |
| `freelance_income`    | boolean | Supports freelance / self-employed income           |
| `gig_work_income`     | boolean | Supports gig-work income                            |
| `business_expenses`   | boolean | Supports business expense deductions                |
| `home_office_expenses`| boolean | Supports home-office deductions                     |
| `vehicle_expenses`    | boolean | Supports vehicle expense deductions                 |
| `expert_help`         | boolean | Includes expert chat / review assistance            |
| `full_service`        | boolean | Expert prepares and files the return                |
| `corporate_filing`    | boolean | Supports incorporated company filing                |
| `nil_corporate_return`| boolean | Supports nil (no-revenue) corporate return          |

---

## Products

| # | Product              | Price (CAD) | Best For                                      |
|---|----------------------|-------------|-----------------------------------------------|
| 1 | Free                 | $0          | Simple personal return, salary/student income |
| 2 | Deluxe               | $30         | Medical expenses, donations, employment costs |
| 3 | Premier              | $50         | Investments, capital gains, rental, foreign   |
| 4 | Self-Employed        | $70         | Freelancers, contractors, sole proprietors    |
| 5 | Expert Assist        | $120        | Users who want expert help while filing       |
| 6 | Expert Full Service  | $250        | Users who want an expert to file for them     |
| 7 | Business Corporate   | $400        | Incorporated companies with revenue           |
| 8 | Nil Corporate Return | $175        | Incorporated companies with no revenue        |

---

## Recommendation Engine

**File:** `Backend/products/recommendation_engine.py`

The engine uses a deterministic priority-based decision tree. Higher-priority rules always override lower-priority ones.

| Priority | Rule                | Condition                                                       | Result                        |
|----------|---------------------|-----------------------------------------------------------------|-------------------------------|
| 1        | Incorporated        | Filing type is incorporated company                             | Business Corporate or Nil Corporate Return |
| 2        | Expert Full Service | Help preference is "expert to file for me"                      | Expert Full Service           |
| 3        | Expert Assist       | Help preference is "expert help while filing"                   | Expert Assist                 |
| 4        | Self-Employed       | Freelance/gig income, or business/home-office/vehicle expenses  | Self-Employed                 |
| 5        | Premier             | Investment income, capital gains, rental income, foreign income | Premier                       |
| 6        | Deluxe              | Medical expenses, donations, or employment expenses             | Deluxe                        |
| 7        | Free                | Simple personal situation (default fallback)                    | Free                          |

---

## AI Assistant

**File:** `Backend/products/assistant_engine.py`

The assistant is fully simulated and rule-based — no external AI API is used.

**How it works:**
1. The user's question is lowercased and scanned for product-related keywords
2. Matched keywords map to specific product facts, comparisons, and eligibility rules
3. The engine returns a structured response with a recommendation or explanation
4. All responses include a legal safety disclaimer

**Safety behavior:**
- The assistant will NOT guarantee refunds, tax outcomes, or deduction eligibility
- Questions asking for guarantees trigger a safe disclaimer response
- The assistant is scoped to product selection guidance only — no tax/legal/financial advice

**Example — refund guarantee question:**

> Input: `"Can you guarantee I will get a refund?"`
>
> Output: `"Based on the product rules, I can help you identify which product may suit your situation. However, I cannot guarantee any specific tax outcome, refund, or eligibility. Please consult a qualified tax professional for personalized advice."`

---

## Administration

The navbar's **Admin** link opens Django Admin at `/admin/`. Django requires authentication before granting access, and staff users can create, edit, search, filter, and delete product configuration records.

---

## Manual Verification Table

| Scenario                                    | Expected Result          | Status |
|---------------------------------------------|--------------------------|--------|
| Salary only                                 | Free                     | Pass   |
| Salary + donations                          | Deluxe                   | Pass   |
| Investment income                           | Premier                  | Pass   |
| Rental income                               | Premier                  | Pass   |
| Freelance income                            | Self-Employed            | Pass   |
| Home-office expenses                        | Self-Employed            | Pass   |
| Wants expert help while filing              | Expert Assist            | Pass   |
| Wants expert to file for them               | Expert Full Service      | Pass   |
| Incorporated company with revenue           | Business Corporate       | Pass   |
| Incorporated company with no revenue        | Nil Corporate Return     | Pass   |
| AI asked about refund guarantee             | Safe disclaimer response | Pass   |

---

## Known Limitations

- The AI assistant is fully simulated and rule-based; it does not use a real language model
- Django Admin requires manual superuser creation (`python manage.py createsuperuser`)
- The database is SQLite — suitable for development and demonstration, not production scale

---

## Future Improvements

The following features were scoped out to prioritize core correctness and local run reliability:

- PDF export of the recommendation result
- Multilingual support (French/English for the Canadian audience)
- Real AI API integration (OpenAI, Gemini, or Anthropic) with appropriate safety guardrails
- Automated test suite (unit tests for recommendation engine, integration tests for API endpoints)
- CI/CD workflow for automated linting and testing on push
- PostgreSQL migration for production-grade persistence

---

## Use of AI During Development

AI tools were used for initial scaffolding, UI structure suggestions, and implementation support. The product rules, recommendation logic, validation flows, AI safety behavior, manual verification, code cleanup, and final documentation were reviewed and verified manually.
