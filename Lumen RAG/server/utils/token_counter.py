import tiktoken

def count_tokens(text, model="gpt-3.5-turbo"):
    """Count the number of tokens in a string"""
    try:
        encoding = tiktoken.encoding_for_model(model)
    except KeyError:
        encoding = tiktoken.get_encoding("cl100k_base")  # Default for newer models
        
    return len(encoding.encode(text))

def estimate_tokens_from_context(contexts, query, response):
    """Estimate tokens used in a complete RAG transaction"""
    # Count context tokens
    context_text = " ".join([c for c in contexts if c])
    context_tokens = count_tokens(context_text)
    
    # Count query tokens
    query_tokens = count_tokens(query)
    
    # Count response tokens
    response_tokens = count_tokens(response)
    
    return {
        "context_tokens": context_tokens,
        "query_tokens": query_tokens,
        "response_tokens": response_tokens,
        "total_tokens": context_tokens + query_tokens + response_tokens
    }