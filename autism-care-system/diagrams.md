# System Diagrams for Autism Care Support System

## How to Use These Diagrams

Copy the code for each diagram and paste it into the appropriate online tool:

- **Use Case Diagram**: https://www.plantuml.com/plantuml/uml/
- **DFD (Data Flow Diagram)**: https://app.diagrams.net/ (draw.io)
- **Flowchart**: https://www.plantuml.com/plantuml/uml/ or https://app.diagrams.net/

---

## 1. USE CASE DIAGRAM

### PlantUML Code (paste at https://www.plantuml.com/plantuml/uml/)

```plantuml
@startuml
left to right direction
skinparam packageStyle rectangle

actor "Parent/Home Caregiver" as Parent
actor "Admin" as Admin
actor "AI Chatbot" as Bot

rectangle "Autism Care Support System" {
  usecase "Register Account" as UC1
  usecase "Login" as UC2
  usecase "Start New Chat Session" as UC3
  usecase "Ask Question" as UC4
  usecase "View Chat History" as UC5
  usecase "Delete Chat Session" as UC6
  usecase "Rename Chat Session" as UC7
  usecase "Logout" as UC8
  
  usecase "View System Statistics" as UC9
  usecase "View All Parents" as UC10
  usecase "View Parent Chat History" as UC11
  usecase "Edit Dataset (Intents)" as UC12
  usecase "Update Patterns" as UC13
  usecase "Update Responses" as UC14
  
  usecase "Process Query" as UC15
  usecase "Match Intent" as UC16
  usecase "Generate Response" as UC17
}

Parent --> UC1
Parent --> UC2
Parent --> UC3
Parent --> UC4
Parent --> UC5
Parent --> UC6
Parent --> UC7
Parent --> UC8

Admin --> UC2
Admin --> UC9
Admin --> UC10
Admin --> UC11
Admin --> UC12
Admin --> UC8

UC12 ..> UC13 : <<include>>
UC12 ..> UC14 : <<include>>

UC4 --> Bot
Bot --> UC15
UC15 ..> UC16 : <<include>>
UC15 ..> UC17 : <<include>>

@enduml
```

---

## 2. DATA FLOW DIAGRAM (DFD) - Level 0 (Context Diagram)

### Description for draw.io (https://app.diagrams.net/)

**Entities:**
- Parent/Home Caregiver (external entity - rectangle)
- Admin (external entity - rectangle)

**System:**
- Autism Care Support System (circle in center)

**Data Flows:**
- Parent → System: Registration data, Login credentials, Questions/queries
- System → Parent: Chat responses, Session history, Authentication token
- Admin → System: Login credentials, Dataset updates (patterns/responses)
- System → Admin: System statistics, User list, Chat histories, Authentication token

---

## 2. DATA FLOW DIAGRAM (DFD) - Level 1 (Detailed)

### Description for draw.io

**Processes (circles):**
1. Authentication Process
2. Chat Management Process
3. AI Query Processing
4. Admin Management Process
5. Dataset Management Process

**Data Stores (parallel lines):**
- D1: Users Database
- D2: Sessions Database
- D3: Conversations Database
- D4: Dataset JSON File

**External Entities (rectangles):**
- Parent/Home Caregiver
- Admin

**Data Flows:**

From Parent:
- Parent → Process 1: Login/Register data
- Parent → Process 2: New session request, Session selection
- Parent → Process 3: User question

From Process 1:
- Process 1 → D1: Store/verify user credentials
- Process 1 → Parent: Authentication token

From Process 2:
- Process 2 → D2: Create/update session
- Process 2 → D3: Retrieve messages
- Process 2 → Parent: Session list, Chat history

From Process 3:
- Process 3 → D4: Read patterns/responses
- Process 3 → D3: Store conversation
- Process 3 → Parent: AI response

From Admin:
- Admin → Process 1: Login credentials
- Admin → Process 4: View stats/users request
- Admin → Process 5: Dataset edit request

From Process 4:
- Process 4 → D1: Read users
- Process 4 → D2: Read sessions
- Process 4 → D3: Read conversations
- Process 4 → Admin: Statistics, User list, Chat histories

From Process 5:
- Process 5 → D4: Update patterns/responses
- Process 5 → Admin: Updated dataset

---

## 3. SYSTEM FLOWCHART - Parent User Flow

