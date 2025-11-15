# fact rag 
# user query isnt breaked into facts 
# knowledge base --*> graph
# metta

# embeddings
# langgraph
# vector db
# file upload (pdf)
# user pdf -> chunk
# pdf -> graph

# retrival
# context aware
# personalized

import os
import json
import pandas as pd
from typing import TypedDict, Dict, List, Any, Optional
from datetime import datetime
from pathlib import Path
import networkx as nx
from langchain.text_splitter import RecursiveCharacterTextSplitter
from unstructured.partition.auto import partition
from langgraph.graph import StateGraph, END
from models.embedding_model import EmbeddingModel
from models.llm import OpenRouterLLM
# from models.gemini_model import GeminiLLM
from pinecone import Pinecone, ServerlessSpec
from neo4j import GraphDatabase
import spacy
import matplotlib.pyplot as plt
from uuid import uuid4
# from models.evaluation_model import evaluate_response

# Ensure necessary directories exist
os.makedirs("data/documents", exist_ok=True)
os.makedirs("data/knowledge_graphs", exist_ok=True)
os.makedirs("data/user_profiles", exist_ok=True)

# Define state to track data through workflow
class FinancialAdvisorState(TypedDict):
    user_id: str
    query: str
    document_path: Optional[str]
    chunks: Optional[List[str]]
    entities: Optional[List[Dict[str, Any]]]
    relationships: Optional[List[Dict[str, Any]]]
    knowledge_graph: Optional[nx.Graph]
    knowledge_graph_id: Optional[str]  # Added this field
    relevant_contexts: Optional[List[str]]
    relevant_facts: Optional[List[Dict[str, Any]]]
    user_profile: Optional[Dict[str, Any]]
    response: Optional[str]
    evaluation: Optional[Dict[str, Any]]

# Initialize NLP model for entity extraction
try:
    nlp = spacy.load("en_core_web_md")
except:
    # Download if not available
    import subprocess
    subprocess.run(["python", "-m", "spacy", "download", "en_core_web_md"])
    nlp = spacy.load("en_core_web_md")

