from fastapi import FastAPI,HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel,Field

from graph1 import run_system

main=FastAPI(title="Multi model agent",description="Langraph+harness+groq")
class Runrequest(BaseModel):
    question:str=Field(min_length=2,max_length=300)
main.mount("/static",StaticFiles(directory="static"),name="static")

@main.get("/")
def home():
    return FileResponse("static/index.html")


@main.post("/run")
def run(request:Runrequest):
    try:
        ques=request.question.strip()
        if not ques:
           raise HTTPException(
               status_code=400,
               detail="question can not be empty"
           )
            
        result=run_system(ques)
        return{
            "success": True,
            "question": ques,
            "route": result.get("route", "blocked"),
            "answer": result.get("answer", ""),
            "blocked": result.get("blocked", False),
            "trace": result.get("trace", [])
        }
    except Exception as e:
        return f"error : {str(e)}"