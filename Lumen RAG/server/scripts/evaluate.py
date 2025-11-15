import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import time
from models.evaluation_model import evaluate_response
from tools.personalized_financial_advisor import PersonalizedFinancialAdvisor
from utils.token_counter import estimate_tokens_from_context
import json
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from datetime import datetime

# --- TOKEN COST CONFIGURATION ---
# Example: If rates are $0.02/1M input tokens and $0.04/1M output tokens
MODEL_CONTEXT_TOKEN_RATE = 0.05 / 1_000_000  # Per token
MODEL_RESPONSE_TOKEN_RATE = 0.10 / 1_000_000 # Per token
# --- END TOKEN COST CONFIGURATION ---

JUDGE_NAME = "gemini-1.5-flash"
LLM_NAME = "mistralai/mistral-small-3.2-24b-instruct:free"


# def evaluate_financial_advice(query: str, user_id: str):
#     """Get and evaluate a response from the financial advisor"""
#     # 1. Create advisor instance
#     advisor = PersonalizedFinancialAdvisor()
    
#     # 2. Get context from the advisor's retrieve_context method
#     contexts_dict = advisor.retrieve_context(query, user_id, top_k=50)
    
#     # 3. Get vector contexts (these are the text chunks from documents)
#     vector_contexts = contexts_dict.get("vector_contexts", [])
    
#     # 4. Format the contexts dictionary for generating a response
#     formatted_contexts = {
#         "vector_contexts": vector_contexts,
#         "graph_facts": contexts_dict.get("graph_facts", [])
#     }
    
#     # 5. Generate a response based on the query and contexts
#     response = advisor.generate_personalized_response(query, user_id, formatted_contexts)
    
#     # 6. Run the evaluation
#     print(f"Query: {query}")
#     print(f"Response: {response[:100]}...")  # Show first 100 chars of response
    
#     evaluation_results = evaluate_response(query, response, vector_contexts)

#     # 7. Estimate token usage
#     # Add token counting after response generation
#     token_usage = estimate_tokens_from_context(vector_contexts, query, response)
    
#     print(f"Token usage - Context: {token_usage['context_tokens']}, " 
#           f"Query: {token_usage['query_tokens']}, "
#           f"Response: {token_usage['response_tokens']}")
    
#     return {
#         "query": query,
#         "response": response,
#         "contexts": vector_contexts,
#         "evaluation": evaluation_results,
#         "token_usage": token_usage
#     }