class PersonalizedFinancialAdvisor:
    # Fix 4: Improved Neo4j initialization with error handling
    def __init__(self):
        """Initialize the financial advisor with necessary components"""
        try:
            self.embedding_model = EmbeddingModel()
        except Exception as e:
            print(f"Error initializing embedding model: {str(e)}")
            raise

        try:

            self.llm = OpenRouterLLM(api_key=os.getenv("OPENROUTER_GEMMA_API_KEY"), temperature=0.1)
            # self.llm = GeminiLLM(api_key=os.getenv("GOOGLE_API_KEY"))

            # Pinecone setup

            pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
            index_name = "financial-documents"

            # Check if index exists
            existing_indexes = pc.list_indexes().names()  # Get list of index names
            print(f"Existing indexes: {existing_indexes}")
            
            # Create index if it doesn't exist
            if index_name not in existing_indexes:
                print(f"Creating new index: {index_name}")
                pc.create_index(
                name=index_name,
                dimension=768, # Replace with your model dimensions
                metric="cosine", # Replace with your model metric
                spec=ServerlessSpec(
                    cloud="aws",
                    region="us-east-1"
                ) 
            )
            print(f"Created new Pinecone index: {index_name}")
            # Wait for index to be ready
            import time
            time.sleep(10)

            # Connect to index
            self.vector_db = pc.Index(index_name)
            # Test the connection
            stats = self.vector_db.describe_index_stats()
            print(f"Connected to index with stats: {stats}")

        except Exception as e:
            print(f"Error setting up Pinecone: {str(e)}")
            raise

        try:
            # Neo4j setup with proper error handling
            self.neo4j_uri = os.getenv("NEO4J_URI")
            self.neo4j_user = os.getenv("NEO4J_USER", "neo4j")
            self.neo4j_password = os.getenv("NEO4J_PASSWORD")
            
            if not self.neo4j_password:
                raise ValueError("NEO4J_PASSWORD environment variable is not set")
                
            self.neo4j_driver = GraphDatabase.driver(
                self.neo4j_uri, 
                auth=(self.neo4j_user, self.neo4j_password)
            )
            
            # Test connection
            with self.neo4j_driver.session() as session:
                session.run("RETURN 1 AS test")
        except Exception as e:
            print(f"Error connecting to Neo4j: {str(e)}")
            raise
    
    # Fix 1: Add self parameter to class method
    def process_financial_document(self, document_path: str, user_id: str) -> Dict:
        """Process a financial document and build knowledge graph"""
        try:
            # Extract chunks from document
            chunks = self._chunk_document(document_path)
            
            # Store document embeddings in Pinecone
            self._store_document_embeddings(chunks, document_path, user_id)
            
            # Extract entities and relationships
            entities, relationships = self._extract_entities_and_relationships(chunks)
            
            # Build knowledge graph in Neo4j
            graph_id = self._build_knowledge_graph(entities, relationships, user_id)
            
            # Visualize knowledge graph
            viz_path = f"data/knowledge_graphs/{user_id}_{Path(document_path).stem}_viz.png"
            self.visualize_knowledge_graph(graph_id, viz_path)
            
            return {
                "document_path": document_path,
                "chunks_processed": len(chunks),
                "entities_extracted": len(entities),
                "relationships_extracted": len(relationships),
                "knowledge_graph_id": graph_id,
                "visualization_path": viz_path
            }
        except Exception as e:
            print(f"Error processing document: {str(e)}")
            return {
                "document_path": document_path,
                "status": "error",
                "message": f"Failed to process document: {str(e)}"
            }
    
    def _chunk_document(self, document_path: str) -> List[str]:
        """Partition document into chunks for processing"""
        # Use unstructured to extract elements
        elements = partition(filename=document_path)
        
        # Filter out small elements and convert to strings
        chunks = [str(element) for element in elements if len(str(element)) > 100]
        
        # Further split long chunks if necessary
        if any(len(chunk) > 2000 for chunk in chunks):
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=1000,
                chunk_overlap=200,
                separators=["\n\n", "\n", ". ", " ", ""]
            )
            chunks = text_splitter.split_text("".join(chunks))
        
        return chunks
    
    def _store_document_embeddings(self, chunks: List[str], document_path: str, user_id: str) -> None:
        """Generate embeddings and store in Pinecone vector DB"""
        try:
            # Generate embeddings for chunks
            embeddings = self.embedding_model.get_embeddings(chunks)
            
            # Prepare records for Pinecone
            records = []
            for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
                record_id = f"chunk_{user_id}_{Path(document_path).stem}_{i}_{uuid4()}"
                metadata = {
                    "document": Path(document_path).name,
                    "user_id": user_id,
                    "chunk_index": i,
                    "text": chunk,  # Store text in metadata for retrieval
                    "timestamp": datetime.now().isoformat()
                }
                records.append((record_id, embedding, metadata))
            
            # Upsert in batches of 100
            batch_size = 100
            for i in range(0, len(records), batch_size):
                batch = records[i:i+batch_size]
                self.vector_db.upsert(vectors=batch)
                
        except Exception as e:
            print(f"Error storing embeddings: {str(e)}")
            raise       
    
    def _extract_entities_and_relationships(self, chunks: List[str]) -> tuple:
        """Extract financial entities and relationships from text chunks"""
        entities = []
        relationships = []
        
        # Define financial entity types to extract
        financial_entity_types = [
            "MONEY", "ORG", "PERCENT", "DATE", "PRODUCT", "QUANTITY", "GPE"
        ]
        
        # Process each chunk to extract entities
        for i, chunk in enumerate(chunks):
            doc = nlp(chunk)
            
            # Extract named entities
            chunk_entities = []
            for ent in doc.ents:
                if ent.label_ in financial_entity_types:
                    entity = {
                        "id": f"entity_{len(entities)}",
                        "text": ent.text,
                        "type": ent.label_,
                        "chunk_index": i
                    }
                    entities.append(entity)
                    chunk_entities.append(entity)
            
            # Extract relationships between entities in this chunk
            for i, entity1 in enumerate(chunk_entities):
                for j, entity2 in enumerate(chunk_entities):
                    if i < j:  # Avoid duplicate relationships
                        relationship = {
                            "source": entity1["id"],
                            "target": entity2["id"],
                            "type": "co-occurrence",
                            "context": chunk
                        }
                        relationships.append(relationship)
        
        # Enhance with fact extraction from LLM
        if entities:
            # Sample a few chunks to extract more complex relationships via LLM
            sample_chunks = chunks[:min(5, len(chunks))]
            combined_text = " ".join(sample_chunks)
            
            prompt = f"""
            Extract factual financial relationships from this text. Focus on:
            1. Companies and their financial metrics
            2. Market trends and correlations
            3. Financial instruments and their characteristics
            4. Risk factors and their implications
            
            For each fact, provide:
            - The entities involved (e.g., company names, metrics, instruments)
            - The relationship between them (e.g., owns, increased by, correlates with)
            - The value or description of the relationship
            
            Text to analyze:
            {combined_text}
            
            Return results in JSON format like:
            [
                {{"entity1": "Apple", "relationship": "reported", "entity2": "revenue", "value": "$365.8 billion"}},
                {{"entity1": "interest rates", "relationship": "impacts", "entity2": "bond prices", "value": "inversely"}}
            ]
            """
            
            try:
                llm_response = self.llm(prompt)
                # Extract JSON response
                json_start = llm_response.find("[")
                json_end = llm_response.rfind("]") + 1
                if json_start >= 0 and json_end > json_start:
                    json_str = llm_response[json_start:json_end]
                    facts = json.loads(json_str)
                    
                    # Add extracted facts as relationships
                    for fact in facts:
                        # Create entities if they don't exist
                        for key in ["entity1", "entity2"]:
                            if key in fact:
                                entity = {
                                    "id": f"entity_{len(entities)}",
                                    "text": fact[key],
                                    "type": "LLM_EXTRACTED",
                                    "chunk_index": -1  # Indicates LLM extraction
                                }
                                entities.append(entity)
                        
                        # Create relationship
                        if "entity1" in fact and "entity2" in fact and "relationship" in fact:
                            relationship = {
                                "source": entities[-2]["id"],  # The entity1 we just added
                                "target": entities[-1]["id"],  # The entity2 we just added
                                "type": fact.get("relationship", "related"),
                                "value": fact.get("value", ""),
                                "context": "LLM extracted fact"
                            }
                            relationships.append(relationship)
            except Exception as e:
                print(f"Error extracting facts with LLM: {str(e)}")
        
        return entities, relationships
    
    def _build_knowledge_graph(self, entities: List[Dict], relationships: List[Dict], user_id: str) -> str:
        """Build a knowledge graph in Neo4j from extracted entities and relationships"""
        # Create a unique graph ID for this document
        graph_id = f"{user_id}_{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        with self.neo4j_driver.session() as session:
            # Create constraint for unique entity IDs if it doesn't exist
            session.run("CREATE CONSTRAINT IF NOT EXISTS FOR (e:Entity) REQUIRE e.id IS UNIQUE")
            
            # Add entities as nodes
            for entity in entities:
                session.run(
                    """
                    MERGE (e:Entity {
                        id: $id,
                        text: $text,
                        type: $type,
                        chunk_index: $chunk_index,
                        user_id: $user_id,
                        graph_id: $graph_id
                    })
                    """,
                    id=entity["id"],
                    text=entity["text"],
                    type=entity["type"],
                    chunk_index=entity.get("chunk_index", -1),
                    user_id=user_id,
                    graph_id=graph_id
                )
            
            # Add relationships as edges
            for rel in relationships:
                session.run(
                    """
                    MATCH (source:Entity {id: $source_id})
                    MATCH (target:Entity {id: $target_id})
                    CREATE (source)-[r:RELATES {
                        type: $type,
                        context: $context,
                        value: $value,
                        user_id: $user_id,
                        graph_id: $graph_id
                    }]->(target)
                    """,
                    source_id=rel["source"],
                    target_id=rel["target"],
                    type=rel["type"],
                    context=rel.get("context", ""),
                    value=rel.get("value", ""),
                    user_id=user_id,
                    graph_id=graph_id
                )
        
        return graph_id
    
    def visualize_knowledge_graph(self, graph_id: str, output_path: str) -> str:
        """Visualize the Neo4j knowledge graph and save as an image"""
        # Create NetworkX graph from Neo4j data
        G = nx.Graph()
        
        with self.neo4j_driver.session() as session:
            # Get nodes
            nodes_result = session.run(
                """
                MATCH (e:Entity)
                WHERE e.graph_id = $graph_id
                RETURN e.id AS id, e.text AS text, e.type AS type
                """,
                graph_id=graph_id
            )
            
            for node in nodes_result:
                G.add_node(
                    node["id"],
                    text=node["text"],
                    type=node["type"]
                )
            
            # Get relationships
            edges_result = session.run(
                """
                MATCH (e1:Entity)-[r:RELATES]->(e2:Entity)
                WHERE r.graph_id = $graph_id
                RETURN e1.id AS source, e2.id AS target, r.type AS type
                """,
                graph_id=graph_id
            )
            
            for edge in edges_result:
                G.add_edge(
                    edge["source"],
                    edge["target"],
                    type=edge["type"]
                )
        
        # Generate visualization using NetworkX
        plt.figure(figsize=(12, 10))
        pos = nx.spring_layout(G)
        
        # Draw nodes by type
        node_types = set(nx.get_node_attributes(G, "type").values())
        colors = plt.cm.tab10(range(len(node_types)))
        color_map = dict(zip(node_types, colors))
        
        for node_type, color in color_map.items():
            nodes = [n for n, d in G.nodes(data=True) if d.get("type") == node_type]
            nx.draw_networkx_nodes(G, pos, nodelist=nodes, node_color=color, node_size=500, label=node_type)
        
        # Draw edges and labels
        nx.draw_networkx_edges(G, pos)
        labels = nx.get_node_attributes(G, "text")
        nx.draw_networkx_labels(G, pos, labels=labels, font_size=8)
        
        plt.title(f"Financial Knowledge Graph: {graph_id}")
        plt.legend()
        plt.axis("off")
        plt.savefig(output_path)
        plt.close()
        
        return output_path

    def get_user_profile(self, user_id: str) -> Dict[str, Any]:
        """Get user profile or create one if it doesn't exist"""
        project_root = os.path.abspath(
            os.path.join(os.path.dirname(__file__), os.pardir, os.pardir)
        )
        profiles_dir = os.path.join(project_root, "server", "data", "user_profiles")
        os.makedirs(profiles_dir, exist_ok=True)
        profile_path = os.path.join(profiles_dir, f"{user_id}.json")
        
        if os.path.exists(profile_path):
            with open(profile_path, 'r') as f:
                return json.load(f)
        else:
            # Create default profile
            default_profile = {
                "user_id": user_id,
                "risk_tolerance": "moderate",
                "financial_goals": ["retirement", "investment"],
                "investment_horizon": "long-term",
                "preferences": {
                    "sustainability": 0.5,
                    "technology": 0.5,
                    "healthcare": 0.5
                },
                "interaction_history": []
            }
            
            # Save default profile
            os.makedirs(os.path.dirname(profile_path), exist_ok=True)
            with open(profile_path, 'w') as f:
                json.dump(default_profile, f, indent=2)
            
            return default_profile
    
    def update_user_profile(self, user_id: str, query: str, response: str) -> None:
        """Update user profile with new interaction and inferred preferences"""
        profile = self.get_user_profile(user_id)
        
        # Add interaction to history
        profile["interaction_history"].append({
            "query": query,
            "timestamp": datetime.now().isoformat(),
            "response_summary": response[:100] + "..." if len(response) > 100 else response
        })
        
        # Limit history size
        profile["interaction_history"] = profile["interaction_history"][-20:]
        
        # Analyze query to update user preferences
        prompt = f"""
        Analyze this user query to extract financial preferences, interests, and risk tolerance.
        Query: "{query}"
        
        Provide updates to the user profile in JSON format. If no clear preferences are found, return empty values.
        {{
            "risk_tolerance": "", 
            "financial_goals": [],
            "preferences": {{
                "sustainability": -1.0 to 1.0, 
                "technology": -1.0 to 1.0,
                "healthcare": -1.0 to 1.0
            }}
        }}
        """
        
        try:
            llm_response = self.llm(prompt)
            # Extract JSON response
            json_start = llm_response.find("{")
            json_end = llm_response.rfind("}") + 1
            if json_start >= 0 and json_end > json_start:
                json_str = llm_response[json_start:json_end]
                preference_updates = json.loads(json_str)
                
                # Update profile with non-empty values
                if preference_updates.get("risk_tolerance"):
                    profile["risk_tolerance"] = preference_updates["risk_tolerance"]
                
                if preference_updates.get("financial_goals"):
                    new_goals = [g for g in preference_updates["financial_goals"] if g]
                    if new_goals:
                        profile["financial_goals"] = list(set(profile["financial_goals"] + new_goals))
                
                # Update preferences with non-default values
                if "preferences" in preference_updates:
                    for k, v in preference_updates["preferences"].items():
                        if k in profile["preferences"] and v != -1.0:
                            # Blend the new preference with existing (70% existing, 30% new)
                            profile["preferences"][k] = 0.7 * profile["preferences"][k] + 0.3 * v
                
                # Save updated profile
                profile_path = f"data/user_profiles/{user_id}.json"
                with open(profile_path, 'w') as f:
                    json.dump(profile, f, indent=2)
        except Exception as e:
            print(f"Error updating user profile: {str(e)}")
        
        return profile
    
    def retrieve_context(self, query: str, user_id: str, top_k: int = 50) -> Dict[str, Any]:
        """Retrieve relevant context using both Pinecone and Neo4j"""
        results = {
            "vector_contexts": [],
            "graph_facts": []
        }
        
        # Step 1: Retrieve from Pinecone vector DB
        query_embedding = self.embedding_model.get_embeddings([query])[0]
        vector_results = self.vector_db.query(
            vector=query_embedding,
            filter={"user_id": user_id},
            top_k=top_k,
            include_metadata=True
        )
        
        # Extract text from results
        if vector_results and "matches" in vector_results:
            retrieved_contexts = [{"text": match["metadata"]["text"]} for match in vector_results["matches"]]
            # Add deduplication to ensure variety in retrieved contexts
            unique_contexts = []
            seen = set()
            for context in retrieved_contexts:
                content = context['text']
                if content not in seen:
                    seen.add(content)
                    unique_contexts.append(context)

            results["vector_contexts"] = [ctx["text"] for ctx in unique_contexts]
        
        # Step 2: Search for relevant entities in Neo4j
        # Generate search terms from query
        search_prompt = f"""
        Extract the key financial entities, concepts, or metrics in this query.
        Return only a comma-separated list of the key terms, with no explanation.
        
        Query: "{query}"
        
        Key terms:
        """
        
        search_terms = self.llm(search_prompt).split(",")
        search_terms = [term.strip().lower() for term in search_terms if term.strip()]
        
        # Query Neo4j for relevant facts
        if search_terms:
            search_pattern = "|".join(search_terms)
            
            with self.neo4j_driver.session() as session:
                cypher_query = """
                MATCH (e1:Entity)-[r:RELATES]->(e2:Entity)
                WHERE e1.user_id = $user_id 
                AND (toLower(e1.text) CONTAINS $search_term OR toLower(e2.text) CONTAINS $search_term)
                RETURN e1.text AS entity1, r.type AS relationship, e2.text AS entity2, 
                    r.value AS value, r.context AS context
                LIMIT $limit
                """
                
                facts = []
                for term in search_terms:
                    result = session.run(
                        cypher_query,
                        user_id=user_id,
                        search_term=term.lower(),
                        limit=top_k
                    )
                    
                    for record in result:
                        fact = {
                            "entity1": record["entity1"],
                            "relationship": record["relationship"],
                            "entity2": record["entity2"],
                            "value": record["value"],
                            "context": record["context"]
                        }
                        facts.append(fact)
                
                # Deduplicate facts
                unique_facts = []
                seen = set()
                for fact in facts:
                    key = (fact["entity1"], fact["relationship"], fact["entity2"])
                    if key not in seen:
                        seen.add(key)
                        unique_facts.append(fact)
                
                results["graph_facts"] = unique_facts[:top_k]
        
        return results
    
    def generate_personalized_response(self, query: str, user_id: str, contexts: Dict[str, Any]) -> str:
        """Generate a personalized response based on retrieved contexts and user profile"""
        # Get user profile
        user_profile = self.get_user_profile(user_id)
        
        # Format contexts for prompt
        vector_context_text = "\n\n".join(contexts["vector_contexts"]) if contexts["vector_contexts"] else "No relevant document contexts found."
        
        graph_facts_text = ""
        if contexts["graph_facts"]:
            facts = []
            for fact in contexts["graph_facts"]:
                fact_str = f"- {fact['entity1']} {fact['relationship']} {fact['entity2']}"
                if fact["value"]:
                    fact_str += f" ({fact['value']})"
                facts.append(fact_str)
            graph_facts_text = "Relevant financial facts:\n" + "\n".join(facts)
        else:
            graph_facts_text = "No relevant knowledge graph facts found."
        
        # Create prompt for response generation
        prompt = f"""
        You are a personalized financial advisor. Use the provided context and the user's profile to provide
        tailored financial advice. Be factual, accurate and base your response on the provided information.
        
        USER PROFILE:
        - Risk tolerance: {user_profile['risk_tolerance']}
        - Financial goals: {', '.join(user_profile['financial_goals'])}
        - Investment horizon: {user_profile['investment_horizon']}
        - Key preferences: {json.dumps(user_profile['preferences'])}
        
        RETRIEVED DOCUMENT CONTEXT:
        {vector_context_text}
        
        KNOWLEDGE GRAPH FACTS:
        {graph_facts_text}
        
        USER QUERY:
        {query}
        
        Based strictly on the information above, provide a personalized financial advisory response.
        Focus on being factual and specific to this user's profile and the retrieved information.
        If you cannot provide specific advice based on the context, clearly state so and provide
        general advice based on the user's profile.
        """
        
        # Generate response
        response = self.llm(prompt)
        
        # Update user profile based on this interaction
        self.update_user_profile(user_id, query, response)
        
        return response
    


