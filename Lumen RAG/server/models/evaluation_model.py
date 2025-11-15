import os
import google.generativeai as genai
from google.generativeai.generative_models import GenerativeModel
from google.generativeai.client import configure
from deepeval.test_case import LLMTestCase
from deepeval.metrics import (
    FaithfulnessMetric,
    HallucinationMetric,
    AnswerRelevancyMetric,
    ContextualRelevancyMetric
)
from deepeval.models.base_model import DeepEvalBaseLLM
from pydantic import BaseModel
import instructor
# from models.gemini_model import model
from typing import Dict, List, Union, Any
import asyncio
from dotenv import load_dotenv

load_dotenv()

# model = model

# class EvalModel(DeepEvalBaseLLM):
#     """Class to implement llm model for DeepEval"""
#     def __init__(self, model):
#         self.model = model

#     def load_model(self):
#         return self.model

#     def generate(self, prompt: str, **kwargs) -> 'Union[str, Any]':
#         """Handle DeepEval's schema parameter by accepting kwargs"""
#         chat_model = self.load_model()
        
#         # Get content from the model
#         content = chat_model.invoke(prompt).content
        
#         # Create a Verdict class that matches DeepEval's expected format
#         class Verdict:
#             def __init__(self, verdict_str, reason_str):
#                 self.verdict = verdict_str
#                 self.reason = reason_str
#                 self.statement = reason_str  # Add this line to fix the error

#         # Create a list of Verdict objects
#         verdicts_list = []
#         for line in content.split('\n'):
#             if line.strip():
#                 verdicts_list.append(Verdict("Pass", line.strip()))
        
#         # Check the schema name to determine what kind of result to return
#         if 'schema' in kwargs:
#             schema_name = kwargs['schema'].__name__
            
#             if 'Claim' in schema_name:
#                 # Return an object with claims attribute
#                 class ClaimsResult:
#                     def __init__(self, content):
#                         self.claims = content.split("\n") if content else []
#                         self.verdicts = verdicts_list
#                         self.reason = content
#                 return ClaimsResult(content)
            
#             elif 'Truth' in schema_name or 'Verdict' in schema_name:
#                 # Return an object with truths or verdicts attribute
#                 class TruthsResult:
#                     def __init__(self, content):
#                         self.truths = content.split("\n") if content else []
#                         self.verdicts = verdicts_list
#                         self.reason = content
#                 return TruthsResult(content)
    
#         # Default case - provide all attributes
#         class CompleteResult:
#             def __init__(self, content):
#                 self.truths = content.split("\n") if content else []
#                 self.claims = content.split("\n") if content else []
#                 self.verdicts = verdicts_list
#                 self.reason = content
#         return CompleteResult(content)


#     async def a_generate(self, prompt: str, **kwargs) -> 'Union[str, Any]':
#         chat_model = self.load_model()
#         res = await chat_model.ainvoke(prompt)
#         content = res.content if hasattr(res, 'content') else str(res)
        
#         # Create verdict objects
#         class Verdict:
#             def __init__(self, verdict_str, reason_str):
#                 self.verdict = verdict_str
#                 self.reason = reason_str
#                 self.statement = reason_str  # Add this line to fix the error

#         verdicts_list = []
#         for line in content.split('\n'):
#             if line.strip():
#                 verdicts_list.append(Verdict("Pass", line.strip()))
        
#         # Check schema name
#         if 'schema' in kwargs:
#             schema_name = kwargs['schema'].__name__
            
#             # Handle Answer Relevancy metric
#             if 'Statement' in schema_name:
#                 class StatementResult:
#                     def __init__(self, content):
#                         self.statements = content.split("\n") if content else []
#                         self.verdicts = verdicts_list
#                         self.reason = content
#                 return StatementResult(content)
                
#             elif 'Claim' in schema_name:
#                 # Return an object with claims attribute
#                 class ClaimsResult:
#                     def __init__(self, content):
#                         self.claims = content.split("\n") if content else []
#                         self.verdicts = verdicts_list
#                         self.reason = content  # Add this line
#                 return ClaimsResult(content)
            
#             elif 'Truth' in schema_name:
#                 # Return an object with truths attribute
#                 class TruthsResult:
#                     def __init__(self, content):
#                         self.truths = content.split("\n") if content else []
#                         self.verdicts = verdicts_list
#                         self.reason = content  # Add this line
#                 return TruthsResult(content)

#         # Default case - provide all attributes
#         class TruthsAndClaimsResult:
#             def __init__(self, content):
#                 self.truths = content.split("\n") if content else []
#                 self.claims = content.split("\n") if content else []
#                 self.content = content
#                 self.verdicts = verdicts_list
#                 self.reason = content  # Add this line
#         return TruthsAndClaimsResult(content)

#     def get_model_name(self):
#         return "evaluation_model"
    
# eval_model = EvalModel(model=model)

#  using a custom gemini-1.5-flash llm through Vertex AI for evaluation
configure(api_key=os.getenv("GOOGLE_API_KEY"))
class CustomGeminiFlash(DeepEvalBaseLLM):
    def __init__(self):
        self.model = GenerativeModel(model_name="models/gemini-1.5-flash")

    def load_model(self):
        return self.model

    def generate(self, prompt: str, schema: type[BaseModel]) -> BaseModel:
        client = self.load_model()
        instructor_client = instructor.from_gemini(
            client=client,
            mode=instructor.Mode.GEMINI_JSON,
        )
        resp = instructor_client.messages.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            response_model=schema,
        )
        return resp

    async def a_generate(self, prompt: str, schema: type[BaseModel]) -> BaseModel:
        return self.generate(prompt, schema)

    def get_model_name(self):
        return "Gemini 1.5 Flash"

eval_model = CustomGeminiFlash()
    
def evaluate_response(query: str, response: str, contexts: List[str]) -> Dict:
    """Evaluate a response against contexts using DeepEval."""
    # Check if contexts is empty or None
    if not contexts:
        contexts = ["No specific context available for evaluation"]

    # Create a test case with the query, response, and contexts
    test_case = LLMTestCase(
        input=query,
        actual_output=response,
        context=contexts,
        retrieval_context=contexts
    )

    # Create metric instances 
    faithfulness_metric = FaithfulnessMetric(threshold=0.7,model=eval_model,include_reason=True)
    hallucination_metric = HallucinationMetric(threshold=0.7,model=eval_model)
    answer_relevancy_metric = AnswerRelevancyMetric(threshold=0.7,model=eval_model,include_reason=True)
    # contextual_relevancy_metric = ContextualRelevancyMetric(threshold=0.7,model=eval_model,include_reason=True)

    # Evaluate metrics individually
    faithfulness_metric.measure(test_case)
    hallucination_metric.measure(test_case)
    answer_relevancy_metric.measure(test_case)
    # contextual_relevancy_metric.measure(test_case)

    # Return combined results
    return {
        "faithfulness": {
            "score": faithfulness_metric.score,
            "reason": faithfulness_metric.reason
        },
        "hallucination": {
            "score": hallucination_metric.score,
            "reason": hallucination_metric.reason
        },
        "answer_relevancy": {
            "score": answer_relevancy_metric.score,
            "reason": answer_relevancy_metric.reason
        }
        # ,
        # "contextual_relevancy": {
        #     "score": contextual_relevancy_metric.score,
        #     "reason": contextual_relevancy_metric.reason
        # }
    }
