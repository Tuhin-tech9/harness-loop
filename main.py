import os
from dotenv import load_dotenv
from langgraph.graph import StateGraph,START,END
from langchain_groq.chat_models import ChatGroq


load_dotenv()
## what we build
## userprompt ->guardrail-> router ## router decide where to go ->billing ->tech ->genral ## routing choose which agent to go -> then check reviwer all is ok the output goes to ->end giving the answer

api=os.getenv("GROQ_API_KEY")

# Model=Groq(
#     api_key=api
# )

# client=Model.models.list()

# for m in client.data:
#     print(m.id)
Model=ChatGroq(
    model="openai/gpt-oss-20b",
    temperature=0,
    api_key=api

)

def technical_agent(question:str)->str:
    prompt=f"""
    You are a technical support system 
    Your Job:
    -Help with login problems ,API errors,installations problems,bug, and technical setup,
    -Explain the solution in very simple step.
    - Never invent account-specific information.
    -IF important information is missing clearly what should user check
    customer question:
    {question}
    """
    return Model.invoke(prompt).content



def billing_agent(question:str)->str:
    prompt=f"""
    You are billing support agent 
    Demo company policy:
    -Starter Plan:$10/month
    -Pro Plan:$25/month
    -Refund requested must be reviewed by the billing team.
    -Never claim that a refund has been already approved.
    -Never ask for the card number and password.
    customer question:
    {question}

    """
    return Model.invoke(prompt).content

def genral_agent(question:str)->str:
    prompt=f"""
    You are Genral customer support agent.
    Answer genral question politly and simply
    If the question requires technical support or billing support,say that it should be handeld by the 
    appropiate specalist

    customer question:
    {question}
    """
    return Model.invoke(prompt).content

def review_agent(question:str,draft:str)->str:
    prompt=f"""
    You are the quality Review Agent in a production customer-support system
    Check the draft answer for :
    1. clarity
    2. relavance 
    3. unsafe requests for passwords/card numbers
    4. unsupported guarantess
    5. unnecessary complxity
    
    Rewrite the answer if needed
    keep the final answer choices and beginner friendly

    original customer question:
    {question}
     
    Draft answer:
    {draft}
    Return only the improved Final answer
    """
    return  Model.invoke(prompt).content