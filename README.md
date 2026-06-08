# 🤖 AI Resume Analyzer

An AI-powered resume analysis tool that scores your resume against a job description, identifies keyword gaps, rewrites your resume, and generates personalized interview questions.

---

## ✨ Features

- 📊 **ATS Scoring** — Get a score out of 100 based on how well your resume matches a job description
- 🔍 **Keyword Analysis** — See matched and missing keywords at a glance
- 📋 **Section Feedback** — AI feedback on your summary, experience, skills, and education
- 🔄 **AI Resume Rewriter** — Rewrites your resume with missing keywords and stronger bullet points
- 🎤 **Interview Prep** — Generates technical, behavioral, and resume-based interview questions
- 🕓 **History** — Save and review all past analyses
- 🔐 **Auth** — Secure login/signup via Supabase

---

## 🛠️ Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14, Tailwind CSS |
| Backend | FastAPI, Python |
| AI/LLM | Groq (Llama 3.3 70B) |
| PDF Parsing | pdfplumber |
| Database + Auth | Supabase |

---

## 📁 Project Structure

```bash

ai-resume-analyzer/
├── backend/
│ ├── main.py
│ ├── analyzer.py
│ ├── parser.py
│ ├── requirements.txt
│ └── .env
├── frontend/
│ ├── app/
│ │ ├── page.tsx
│ │ ├── auth/
│ │ │ └── page.tsx
│ │ └── history/
│ │ └── page.tsx
│ ├── lib/
│ │ └── supabase.ts
│ └── .env.local
└── README.md

```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- Groq API key → [console.groq.com](https://console.groq.com)
- Supabase project → [supabase.com](https://supabase.com)

---

### Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac/Linux

pip install -r requirements.txt
```

Create `backend/.env`:

```env
GROQ_API_KEY=your_groq_api_key
```

Run the backend:

```bash
uvicorn main:app --reload
```

Backend runs at `http://localhost:8000`

---

### Frontend Setup

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Run the frontend:

```bash
npm run dev
```

Frontend runs at `http://localhost:3000`

---

### Supabase Setup

Run this in your Supabase SQL Editor:

```sql
create table resume_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  file_name text,
  ats_score int,
  matched_keywords text[],
  missing_keywords text[],
  section_feedback jsonb,
  rewritten_resume text,
  created_at timestamp default now()
);

alter table resume_history enable row level security;

create policy "Users can view own history"
  on resume_history for select
  using (auth.uid() = user_id);

create policy "Users can insert own history"
  on resume_history for insert
  with check (auth.uid() = user_id);
```

---

### Backend `requirements.txt`

```bash

fastapi
uvicorn
pdfplumber
python-multipart
groq
python-dotenv

```

---

## 📸 Screenshots

> Add screenshots here after deployment

---

## 🔮 Future Improvements

- [ ] DOCX file support
- [ ] Download rewritten resume as PDF
- [ ] Voice-based mock interview (Project 3)
- [ ] Deploy frontend on Vercel + backend on Render

---

## 👨‍💻 Author

**Jivitesh Singh**
B.Tech CSE — Amity University Chhattisgarh