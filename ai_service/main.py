import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="SmartCampus AI Microservice", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    role: str = "Student"
    context: str = ""

class TriageRequest(BaseModel):
    title: str
    description: str

class TipsRequest(BaseModel):
    subject: str

def generate_llm_response(prompt: str) -> str:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or api_key == "your_gemini_api_key_here":
        return ""
    try:
        from google import genai
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model=os.getenv("LLM_MODEL", "gemini-2.5-flash"),
            contents=prompt,
        )
        return response.text
    except Exception as e:
        print(f"Gemini API error: {e}")
        return ""

@app.get("/")
def root():
    return {"status": "online", "service": "SmartCampus AI Service"}

@app.get("/health")
def health():
    return {"status": "healthy", "key_configured": bool(os.getenv("GEMINI_API_KEY"))}

@app.post("/chat")
def campus_chat(req: ChatRequest):
    prompt = f"You are SmartCampus AI, a friendly college campus assistant for {req.role}s. Answer concisely: {req.message}"
    llm_answer = generate_llm_response(prompt)
    if llm_answer:
        return {"reply": llm_answer, "source": "llm"}

    msg = req.message.lower()
    if "attendance" in msg:
        reply = "Campus policy requires a minimum of 75% attendance to appear in final semester examinations. You can monitor your standing in the Attendance tab."
    elif "complaint" in msg or "hostel" in msg or "wifi" in msg or "water" in msg:
        reply = "You can submit maintenance, hostel, WiFi, and mess complaints under the 'Complaints' tab. Our facilities staff will be notified in real time."
    elif "booking" in msg or "lab" in msg or "hall" in msg:
        reply = "Classrooms and computer labs can be booked under the 'Bookings' tab. Requests are reviewed and approved by the college administration."
    elif "exam" in msg or "timetable" in msg:
        reply = "The department lecture schedules and midterm exam timetables are accessible under the 'Timetable' tab."
    else:
        reply = "Hello! As SmartCampus AI, I can help you with attendance inquiries, timetable schedules, complaint tracking, and study preparation. How can I assist you today?"
    return {"reply": reply, "source": "knowledge_base"}

@app.post("/triage")
def triage_complaint(req: TriageRequest):
    text = (req.title + " " + req.description).lower()
    category = "Other"
    priority = "Medium"

    if any(k in text for k in ["wifi", "internet", "network", "router", "lan"]):
        category = "Network/WiFi"
        priority = "High" if "down" in text or "exam" in text else "Medium"
    elif any(k in text for k in ["projector", "bench", "door", "light", "fan", "ac", "electrical"]):
        category = "Infrastructure"
        priority = "High" if "spark" in text or "dark" in text else "Medium"
    elif any(k in text for k in ["hostel", "room", "bed", "bathroom", "shower", "water purifier", "leak"]):
        category = "Hostel"
        priority = "Urgent" if "leak" in text or "overflow" in text else "Medium"
    elif any(k in text for k in ["mess", "food", "canteen", "lunch", "dinner", "hygiene"]):
        category = "Mess/Canteen"
        priority = "High"
    elif any(k in text for k in ["syllabus", "grade", "marks", "professor", "class", "lecture"]):
        category = "Academic"
        priority = "Low"

    return {"category": category, "priority": priority, "confidence": 0.92}

@app.post("/study-tips")
def study_tips(req: TipsRequest):
    prompt = f"Provide 4 concise, high-yield engineering study tips and exam strategies for the subject: {req.subject}."
    llm_answer = generate_llm_response(prompt)
    if llm_answer:
        return {"subject": req.subject, "tips": llm_answer}

    tips = (
        f"Key study plan for {req.subject}:\n"
        "1. Master Core Definitions & Diagrams: Sketch architecture/circuit flows from memory.\n"
        "2. Solve Previous 5-Year University Papers: High exam question recurrence.\n"
        "3. Lab Connection: Correlate theoretical algorithms with hands-on lab experiments.\n"
        "4. Spaced Revision: Revisit formulas and key theorems 48 hours before evaluation."
    )
    return {"subject": req.subject, "tips": tips}
