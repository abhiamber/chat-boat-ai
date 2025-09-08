# Agentic AI Personal Assistant
An intelligent personal assistant powered by advanced AI techniques including tool calling, RAG, vector database search, and short-term memory caching. The assistant provides accurate, concise, and helpful answers by combining reasoning, memory, vector search, and invisible external web search.

---
## 🚀 Features

- **Context-Aware Responses**  
  Uses LangChain for processing and managing conversation context.

- **Vector Database Search**  
  Stores and searches relevant PDF and text data using Pinecone and Cohere embedding model.

- **Short-Term Memory Caching**  
  Caches conversation history per thread using Node Cache for efficient repeated interactions.

- **Tool Calling with Tavily**  
  Automatically performs web searches when required using the Tavily API, without exposing tool calls to the user.

- **Prompt Engineering Best Practices**  
  Applies structured prompt engineering for reliable, relevant, and concise outputs.

- **Cost Efficiency**  
  Reduces redundant API calls and speeds up responses using caching and smart vector search.


## ⚙️ Technologies Used

- **LangChain** (Text Splitter, PDF Reader, Tool Integration)  
- **Groq Cloud API** – For LLM-based chat completions.  
- **Tavily** – For web search tool integration.  
- **Pinecone** – Vector Database for storing searchable PDF/text data.  
- **Cohere Embedding Model** – Generates vector embeddings of documents.  
- **Node Cache** – Provides short-term memory caching. 

---

## ⚡️ How It Works

1. User query is received with a thread ID.
2. Relevant context is retrieved from the vector database (top 3 similar chunks).
3. A structured prompt is built combining system instructions, context, and user question.
4. Cached conversation history is used to maintain context.
5. Groq API is used to generate responses, optionally invoking external web search via Tavily.
6. Results are returned in a clear and concise format.

# web url

https://assistifyaiagent.netlify.app/

# API

https://chat-boat-ai.onrender.com/



Node Cache for short-term memory caching

Prompt Engineering