# LangGraph Nodes

# Fix 2: Correct process_document_node function
def process_document_node(state: FinancialAdvisorState) -> FinancialAdvisorState:
    """Process a document and update the state"""
    if not state["document_path"]:
        raise ValueError("Document path is required")
    
    try:
        advisor = PersonalizedFinancialAdvisor()
        # Direct call to class method instead of using workflow
        result = advisor.process_financial_document(state["document_path"], state["user_id"])
        
        # Update state with processing results
        state["chunks"] = result.get("chunks_processed")  # Fixed key name
        state["knowledge_graph_id"] = result.get("knowledge_graph_id")
        
        return state
    except Exception as e:
        print(f"Error in process_document_node: {str(e)}")
        state["error"] = str(e)
        return state

def retrieve_context_node(state: FinancialAdvisorState) -> FinancialAdvisorState:
    """Retrieve relevant context for the query"""
    advisor = PersonalizedFinancialAdvisor()
    contexts = advisor.retrieve_context(state["query"], state["user_id"])
    
    state["relevant_contexts"] = contexts["vector_contexts"]
    state["relevant_facts"] = contexts["graph_facts"]
    
    # Get user profile
    state["user_profile"] = advisor.get_user_profile(state["user_id"])
    
    return state

# Fix 3: Correct evaluate_response call
def generate_response_node(state: FinancialAdvisorState) -> FinancialAdvisorState:
    """Generate a personalized response"""
    advisor = PersonalizedFinancialAdvisor()
    
    contexts = {
        "vector_contexts": state["relevant_contexts"] or [],
        "graph_facts": state["relevant_facts"] or []
    }
    
    response = advisor.generate_personalized_response(
        state["query"], 
        state["user_id"],
        contexts
    )

    # # Fixed evaluation call with proper parameters
    # if state["relevant_contexts"]:
    #     try:
    #         evaluation_result = evaluate_response(
    #             query=state["query"],
    #             response=response, 
    #             contexts=state["relevant_contexts"]
    #         )
    #         # Store evaluation result if needed
    #         state["evaluation"] = evaluation_result
    #     except Exception as e:
    #         print(f"Error evaluating response: {str(e)}")
    
    state["response"] = response
    return state

