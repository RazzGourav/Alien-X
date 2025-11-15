from pinecone import Pinecone, ServerlessSpec
from models.embedding_model import EmbeddingModel
from typing import List, Dict, Any
from pathlib import Path
from uuid import uuid4
import os
import time

class VectorDBModel:
    def __init__(self, api_key=None, index_name="financial-documents"):
        self.api_key = api_key or os.getenv("PINECONE_API_KEY")
        self.index_name = index_name
        self.embedding_model = EmbeddingModel()
        self._setup_pinecone()
        
    def _setup_pinecone(self):
        """Set up the Pinecone client and index"""
        try:
            # Initialize Pinecone
            pc = Pinecone(api_key=self.api_key)
            
            # Check if index exists
            existing_indexes = pc.list_indexes().names()
            print(f"Existing indexes: {existing_indexes}")
            
            # Create index if it doesn't exist
            if self.index_name not in existing_indexes:
                print(f"Creating new index: {self.index_name}")
                pc.create_index(
                    name=self.index_name,
                    dimension=768,  # Using Google's embedding model dimension
                    metric="cosine",
                    spec=ServerlessSpec(
                        cloud="aws",
                        region="us-east-1"
                    )
                )
                print(f"Created new Pinecone index: {self.index_name}")
                # Wait for index to be ready
                time.sleep(10)
            
            # Connect to index
            self.vector_db = pc.Index(self.index_name)
            
            # Test the connection
            stats = self.vector_db.describe_index_stats()
            print(f"Connected to index with stats: {stats}")
            return True
            
        except Exception as e:
            print(f"Error setting up Pinecone: {str(e)}")
            return False
    
    def store_document_chunks(self, chunks, document_path, user_id):
        """Store document chunks and their embeddings"""
        try:
            # Generate embeddings
            embeddings = self.embedding_model.get_embeddings(chunks)
            
            # Create vector records with metadata
            vectors = []
            for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
                vector_id = f"{user_id}_{Path(document_path).stem}_chunk_{i}"
                metadata = {
                    "text": chunk,  # Store original text
                    "document_path": document_path,
                    "user_id": user_id,
                    "chunk_index": i
                }
                vectors.append({
                    "id": vector_id,
                    "values": embedding,
                    "metadata": metadata
                })
            
            # Upsert vectors in batches of 100
            batch_size = 100
            for i in range(0, len(vectors), batch_size):
                batch = vectors[i:min(i+batch_size, len(vectors))]
                self.vector_db.upsert(vectors=batch)
            
            return len(vectors)
        except Exception as e:
            print(f"Error storing document chunks: {str(e)}")
            return 0

    def search(self, query, user_id=None, top_k=50):
        """Search for similar chunks to the query"""
        try:
            # Generate query embedding
            query_embedding = self.embedding_model.get_embeddings([query])[0]
            
            # Define filter if user_id is provided
            filter_dict = {"user_id": user_id} if user_id else None
            
            # Query the index
            results = self.vector_db.query(
                vector=query_embedding,
                top_k=top_k,
                include_metadata=True,
                filter=filter_dict
            )
            
            # Extract text and metadata
            matches = []
            for match in getattr(results, "matches", []):
                matches.append({
                    "text": match["metadata"].get("text", ""),
                    "score": match["score"],
                    "document_path": match["metadata"].get("document_path", ""),
                    "chunk_index": match["metadata"].get("chunk_index", -1)
                })
            
            return matches
        except Exception as e:
            print(f"Error searching vector DB: {str(e)}")
            return []

# For testing directly
if __name__ == "__main__":
    vector_db = VectorDBModel()
    print("Vector DB setup complete. Ready to store documents.")