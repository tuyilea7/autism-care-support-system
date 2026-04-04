import json
import random
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

class AutismCareBot:
    def __init__(self, data_path: str):
        print("Loading AI model... please wait.")
        self.model = SentenceTransformer("all-MiniLM-L6-v2")
        self.intents = self._load_intents(data_path)
        self.pattern_embeddings, self.pattern_map = self._build_index()
        print("Chatbot ready.")

    def _load_intents(self, path: str):
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data["intents"]

    def _build_index(self):
        """Pre-compute embeddings for all patterns."""
        all_patterns = []
        pattern_map = []  # maps index -> (intent_tag, responses)

        for intent in self.intents:
            for pattern in intent["patterns"]:
                all_patterns.append(pattern)
                pattern_map.append({
                    "tag": intent["tag"],
                    "responses": intent["responses"]
                })

        embeddings = self.model.encode(all_patterns, convert_to_numpy=True)
        return embeddings, pattern_map

    def get_response(self, user_message: str) -> dict:
        """Match user message to best intent and return a response."""
        query_embedding = self.model.encode([user_message], convert_to_numpy=True)
        similarities = cosine_similarity(query_embedding, self.pattern_embeddings)[0]

        best_idx = int(np.argmax(similarities))
        best_score = float(similarities[best_idx])

        # Confidence threshold — fall back if too low
        THRESHOLD = 0.35
        if best_score < THRESHOLD:
            fallback = next(i for i in self.intents if i["tag"] == "fallback")
            response = random.choice(fallback["responses"])
            tag = "fallback"
        else:
            matched = self.pattern_map[best_idx]
            response = random.choice(matched["responses"])
            tag = matched["tag"]

        return {
            "response": response,
            "tag": tag,
            "confidence": round(best_score, 3)
        }