# Define the LangGraph workflow
def build_workflow():
    """Build the LangGraph workflow for the financial advisor"""
    workflow = StateGraph(FinancialAdvisorState)
    
    # Add nodes
    workflow.add_node("process_document", process_document_node)
    workflow.add_node("retrieve_context", retrieve_context_node)
    workflow.add_node("generate_response", generate_response_node)
    
    # Add a start node
    workflow.add_node("start", lambda x: x)  # Identity function as placeholder

    # Add conditional edges based on whether we're processing a document or answering a query
    # Routing function determines first step
    def route_based_on_inputs(state: FinancialAdvisorState):
        if state["document_path"]:
            return "process_document"
        else:
            return "retrieve_context"
    
    # Define edges
    workflow.add_conditional_edges("start", route_based_on_inputs, {
        "process_document": "process_document",
        "retrieve_context": "retrieve_context"
    })
    workflow.add_edge("process_document", "retrieve_context") # .......
    workflow.add_edge("retrieve_context", "generate_response")
    workflow.add_edge("generate_response", END)
    
    # Set entry point
    workflow.set_entry_point("start")

    return workflow.compile()

# Main functions to expose the functionality

# Fix 5: Remove duplicate standalone process_financial_document function
# and replace with simpler wrapper function:

def process_financial_document(document_path: str, user_id: str) -> Dict:
    """Process a financial document and build knowledge graph - wrapper function"""
    advisor = PersonalizedFinancialAdvisor()
    return advisor.process_financial_document(document_path, user_id)  

