import os
import re
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def analyze_resume(resume_text: str, job_description: str) -> dict:
    prompt = f"""
You are an ATS (Applicant Tracking System) expert.

Analyze the resume below against the job description and return a JSON response with:
1. "ats_score": a score out of 100
2. "matched_keywords": list of keywords found in both resume and JD
3. "missing_keywords": list of important keywords from JD missing in resume
4. "section_feedback": dict with feedback for each section (summary, experience, skills, education)

Resume:
{resume_text}

Job Description:
{job_description}

IMPORTANT: Return ONLY a raw JSON object. No markdown, no code blocks, no extra text.
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
    )

    content = response.choices[0].message.content.strip()

    # Strip markdown code blocks if present
    content = re.sub(r"```json|```", "", content).strip()

    try:
        return json.loads(content)
    except json.JSONDecodeError:
        # Extract JSON object from response as fallback
        match = re.search(r"\{.*\}", content, re.DOTALL)
        if match:
            return json.loads(match.group())
        raise ValueError(f"Could not parse JSON from response: {content}")
    
def rewrite_resume(resume_text: str, missing_keywords: list) -> str:
    prompt = f"""
You are a professional resume writer.

Rewrite the ENTIRE resume below with these improvements:
1. If there is no summary/objective section, CREATE one (3-4 lines) tailored to the role based on the candidate's skills and experience
2. If a summary exists, REWRITE it to be stronger, more impactful, and role-specific
3. Incorporate these missing keywords naturally throughout: {", ".join(missing_keywords)}
4. Strengthen ALL bullet points with action verbs and measurable impact where possible
5. Keep the same structure and all original sections intact
6. Make it ATS-friendly

Resume:
{resume_text}

Return ONLY the complete rewritten resume text. No commentary, no explanation.
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.5,
    )

    return response.choices[0].message.content.strip()

def generate_interview_questions(resume_text: str, job_description: str) -> dict:
    prompt = f"""
You are an expert technical interviewer.

Based on the resume and job description below, generate likely interview questions in 3 categories:

1. "technical": 5 technical/skill-based questions based on the candidate's stack and JD requirements
2. "behavioral": 3 behavioral questions (STAR format) based on their experience
3. "resume_based": 3 questions the interviewer would likely ask directly from the resume

Resume:
{resume_text}

Job Description:
{job_description}

Return ONLY a raw JSON object with keys: technical, behavioral, resume_based (each an array of strings). No markdown, no extra text.
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.5,
    )

    content = response.choices[0].message.content.strip()
    content = re.sub(r"```json|```", "", content).strip()

    try:
        return json.loads(content)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", content, re.DOTALL)
        if match:
            return json.loads(match.group())
        raise ValueError(f"Could not parse JSON: {content}")