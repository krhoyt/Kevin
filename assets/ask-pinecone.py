from dotenv import load_dotenv
from pinecone import Pinecone
from openai import OpenAI

load_dotenv()

client = OpenAI()
pc = Pinecone()
index = pc.Index( "about-kevin-hoyt" )

def embed_text( text: str ):
  response = client.embeddings.create(
    model = "text-embedding-3-small",
    input = text,
    dimensions = 512    
  )
  return response.data[0].embedding

def ask( question: str, top_k: int = 3 ):
  embedding = embed_text( question )
  results = index.query( vector = embedding, top_k = top_k, include_metadata = True )
    
  context = ""
  for match in results.matches:
    page = match.metadata.get( "page", "?" )
    text = match.metadata.get( "text", "" )
    context += f"[Page {page}] {text}\n---\n"

  system_instructions = """You are an 'Ask AI about me' assistant.
Answer using ONLY information found in the context section provided.
If the answer is not supported by the retrieved text, say you don't know and suggest what to ask next.
Keep answers under 500 words unless explicitly asked for detail. Be concise, recruiter-friendly, and factual.
If the answer is unknown, say 'I don't know based on the provided documents.'
Never respond with an empty message.
If a conversation summary is provided, use it as context for the current question.
Respond using valid Markdown only. Use headings and bullet lists where appropriate."""

  answer = client.responses.create(
    model = "gpt-4o-mini",
    instructions = system_instructions,
    input = f"Context:\n{context}\n\nQuestion: {question}",
    temperature = 1
  )

  print( "\n\n--- Answer ---" )
  print( answer.output_text )
  return answer.output_text

if __name__ == "__main__":
  ask( "What experience does Kevin have leading teams, mentoring engineers, and setting technical direction?" )
