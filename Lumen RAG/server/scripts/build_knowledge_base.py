import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from pathlib import Path
from models.vector_db_model import VectorDBModel
from unstructured.partition.auto import partition
from langchain.text_splitter import RecursiveCharacterTextSplitter

def process_document(document_path, user_id="system"):
    """Process a document and add it to the knowledge base"""
    print(f"Processing document: {document_path}")
    
    # Extract text from document
    try:
        elements = partition(filename=document_path)
        chunks = [str(element) for element in elements if len(str(element)) > 100]
        
        # Further split if chunks are too large
        if any(len(chunk) > 2000 for chunk in chunks):
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=1000,
                chunk_overlap=200,
                separators=["\n\n", "\n", ". ", " ", ""]
            )
            chunks = text_splitter.split_text("".join(chunks))
        
        print(f"Extracted {len(chunks)} chunks from document")
        
        # Store in vector database
        vector_db = VectorDBModel()
        count = vector_db.store_document_chunks(chunks, document_path, user_id)
        
        print(f"Successfully stored {count} chunks in the vector database")
        return True
    
    except Exception as e:
        print(f"Error processing document {document_path}: {str(e)}")
        return False

def build_knowledge_base():
    """Build a knowledge base from the documents in the data directory"""
    data_dir = Path("data/financebench")
    os.makedirs(data_dir, exist_ok=True)
    
    # Process all PDFs in the data directory
    for doc_path in data_dir.glob("*.pdf"):
        process_document(str(doc_path))
    
    # Process other document types
    for ext in ["*.docx", "*.txt"]:
        for doc_path in data_dir.glob(ext):
            process_document(str(doc_path))

if __name__ == "__main__":
    build_knowledge_base()