### PlantUML Code

```plantuml
@startuml
start

:User opens application;

if (Has account?) then (no)
  :Click "Sign Up";
  :Enter full name, email, password;
  :Submit registration;
  :System creates account;
else (yes)
  :Click "Sign In";
endif

:Enter email and password;
:Submit login;

if (Valid credentials?) then (no)
  :Show error message;
  stop
else (yes)
  :System generates JWT token;
  :Load user dashboard;
endif

:View chat interface;

if (Has previous sessions?) then (yes)
  :Display session list in sidebar;
  :User can select existing session;
else (no)
  :Show empty state;
endif

:User clicks "New Chat";
:System creates new session;
:Display welcome message;

repeat
  :User types question;
  :Click send button;
  :System sends query to backend;
  :AI processes query;
  :Match intent using cosine similarity;
  :Select best response;
  :Return response to user;
  :Display bot message;
  :Save conversation to database;
repeat while (Continue chatting?) is (yes)
->no;

:User clicks logout;
:Clear session token;
:Return to login page;

stop
@enduml
```

---

## 4. SYSTEM FLOWCHART - Admin User Flow

### PlantUML Code

```plantuml
@startuml
start

:Admin opens application;
:Enter admin credentials;
:Submit login;

if (Valid admin credentials?) then (no)
  :Show error message;
  stop
else (yes)
  :System verifies admin role;
  :Load admin panel;
endif

:Display admin dashboard;

partition "Admin Actions" {
  if (Select action) then (View Statistics)
    :Show total users;
    :Show total sessions;
    :Show total messages;
    :Show top 5 topics;
  elseif (View Parents)
    :Display list of all parents;
    :Show parent details;
    if (View parent history?) then (yes)
      :Load parent's sessions;
      :Display chat messages;
    endif
  elseif (Edit Dataset)
    :Display 38 intent tags;
    :Show pattern and response counts;
    if (Click edit on intent?) then (yes)
      :Load intent details;
      :Display patterns (one per line);
      :Display responses (separated by ---);
      :Admin modifies content;
      :Click save;
      if (Valid data?) then (yes)
        :Update dataset JSON file;
        :Reload AI model;
        :Show success message;
      else (no)
        :Show error message;
      endif
    endif
  endif
}

:Admin clicks logout;
:Clear session token;
:Return to login page;

stop
@enduml
```

---

## 5. AI QUERY PROCESSING FLOWCHART

### PlantUML Code

```plantuml
@startuml
start

:Receive user query;
:Clean and normalize text;
:Convert query to embedding vector;

:Load dataset (38 intents);
:Convert all patterns to embeddings;

:Calculate cosine similarity;
:For each pattern in each intent;

:Find highest similarity score;

if (Score >= 0.30 threshold?) then (yes)
  :Select matched intent tag;
  :Get all responses for that tag;
  
  if (Has Rwanda-specific response?) then (yes)
    if (Has "Step 1" + local markers?) then (yes)
      :Select Tier 1 response;
    elseif (Has "Step 1"?) then (yes)
      :Select Tier 2 response;
    else (has Rwanda context)
      :Select Tier 3 response;
    endif
  else (no)
    :Select random response from tag;
  endif
  
  :Return selected response;
else (no)
  :Return fallback message;
  :"I'm not sure about that...";
endif

:Save conversation to database;
:Update session timestamp;

stop
@enduml
```

---

## Instructions for Creating Diagrams

### For PlantUML diagrams (Use Case, Flowcharts):
1. Go to https://www.plantuml.com/plantuml/uml/
2. Copy the code block (including @startuml and @enduml)
3. Paste it into the text area
4. Click "Submit" or the diagram will auto-generate
5. Download as PNG or SVG using the download button

### For DFD (Data Flow Diagram):
1. Go to https://app.diagrams.net/
2. Create a new diagram
3. Use the shapes from the left panel:
   - **Circles/Ovals** for processes
   - **Rectangles** for external entities
   - **Parallel lines** (or open rectangles) for data stores
   - **Arrows** for data flows
4. Follow the descriptions above to draw Level 0 and Level 1 DFDs
5. Label all elements clearly
6. Export as PNG or PDF

### Alternative: Use Microsoft Visio or Lucidchart
If you have access to these tools, you can also create professional diagrams there using the same structure described above.

