from langgraph.graph import StateGraph, START, END
from typing import Literal, TypedDict

from main import (
    technical_agent,
    billing_agent,
    genral_agent,
    review_agent
)



class SupportState(TypedDict):
    question: str
    route: str
    draft: str
    final_answer: str
    blocked: bool
    trace: list[str]



def guardrail(state: SupportState):

    question = state["question"].strip().lower()

    dangerous_phrases = [
        "give me your password",
        "give your password",
        "tell me your password",
        "show me your password",
        "steal password",
        "steal the password",
        "full credit card number",
        "give me full credit card number",
        "give the full credit card number"
    ]

    blocked = any(
        phrase in question
        for phrase in dangerous_phrases
    )

    trace = state.get("trace", []) + [
        "Guardrail security check"
    ]

    print("QUESTION:", question)
    print("GUARDRAIL BLOCKED:", blocked)


    if blocked:

        return {
            "blocked": True,
            "route": "blocked",

            "final_answer": (
                "I cannot help with requests involving "
                "password theft or full credit card numbers."
            ),

            "trace": trace
        }

    

    return {
        "blocked": False,
        "trace": trace
    }


 

def after_guardrail(state: SupportState) -> Literal["router", "end"]:

    

    if state.get("blocked", False):
        return "end"

    return "router"




def router_node(state: SupportState):

    question = state["question"].lower()

    technical_words = [
        "error",
        "bug",
        "login",
        "api",
        "install",
        "installation",
        "code",
        "server",
        "technical"
    ]

    billing_words = [
        "price",
        "pricing",
        "payment",
        "refund",
        "bill",
        "billing",
        "subscription",
        "plan",
        "charged"
    ]

    if any(
        word in question
        for word in technical_words
    ):
        route = "technical"

    elif any(
        word in question
        for word in billing_words
    ):
        route = "billing"

    else:
        route = "general"

    return {
        "route": route,

        "trace": state.get("trace", []) + [
            f"Router selected {route} agent"
        ]
    }




def choose_agent(
    state: SupportState
) -> Literal[
    "technical_agent",
    "billing_agent",
    "general_agent"
]:

    if state["route"] == "technical":
        return "technical_agent"

    if state["route"] == "billing":
        return "billing_agent"

    return "general_agent"




def technical_node(state: SupportState):

    answer = technical_agent(
        state["question"]
    )

    return {
        "draft": answer,

        "trace": state.get("trace", []) + [
            "Technical agent completed"
        ]
    }




def billing_node(state: SupportState):

    answer = billing_agent(
        state["question"]
    )

    return {
        "draft": answer,

        "trace": state.get("trace", []) + [
            "Billing agent completed"
        ]
    }




def general_node(state: SupportState):

    answer = genral_agent(
        state["question"]
    )

    return {
        "draft": answer,

        "trace": state.get("trace", []) + [
            "General agent completed"
        ]
    }



def review_node(state: SupportState):

    final_answer = review_agent(
        state["question"],
        state["draft"]
    )

    return {
        "final_answer": final_answer,

        "trace": state.get("trace", []) + [
            "Review agent completed"
        ]
    }




graph = StateGraph(SupportState)


graph.add_node(
    "guardrail",
    guardrail
)

graph.add_node(
    "router",
    router_node
)

graph.add_node(
    "technical_agent",
    technical_node
)

graph.add_node(
    "billing_agent",
    billing_node
)

graph.add_node(
    "general_agent",
    general_node
)

graph.add_node(
    "review",
    review_node
)




graph.add_edge(
    START,
    "guardrail"
)




graph.add_conditional_edges(
    "guardrail",
    after_guardrail,
    {
        "router": "router",
        "end": END
    }
)




graph.add_conditional_edges(
    "router",
    choose_agent,
    {
        "technical_agent": "technical_agent",
        "billing_agent": "billing_agent",
        "general_agent": "general_agent"
    }
)




graph.add_edge(
    "technical_agent",
    "review"
)

graph.add_edge(
    "billing_agent",
    "review"
)

graph.add_edge(
    "general_agent",
    "review"
)




graph.add_edge(
    "review",
    END
)




build = graph.compile()



def run_system(question: str):

    initial_state: SupportState = {

        "question": question,

        "route": "",

        "draft": "",

        "final_answer": "",

        "blocked": False,

        "trace": []
    }


    response = build.invoke(
        initial_state
    )




    return {

        "route": (
            "blocked"
            if response.get("blocked", False)
            else response.get("route", "general")
        ),

        "answer": response.get(
            "final_answer",
            ""
        ),

        "blocked": response.get(
            "blocked",
            False
        ),

        "trace": response.get(
            "trace",
            []
        )
    }




if __name__ == "__main__":

    user_query = input(
        "Enter your question: "
    )

    result = run_system(
        user_query
    )

    print("\nFINAL RESULT:")
    print(result)