def run_comprehensive_evaluation(user_id: str):
    """Run evaluation on multiple diverse financial queries"""
    # 1) Instantiate once
    advisor = PersonalizedFinancialAdvisor()

    # Define a diverse set of financial queries covering different aspects
    test_queries = [
        "What investment strategies should I consider based on my risk profile?",
        "How should I allocate my retirement portfolio?",
        "What are the tax implications of selling my stock investments?",
        "Should I pay off my mortgage early or invest that money?",
        "What's the difference between stocks and bonds?",
        "How can I reduce my tax liability legally?",
        "What are the pros and cons of index funds versus actively managed funds?",
        "What should I consider when planning for retirement in my 40s?"
    ]

    # Store all results
    all_results = []
    
    # Evaluate each query
    for i, query in enumerate(test_queries):
        print(f"\n--- Evaluating Query {i+1}/{len(test_queries)}: {query} ---")
        try:
            # 2) Reuse the same advisor
            contexts = advisor.retrieve_context(query, user_id, top_k=50)
            response = advisor.generate_personalized_response(query, user_id, {
                "vector_contexts": contexts["vector_contexts"],
                "graph_facts": contexts["graph_facts"]
            })

            evaluation_results = evaluate_response(query, response, contexts["vector_contexts"])
            token_usage = estimate_tokens_from_context(contexts["vector_contexts"], query, response)

            all_results.append({
                "query": query,
                "response": response,
                "contexts": contexts["vector_contexts"],
                "evaluation": evaluation_results,
                "token_usage": token_usage
            })
            
            # Add a significant delay between queries
            if i < len(test_queries) - 1:
                delay = 120  # 2 minutes
                print(f"Waiting {delay} seconds to avoid rate limits...")
                time.sleep(delay)
        except Exception as e:
            print(f"Error processing query: {e}")
            # Add error handling for failed queries
            all_results.append({
                "query": query,
                "response": "Error occurred",
                "contexts": [],
                "evaluation": {},
                "token_usage": {"context_tokens": 0, "query_tokens": 0, "response_tokens": 0, "total_tokens": 0},
                "error": str(e)
            })

    # Create summary dataframe
    summary_data = []
    for result in all_results:
        if result["evaluation"] and result["token_usage"]:
            summary_data.append({
                "query": result["query"][:50] + "..." if len(result["query"]) > 50 else result["query"],
                "faithfulness": result["evaluation"]["faithfulness"]["score"] if "faithfulness" in result["evaluation"] else None,
                "hallucination": result["evaluation"]["hallucination"]["score"] if "hallucination" in result["evaluation"] else None,
                "answer_relevance": result["evaluation"]["answer_relevancy"]["score"] if "answer_relevancy" in result["evaluation"] else None,
                "context_relevance": result["evaluation"]["contextual_relevancy"]["score"] if "contextual_relevancy" in result["evaluation"] else None,
                "context_tokens": result["token_usage"]["context_tokens"],
                "query_tokens": result["token_usage"]["query_tokens"],
                "response_tokens": result["token_usage"]["response_tokens"],
                "total_tokens": result["token_usage"]["total_tokens"],
                "status": "Success"
            })
        else:
            summary_data.append({
                "query": result["query"][:50] + "..." if len(result["query"]) > 50 else result["query"],
                "faithfulness": None,
                "hallucination": None,
                "answer_relevance": None,
                "context_relevance": None,
                "context_tokens": None, 
                "query_tokens": None,
                "response_tokens": None,
                "total_tokens": None,
                "status": "Failed: " + result["error"]
            })

    # Create dataframe
    df = pd.DataFrame(summary_data)
    
    # Calculate summary statistics, handling potential NaNs if some evaluations failed
    summary_stats = {
        "judge" : JUDGE_NAME,
        "LLM" : LLM_NAME,
        "avg_faithfulness": df["faithfulness"].mean(skipna=True),
        "avg_hallucination": df["hallucination"].mean(skipna=True),
        "avg_answer_relevance": df["answer_relevance"].mean(skipna=True),
        "avg_context_relevance": df["context_relevance"].mean(skipna=True),
        "min_faithfulness": df["faithfulness"].min(skipna=True),
        "max_faithfulness": df["faithfulness"].max(skipna=True),
        "min_hallucination": df["hallucination"].min(skipna=True),
        "max_hallucination": df["hallucination"].max(skipna=True),
        "min_answer_relevance": df["answer_relevance"].min(skipna=True), 
        "max_answer_relevance": df["answer_relevance"].max(skipna=True), 
        "min_context_relevance": df["context_relevance"].min(skipna=True),
        "max_context_relevance": df["context_relevance"].max(skipna=True),
        "success_rate": (df["status"] == "Success").mean() * 100 if not df.empty else 0,
        "total_tokens_used": df["total_tokens"].sum(skipna=True),
        "avg_tokens_per_query": df["total_tokens"].mean(skipna=True),
        "avg_context_tokens": df["context_tokens"].mean(skipna=True),
        "avg_response_tokens": df["response_tokens"].mean(skipna=True),
        "max_tokens_query": df["total_tokens"].max(skipna=True),
        "context_cost": df["context_tokens"].sum() * MODEL_CONTEXT_TOKEN_RATE,
        "response_cost": df["response_tokens"].sum() * MODEL_RESPONSE_TOKEN_RATE,
        "total_token_cost": (df["context_tokens"].sum(skipna=True) * MODEL_CONTEXT_TOKEN_RATE + df["response_tokens"].sum(skipna=True) * MODEL_RESPONSE_TOKEN_RATE)
    }
    
    # Create visualization
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # Ensure the evaluation directory exists
    eval_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "evaluation")
    os.makedirs(eval_dir, exist_ok=True)

    # Plot the results
    plt.figure(figsize=(14, 24))

    # First subplot for faithfulness
    plt.subplot(5, 1, 1)
    plt.bar(range(len(df)), df["faithfulness"].fillna(0), color='blue') # Fill NaN for plotting
    plt.axhline(y=0.7, color='r', linestyle='-', label='Threshold (0.7)')
    plt.title('Faithfulness Scores Across Queries')
    plt.ylabel('Faithfulness Score')
    plt.ylim(0, 1)
    plt.xticks(range(len(df)), [f"Q{i+1}" for i in range(len(df))], rotation=45, ha="right")
    plt.legend()
    
    # Second subplot for hallucination
    plt.subplot(5, 1, 2)
    plt.bar(range(len(df)), df["hallucination"].fillna(0), color='green') # Fill NaN for plotting
    plt.axhline(y=0.3, color='r', linestyle='-', label='Threshold (0.3)')
    plt.title('Hallucination Scores Across Queries')
    plt.ylabel('Hallucination Score')
    plt.ylim(0, 1)
    plt.xticks(range(len(df)), [f"Q{i+1}" for i in range(len(df))], rotation=45, ha="right")
    plt.legend()
    
    # Subplot 3: Answer Relevance
    plt.subplot(5, 1, 3) 
    plt.bar(range(len(df)), df["answer_relevance"].fillna(0), color='purple') # Fill NaN for plotting
    plt.axhline(y=0.7, color='r', linestyle='-', label='Threshold (0.7)')
    plt.title('Answer Relevance Scores Across Queries')
    plt.ylabel('Answer Relevance Score')
    plt.ylim(0, 1)
    plt.xticks(range(len(df)), [f"Q{i+1}" for i in range(len(df))], rotation=45, ha="right")
    plt.legend()

    # Subplot 4: Context Relevance
    plt.subplot(5, 1, 4)
    plt.bar(range(len(df)), df["context_relevance"].fillna(0), color='cyan') # Fill NaN for plotting    
    plt.axhline(y=0.7, color='r', linestyle='-', label='Threshold (0.7)')
    plt.title('Context Relevance Scores Across Queries')
    plt.ylabel('Context Relevance Score')
    plt.ylim(0, 1)
    plt.xticks(range(len(df)), [f"Q{i+1}" for i in range(len(df))], rotation=45, ha="right")
    plt.legend()

    # Fifth subplot for token usage
    plt.subplot(5, 1, 5)
    ind = np.arange(len(df))
    width = 0.25
    plt.bar(ind - width, df["context_tokens"].fillna(0), width, label='Context Tokens')
    plt.bar(ind, df["query_tokens"].fillna(0), width, label='Query Tokens')
    plt.bar(ind + width, df["response_tokens"].fillna(0), width, label='Response Tokens')
    plt.title('Token Usage by Query')
    plt.xlabel('Query ID')
    plt.ylabel('Token Count')
    plt.xticks(range(len(df)), [f"Q{i+1}" for i in range(len(df))], rotation=45, ha="right")
    plt.legend()

    # Calculate estimated costs
    context_cost = df["context_tokens"].sum() * MODEL_CONTEXT_TOKEN_RATE
    response_cost = df["response_tokens"].sum() * MODEL_RESPONSE_TOKEN_RATE

    # Tight layout and save
    plt.tight_layout(pad=3.0)
    chart_path = os.path.join(eval_dir, f"evaluation_results_{timestamp}_chart.png")
    plt.savefig(chart_path)
    plt.close()
    
    # Save detailed results
    results_file = os.path.join(eval_dir, f"evaluation_results_{timestamp}.json")
    # Convert numpy types to native Python types for JSON serialization
    for key, value in summary_stats.items():
        if isinstance(value, (np.generic, np.ndarray)):
            summary_stats[key] = value.item() if value.size == 1 else value.tolist()

    with open(results_file, "w") as f:
        json.dump({
            "detailed_results": all_results,
            "summary_stats": summary_stats,
            "chart_path": os.path.basename(chart_path), # Store only basename
            "query_map": {f"Q{i+1}": query for i, query in enumerate(test_queries)}
        }, f, indent=2)
    
    print(f"\n--- Evaluation Summary ---")
    print(f"Average Faithfulness: {summary_stats.get('avg_faithfulness', 'N/A'):.2f}")
    print(f"Average Hallucination: {summary_stats.get('avg_hallucination', 'N/A'):.2f}")
    print(f"Average Answer Relevance: {summary_stats.get('avg_answer_relevance', 'N/A'):.2f}") 
    print(f"Average Context Relevance: {summary_stats.get('avg_context_relevance', 'N/A'):.2f}")
    print(f"Estimated API cost: ${context_cost + response_cost:.4f}")
    print(f"Success Rate: {summary_stats.get('success_rate', 'N/A'):.1f}%")
    print(f"Detailed results saved to: {results_file}")
    print(f"Chart saved to: {chart_path}")
    
    return results_file, chart_path


if __name__ == "__main__":
    # User ID for evaluation
    user_id = "user_2w0DhNj0iOUVHrYotRFjOARLw4m"  # Use an existing user ID from your profiles
    
    # Run comprehensive evaluation
    results_file, chart_path = run_comprehensive_evaluation(user_id)