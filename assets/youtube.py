from langchain_community.document_loaders import YoutubeLoader
from langchain_community.chat_models import ChatOllama
from langchain.chains.summarize import load_summarize_chain

# 1. Load Transcript
url = "https://www.youtube.com/watch?v=kDSHzUvyPUI"
loader = YoutubeLoader.from_youtube_url(url, add_video_info=False)
docs = loader.load()

# 2. Setup Ollama
llm = ChatOllama(model="llama3")

# 3. Summarize
chain = load_summarize_chain(llm, chain_type="stuff")
summary = chain.run(docs)
print(summary)
