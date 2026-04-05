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

    def _select_best_response(self, responses: list, user_message: str) -> str:
        """Always prefer the structured Rwandan step-by-step response when available."""

        # Tier 1: Full Rwandan professional step-by-step (has both Step markers AND local language)
        tier1 = [
            r for r in responses
            if ('Step 1' in r or 'Step 1' in r) and
               any(m in r for m in ['Uhorere', 'ndi kumwe', 'district hospital', 'health center', '114'])
        ]
        if tier1:
            return tier1[0]

        # Tier 2: Any structured step-by-step response
        tier2 = [r for r in responses if 'Step 1' in r]
        if tier2:
            return tier2[0]

        # Tier 3: Rwandan professional voice (kitenge, local items, Rwanda orgs)
        tier3 = [
            r for r in responses
            if any(m in r for m in [
                'What Rwandan caregivers do', 'Rwandan home', 'district hospital',
                'health center', 'Autism Rwanda', '114', 'kitenge', 'Uhorere',
                'ndi kumwe', 'umudugudu', 'Mutuelle', 'ubushera', 'lesu'
            ])
        ]
        if tier3:
            return tier3[0]

        # Fallback: random
        return random.choice(responses)

    def get_response(self, user_message: str) -> dict:
        """Match user message to best intent and return a response."""
        query_embedding = self.model.encode([user_message], convert_to_numpy=True)
        similarities = cosine_similarity(query_embedding, self.pattern_embeddings)[0]

        best_idx = int(np.argmax(similarities))
        best_score = float(similarities[best_idx])

        # Confidence threshold — fall back if too low
        THRESHOLD = 0.30
        if best_score < THRESHOLD:
            fallback = next(i for i in self.intents if i["tag"] == "fallback")
            response = self._select_best_response(fallback["responses"], user_message)
            tag = "fallback"
        else:
            matched = self.pattern_map[best_idx]
            response = self._select_best_response(matched["responses"], user_message)
            tag = matched["tag"]

        return {
            "response": response,
            "tag": tag,
            "confidence": round(best_score, 3)
        }
