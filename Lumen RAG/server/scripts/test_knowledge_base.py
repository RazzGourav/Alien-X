from models.vector_db_model import VectorDBModel

# Initialize the vector DB
vector_db = VectorDBModel()

# Search for something in your documents
results = vector_db.search("What are the financial risks?")

# Print the results
for i, match in enumerate(results):
    print(f"Match {i+1} (Score: {match['score']:.4f}):")
    print(f"Document: {match['document_path']}")
    print(f"Text: {match['text'][:200]}...\n")