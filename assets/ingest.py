import os
import hashlib

from dotenv import load_dotenv
from langchain.text_splitter import RecursiveCharacterTextSplitter
from pinecone import Pinecone
from openai import OpenAI

load_dotenv()

client = OpenAI( api_key = os.getenv( "OPENAI_API_KEY" ) )
pc = Pinecone( api_key = os.getenv( "PINECONE_API_KEY" ) )
index = pc.Index( "about-kevin-hoyt" )

splitter = RecursiveCharacterTextSplitter(
  chunk_size = 800,
  chunk_overlap = 100
)

def embed_texts( texts: list[str] ):
  response = client.embeddings.create(
    model = "text-embedding-3-small",
    input = texts,
    dimensions = 512
  )
  return [item.embedding for item in response.data]

def make_id( path: str, chunk: str ):
  content = f"{path}:{chunk}"
  return hashlib.md5( content.encode() ).hexdigest()

def ingest( docs ):
  for path in docs:
    with open( path, "r" ) as file:
      content = file.read()

    chunks = splitter.split_text( content )
    print( f"Embedding {len( chunks )} chunks from {path} ..." )

    embeddings = embed_texts( chunks )

    vectors = [
      ( make_id( path, chunk ), embedding, { "source": path, "text": chunk } )
      for chunk, embedding in zip( chunks, embeddings )
    ]

    index.upsert( vectors = vectors )
    print( f"✅ Uploaded {len( vectors )} vectors." )

ingest( [
  "./kevin-hoyt-bio.md",
  "../11ty/posts/2026-01-12-managing-people.md",
  "../11ty/posts/2026-01-14-managing-heroes.md",
  "../11ty/posts/2026-01-16-managing-professionals.md"  
] )