def get_financial_advice(query: str, user_id: str, document_path: str = None) -> str:
    """Get financial advice based on user query and context"""
    advisor = PersonalizedFinancialAdvisor()
    
    # Initialize state
    state = {
        "user_id": user_id,
        "query": query,
        "document_path": document_path,  # This could be None if no document specified
    }
    
    # Run workflow
    workflow = build_workflow()
    result = workflow.invoke(state)
    
    return result["response"]

# Fix 6: Add data validation to update_user_preferences
def update_user_preferences(user_id: str, preferences: Dict[str, Any]) -> Dict[str, Any]:
    """Update user preferences manually"""
    if not user_id:
        raise ValueError("User ID is required")
    if not preferences or not isinstance(preferences, dict):
        raise ValueError("Preferences must be a non-empty dictionary")
        
    advisor = PersonalizedFinancialAdvisor()
    profile = advisor.get_user_profile(user_id)
    
    # Update profile with provided preferences with validation
    for key, value in preferences.items():
        if key in profile:
            profile[key] = value
        elif key == "preferences" and isinstance(value, dict):
            for pref_key, pref_val in value.items():
                if pref_key in profile["preferences"]:
                    # Ensure value is a number between 0 and 1 for preferences
                    if isinstance(pref_val, (int, float)) and 0 <= pref_val <= 1:
                        profile["preferences"][pref_key] = pref_val
    
    # Save updated profile
    profile_path = f"data/user_profiles/{user_id}.json"
    os.makedirs(os.path.dirname(profile_path), exist_ok=True)
    with open(profile_path, 'w') as f:
        json.dump(profile, f, indent=2)
    return profile

# def get_model_evaluation(query: str, response: str, contexts: List[str]) -> Dict[str, Any]:
#     """Evaluate the model's response based on the provided contexts"""
#     # Placeholder for evaluation logic
#     evaluation_result = evaluate_response(query, response, contexts)
#     return evaluation_result