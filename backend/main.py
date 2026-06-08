from analyzer import analyze_resume
from pydantic import BaseModel
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from parser import parse_resume
from analyzer import rewrite_resume, generate_interview_questions

import shutil, os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeRequest(BaseModel):
    resume_text: str
    job_description: str

class RewriteRequest(BaseModel):
    resume_text: str
    missing_keywords: list

class InterviewRequest(BaseModel):
    resume_text: str
    job_description: str

@app.post("/interview-questions")
def interview_questions(req: InterviewRequest):
    result = generate_interview_questions(req.resume_text, req.job_description)
    return result

@app.post("/rewrite")
def rewrite(req: RewriteRequest):
    result = rewrite_resume(req.resume_text, req.missing_keywords)
    return {"rewritten_resume": result}

@app.post("/analyze")
def analyze(req: AnalyzeRequest):
    result = analyze_resume(req.resume_text, req.job_description)
    return result

@app.get("/")
def root():
    return {"message": "AI Resume Analyzer API"}

@app.post("/upload")
async def upload_resume(file: UploadFile = File(...)):
    with open("temp_resume.pdf", "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    text = parse_resume("temp_resume.pdf")
    os.remove("temp_resume.pdf")
    
    return {"extracted_text": text}