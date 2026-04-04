# Autism Care Support System

AI-powered home care guidance for parents and caregivers of children with autism.

## Project Structure

```
autism-care-system/
├── backend/          Flask API + Sentence Transformers AI
│   ├── app.py
│   ├── chatbot.py
│   ├── requirements.txt
│   └── data/try_complete.json
└── frontend/         React.js web interface
    ├── src/
    └── package.json
```

## Setup & Run

### 1. Backend (Python / Flask)

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Start the server
python app.py
```

Backend runs at: http://localhost:5000

### 2. Frontend (React / Vite)

> Requires Node.js 18+. Download from https://nodejs.org

```bash
cd frontend

npm install
npm run dev
```

Frontend runs at: http://localhost:3000

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat` | Send message, get response |
| GET | `/api/history/:session_id` | Get conversation history |
| DELETE | `/api/history/:session_id` | Clear conversation |
| GET | `/api/health` | Health check |

### POST /api/chat

**Request:**
```json
{
  "message": "My child is having a meltdown, what do I do?",
  "session_id": "optional-uuid"
}
```

**Response:**
```json
{
  "session_id": "uuid",
  "response": "Step-by-step guidance...",
  "tag": "meltdown_handling",
  "history": [...]
}
```

## How It Works

1. User types a question in the chat interface
2. Frontend sends the message to the Flask backend
3. The Sentence Transformer model converts the message to a vector embedding
4. Cosine similarity is computed against all pre-indexed dataset patterns
5. The best-matching intent's response is returned
6. Conversation history is stored per session in memory

## Dataset

The system uses a custom dataset (`try_complete.json`) with intents covering:
- Meltdown handling
- Aggression management
- Communication support
- Sensory overload
- Sleep problems
- Feeding issues
- Routine management
- Therapy guidance
- Caregiver support
- And more...
