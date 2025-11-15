"""
Models package for AI and ML capabilities.
This package contains LLM interfaces and other model implementations.
"""

# Option 1: Minimal __init__.py - just marks directory as a package
# This is often sufficient and allows: from models.llm import OpenRouterLLM


# Option 2: Expose specific classes directly
# Uncomment to allow: from models import OpenRouterLLM
# from .llm import OpenRouterLLM