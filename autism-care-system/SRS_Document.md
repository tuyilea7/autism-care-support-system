# SRSD — AI-Powered Autism Care Support System

**V1.0**

---

## RP MUSANZE COLLEGE
### DEPARTMENT OF INFORMATION AND COMMUNICATION TECHNOLOGY
### BACHELOR OF TECHNOLOGY IN INFORMATION TECHNOLOGY — RQF LEVEL 8

---

## SOFTWARE REQUIREMENTS SPECIFICATION DOCUMENT (SRSD)

---

## AI-Powered Autism Care Support System
### Real-time Guidance Platform for Parents and Home Caregivers

---

| **Submitted By** | TUYISHIMIRE Lea |
| **Registration No.** | [Your Registration Number] |
| **Supervisor** | [Your Supervisor Name] |
| **Version** | v1.0 — Capstone Project |
| **Date** | April 2026, Musanze, Rwanda |

---

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification Document (SRSD) formally defines all functional, non-functional, and interface requirements for the AI-Powered Autism Care Support System. The document serves as the authoritative reference for system design, development, testing, and validation, ensuring a shared and precise understanding among all stakeholders, developers, quality assurance engineers, and end users.

### 1.2 Scope

The system, referred to hereinafter as the Autism Care Support System (ACSS), is a full-stack web-based application designed to provide real-time, evidence-based guidance to parents and home caregivers of children with autism in Rwanda. The ACSS encompasses the following functional domains:

1. AI-powered conversational chatbot using Natural Language Processing (NLP)
2. User authentication and role-based access control (Admin and Parent roles)
3. Session-based conversation management with persistent history
4. Real-time behavioral guidance covering 38+ autism care topics
5. Admin dashboard for system monitoring and dataset management
6. Parent dashboard for personal activity tracking and insights
7. Rwanda-contextualized responses using local resources and cultural adaptations

**Out of Scope:** Video consultation, medical diagnosis, prescription management, and integration with electronic health records are excluded from the current version but may be addressed in future releases.

### 1.3 Intended Audience

| **Audience** | **Relevance** |
|--------------|---------------|
| Project Supervisor | Academic oversight, approval, and guidance |
| System Developers | Implementation reference for all software components |
| QA/Test Engineers | Basis for test case design and acceptance criteria |
| Parents & Caregivers | Understanding of system capabilities and constraints |
| University Evaluators | Academic assessment of project scope and rigor |

### 1.4 Definitions, Acronyms and Abbreviations

| **Term / Acronym** | **Definition** |
|--------------------|----------------|
| SRSD | Software Requirements Specification Document |
| ACSS | Autism Care Support System (the system described in this document) |
| NLP | Natural Language Processing: AI capability for understanding human language |
| RBAC | Role-Based Access Control: access permissions governed by assigned user roles |
| FR | Functional Requirement |
| NFR | Non-Functional Requirement |
| JWT | JSON Web Token: secure authentication token standard |
| API | Application Programming Interface |
| CRUD | Create, Read, Update, Delete: fundamental database operations |
| ML | Machine Learning |
| SLA | Service Level Agreement: defined performance and availability targets |

### 1.5 References

1. IEEE Std 830-1998: IEEE Recommended Practice for Software Requirements Specifications
2. IEEE Std 29148-2018: Systems and Software Engineering — Life Cycle Processes — Requirements Engineering
3. Rwanda Law No. 058/2021 on Personal Data Protection and Privacy
4. Autism Rwanda (2024). Parent Support Guidelines. Kigali, Rwanda
5. OWASP Top Ten (2021). Web Application Security Risks. Open Web Application Security Project

---

## 2. Overall System Description

### 2.1 Product Perspective

The Autism Care Support System is a standalone, purpose-built web application that integrates AI/ML technology, cloud infrastructure, and a responsive web interface into a cohesive platform. It operates as a three-tier architecture (Presentation → Application → Data) and does not replace any existing commercial system, but rather introduces a novel, locally adapted solution for Rwandan families caring for children with autism.

### 2.2 System Context and Architecture Overview

The ACSS comprises three interacting layers, each with distinct responsibilities:

1. **Presentation Layer:** React.js single-page application (SPA), responsive web interface accessible via any modern browser, Progressive Web App (PWA) capabilities for mobile access
2. **Application Layer:** Flask/Python backend, Sentence Transformer ML model (all-MiniLM-L6-v2), RESTful API, JWT-based authentication, session management
3. **Data Layer:** SQLite relational database, conversation history storage, user management, audit logging

### 2.3 Product Functions Summary

| **#** | **Module** | **Primary Function** |
|-------|------------|---------------------|
| 1 | User Management | Secure authentication, RBAC enforcement, user lifecycle management |
| 2 | AI Chatbot | NLP-powered conversational guidance on autism care topics |
| 3 | Session Management | Persistent conversation history, multi-session support per user |
| 4 | Admin Panel | System monitoring, user management, dataset editing |
| 5 | Parent Dashboard | Personal activity insights, topic analysis, session history |
| 6 | Dataset Management | Admin-controlled intent/pattern/response editing |

### 2.4 User Classes and Characteristics

The ACSS serves two distinct user roles. All roles interact with the system through role-scoped interfaces. Technical proficiency varies significantly across roles, requiring layered UI complexity.

| **Role** | **Description** | **Technical Proficiency** |
|----------|-----------------|---------------------------|
| **Admin** | System administrator with full access to user management, dataset editing, and system monitoring | High — comfortable with technical interfaces |
| **Parent/Caregiver** | Primary end user seeking guidance on autism care. Includes parents, siblings, maids, and other home caregivers | Low to Medium — requires simple, intuitive interface |

### 2.5 Operating Environment

1. **Server:** Cloud-hosted Linux instances (AWS, Heroku, or similar) with Python 3.9+ runtime
2. **Database:** SQLite 3.x for development/demo; PostgreSQL recommended for production
3. **Client:** Any modern web browser (Chrome, Firefox, Safari, Edge) or Android/iOS smartphone
4. **Network:** Minimum 1 Mbps internet connection for reliable real-time chat
5. **Cloud Platform:** AWS, Heroku, or equivalent PaaS provider

### 2.6 Constraints

1. The system requires stable internet connectivity; offline mode is not supported in the current version
2. The AI model (Sentence Transformer) requires approximately 500MB RAM and 2-3 seconds per query on standard cloud instances
3. Initial deployment targets English language; Kinyarwanda support is a future enhancement
4. System must operate within a cloud hosting budget of approximately $20-50 USD per month for small-scale deployment

### 2.7 Assumptions and Dependencies

1. End users (parents/caregivers) possess basic smartphone or web browser literacy
2. The Sentence Transformer model (all-MiniLM-L6-v2) is available via the sentence-transformers Python library
3. Cloud hosting provider maintains 99%+ uptime SLA
4. Dataset content is reviewed and approved by autism care professionals before production deployment

---


## 3. System Users and Role-Based Access Control

### 3.1 RBAC Overview

The ACSS enforces Role-Based Access Control (RBAC) to ensure data security, operational integrity, and task-appropriate usability. Permissions are granted at the role level — not individually — and cannot be escalated without Admin authorization. All role assignments are auditable via system logs.

### 3.2 Role Definitions and Permissions Matrix

| **Capability** | **Admin** | **Parent/Caregiver** |
|----------------|-----------|----------------------|
| System-wide user management (CRUD) | ✔ Full | ✗ |
| Assign / modify roles | ✔ Full | ✗ |
| View all users and their activity | ✔ Full | ✗ |
| Edit dataset (intents, patterns, responses) | ✔ Full | ✗ |
| View system-wide statistics | ✔ Full | ✗ |
| Chat with AI assistant | ✔ Full | ✔ Full |
| View own conversation history | ✔ Full | ✔ Full |
| Create new chat sessions | ✔ Full | ✔ Full |
| View personal dashboard | ✔ Full | ✔ Full |
| Delete own chat sessions | ✔ Full | ✔ Full |
| Rename chat sessions | ✔ Full | ✔ Full |

### 3.3 Role Hierarchy

Permissions flow downward; Admin has all capabilities of Parent plus additional administrative functions.

**Admin** ➡ **Parent/Caregiver**

### 3.4 Role-Based Functional Requirements

1. **FR-U1:** The system shall support a minimum of two distinct user roles as defined in Section 3.2
2. **FR-U2:** The system shall enforce role-based access restrictions on every protected endpoint and UI view
3. **FR-U3:** Only the Admin role shall create, modify, or deactivate user accounts
4. **FR-U4:** Only the Admin role shall edit the dataset (intents, patterns, responses)
5. **FR-U5:** Users shall only access features and data permitted by their assigned role
6. **FR-U6:** All role assignments and modifications shall be recorded in an audit log with timestamp
7. **FR-U7:** The system shall provide session management including automatic timeout after 12 hours of inactivity

---

## 4. Functional Requirements

### 4.1 Module 1: User Management

This module governs user identity, authentication, and authorization throughout the system.

| **FR ID** | **Requirement** | **Priority** |
|-----------|-----------------|--------------|
| FR1.1 | The system shall provide a secure login interface requiring a registered email and password | MUST HAVE |
| FR1.2 | The system shall provide a registration interface for new parent/caregiver accounts requiring full name, email, password, child name, and child age | MUST HAVE |
| FR1.3 | The Admin shall be able to create, read, update, and deactivate user accounts | MUST HAVE |
| FR1.4 | The system shall enforce RBAC as specified in Section 3 on all API endpoints | MUST HAVE |
| FR1.5 | The system shall hash all passwords using bcrypt (minimum cost factor 10) before storage | MUST HAVE |
| FR1.6 | The system shall log all login attempts (successful and failed) with timestamp | SHOULD HAVE |
| FR1.7 | The system shall issue JWT tokens with 12-hour expiry for session management | MUST HAVE |
| FR1.8 | The system shall validate email format and enforce minimum password length of 6 characters | MUST HAVE |

### 4.2 Module 2: AI-Powered Chatbot

This module defines requirements for the conversational AI assistant that provides autism care guidance.

| **FR ID** | **Requirement** | **Priority** |
|-----------|-----------------|--------------|
| FR2.1 | The chatbot shall accept and process natural language queries in English from all authorized users | MUST HAVE |
| FR2.2 | The chatbot shall use the Sentence Transformer model (all-MiniLM-L6-v2) to convert user queries into vector embeddings | MUST HAVE |
| FR2.3 | The chatbot shall compute cosine similarity between the user query embedding and all pre-indexed pattern embeddings from the dataset | MUST HAVE |
| FR2.4 | The chatbot shall return the response from the intent with the highest similarity score above the threshold (0.30) | MUST HAVE |
| FR2.5 | The chatbot shall return a fallback response when no intent matches above the confidence threshold | MUST HAVE |
| FR2.6 | The chatbot shall provide evidence-based guidance on autism care topics including meltdowns, aggression, self-injury, communication, sleep, feeding, and caregiver support | MUST HAVE |
| FR2.7 | The chatbot shall prioritize Rwanda-contextualized responses that reference local resources (Autism Rwanda, district hospitals, 114 emergency number, local materials like kitenge) | MUST HAVE |
| FR2.8 | The chatbot shall respond within 8 seconds per user query under normal system load | MUST HAVE |
| FR2.9 | The chatbot shall tag each response with the matched intent tag for analytics purposes | MUST HAVE |
| FR2.10 | The chatbot shall clearly indicate it provides guidance only and does not replace professional medical consultation | SHOULD HAVE |

### 4.3 Module 3: Session Management

This module governs conversation history, session creation, and persistence.

| **FR ID** | **Requirement** | **Priority** |
|-----------|-----------------|--------------|
| FR3.1 | The system shall allow users to create multiple chat sessions | MUST HAVE |
| FR3.2 | The system shall automatically generate a session title from the first user message (maximum 60 characters) | MUST HAVE |
| FR3.3 | The system shall allow users to rename any of their chat sessions | MUST HAVE |
| FR3.4 | The system shall allow users to delete any of their chat sessions | MUST HAVE |
| FR3.5 | The system shall store all messages (user and bot) with timestamps in the database | MUST HAVE |
| FR3.6 | The system shall display all user sessions in the sidebar, ordered by most recently updated | MUST HAVE |
| FR3.7 | The system shall group sessions by date (Today, Yesterday, This Week, Older) in the sidebar | SHOULD HAVE |
| FR3.8 | The system shall load full conversation history when a user selects a previous session | MUST HAVE |
| FR3.9 | The system shall update the session's updated_at timestamp whenever a new message is added | MUST HAVE |

### 4.4 Module 4: Admin Panel

This module defines administrative capabilities for system monitoring and management.

| **FR ID** | **Requirement** | **Priority** |
|-----------|-----------------|--------------|
| FR4.1 | The Admin shall be able to view system-wide statistics including total parents, total sessions, total messages, and top topics | MUST HAVE |
| FR4.2 | The Admin shall be able to view a list of all registered parents with their email, child info, registration date, session count, and message count | MUST HAVE |
| FR4.3 | The Admin shall be able to view the complete chat history of any parent user | MUST HAVE |
| FR4.4 | The Admin shall be able to view the full dataset (all intents with their patterns and responses) | MUST HAVE |
| FR4.5 | The Admin shall be able to edit patterns and responses for any intent in the dataset | MUST HAVE |
| FR4.6 | The system shall reload the AI model immediately after dataset changes are saved | MUST HAVE |
| FR4.7 | The Admin panel shall be accessible only to users with the Admin role | MUST HAVE |
| FR4.8 | All admin actions (user management, dataset edits) shall be logged in an audit trail | SHOULD HAVE |

### 4.5 Module 5: Parent Dashboard

This module provides personal activity insights for parent/caregiver users.

| **FR ID** | **Requirement** | **Priority** |
|-----------|-----------------|--------------|
| FR5.1 | The system shall display the parent's total number of chat sessions | MUST HAVE |
| FR5.2 | The system shall display the parent's total number of messages sent | MUST HAVE |
| FR5.3 | The system shall calculate and display the average messages per session | MUST HAVE |
| FR5.4 | The system shall display the parent's top 8 most-asked topics with counts | MUST HAVE |
| FR5.5 | The system shall display the parent's 10 most recent sessions with title, message count, last topic, and date | MUST HAVE |
| FR5.6 | The dashboard shall exclude fallback responses from topic analysis | MUST HAVE |
| FR5.7 | The dashboard shall refresh data whenever the user navigates to the Dashboard tab | SHOULD HAVE |

---

## 5. External Interface Requirements

### 5.1 User Interfaces

1. **Web Dashboard (React.js):** Responsive single-page application (SPA) supporting viewport widths from 768px (tablet) to 1920px (full HD). Uses modern CSS with flexbox and grid layouts. Accessible via any modern browser without plugin installation.

2. **Role-Differentiated Views:**
   - **Admin:** Full-width admin panel with tabs for Overview, Parents, and Dataset management
   - **Parent:** Chat interface with sidebar for session history, dashboard tab for personal insights

3. **Chat Interface:** Real-time message display with user messages aligned right (blue background) and bot messages aligned left (gray background). Input bar at bottom with send button. Loading indicator during bot response.

4. **Sidebar:** Collapsible session list grouped by date with New Chat button, session titles, and context menu for rename/delete actions.

### 5.2 Hardware Interfaces

Not applicable — the system is a pure software application with no direct hardware integration.

### 5.3 Software Interfaces

1. **Sentence Transformers Library:** Python library providing the all-MiniLM-L6-v2 model. Loaded once at application startup. Converts text to 384-dimensional embeddings.

2. **Flask Framework:** Python web framework exposing RESTful API endpoints. Handles HTTP requests, JWT validation, and JSON responses.

3. **SQLite Database:** Embedded relational database storing users, sessions, conversations, and audit logs. Accessed via Python sqlite3 module with parameterized queries.

4. **React.js:** JavaScript library for building the user interface. Communicates with backend via fetch API over HTTPS.

5. **bcrypt:** Password hashing library using the bcrypt algorithm with salt rounds of 10.

### 5.4 Communication Interfaces

1. **HTTPS (Port 443, TLS 1.2 minimum)** for all web and API communications in production
2. **HTTP (Port 5000)** for local development only
3. **WebSocket (optional future enhancement)** for real-time message push without polling
4. **JSON** as the data interchange format for all API requests and responses

---

## 6. Non-Functional Requirements

### 6.1 Performance Requirements

| **NFR ID** | **Requirement** | **Measurable Criterion** |
|------------|-----------------|--------------------------|
| NFR-P1 | Chatbot response generation time | ≤ 8 seconds per query |
| NFR-P2 | Dashboard page load time (initial render) | ≤ 3 seconds on 10 Mbps connection |
| NFR-P3 | API response time for standard data queries | 95th percentile ≤ 500 ms |
| NFR-P4 | Session history load time | ≤ 2 seconds for sessions with up to 100 messages |
| NFR-P5 | Concurrent active user sessions supported | Minimum 20 simultaneous users without degradation |

### 6.2 Reliability and Availability

| **NFR ID** | **Requirement** | **Measurable Criterion** |
|------------|-----------------|--------------------------|
| NFR-R1 | System uptime (excluding planned maintenance) | ≥ 99.0% monthly availability |
| NFR-R2 | Database backup frequency and retention | Automated daily backup; minimum 30-day retention |
| NFR-R3 | Mean Time to Recovery (MTTR) for critical failures | ≤ 4 hours with documented recovery procedure |
| NFR-R4 | Data persistence guarantee | All conversation data persisted to disk within 1 second of user submission |

### 6.3 Security Requirements

| **NFR ID** | **Requirement** |
|------------|-----------------|
| NFR-S1 | All API communications shall use HTTPS with TLS 1.2 or higher in production. HTTP traffic shall be automatically redirected to HTTPS. |
| NFR-S2 | User passwords shall be hashed using bcrypt (minimum cost factor 10) and salted before storage. Plaintext passwords shall never be stored or logged. |
| NFR-S3 | The system shall implement input validation and parameterized queries on all database interactions to prevent SQL injection attacks. |
| NFR-S4 | All authentication tokens (JWT) shall have a maximum validity of 12 hours and shall be invalidated on logout. |
| NFR-S5 | The system shall maintain an audit log of all sensitive operations: login/logout, role changes, dataset modifications, user account changes. |
| NFR-S6 | OWASP Top Ten (2021) vulnerabilities shall be addressed during development and verified through security review before production deployment. |
| NFR-S7 | Admin panel access shall be restricted to users with role='admin' enforced at both frontend and backend levels. |

### 6.4 Usability Requirements

1. **NFR-U1:** The chat interface shall present responses in plain, non-technical language appropriate for parents with basic literacy.
2. **NFR-U2:** First-time users shall be able to send a message and receive a response without external training or documentation.
3. **NFR-U3:** The system shall provide visual feedback (loading indicators, typing animations) during all asynchronous operations.
4. **NFR-U4:** All user-facing text shall be available in English. Kinyarwanda language support is a future enhancement.
5. **NFR-U5:** The mobile interface shall be fully operable on standard smartphone screens (5–6.7 inch diagonal) without horizontal scrolling.
6. **NFR-U6:** Error messages shall be clear, actionable, and non-technical (e.g., "Email already registered" not "UNIQUE constraint failed").

### 6.5 Scalability and Maintainability

1. **NFR-M1:** The system architecture shall support the addition of new intents to the dataset without code changes, achieved through JSON-based dataset structure.
2. **NFR-M2:** The system shall use modular, well-documented code following RESTful API design principles.
3. **NFR-M3:** All configuration parameters (JWT secret, database path, model name) shall be stored in environment variables or configuration files, not hard-coded.
4. **NFR-M4:** The codebase shall maintain clear separation of concerns: backend (Flask), frontend (React), AI logic (chatbot.py), database (database.py).
5. **NFR-M5:** The system shall support migration from SQLite to PostgreSQL with minimal code changes (< 50 lines).

---


## 7. Use Cases

### 7.1 Use Case Diagram Summary

The following table summarizes the primary use cases of the ACSS, mapped to user roles and system modules.

| **UC#** | **Use Case** | **Primary Actor(s)** | **Modules Involved** |
|---------|--------------|----------------------|----------------------|
| UC-01 | User Registration | Parent/Caregiver | User Management |
| UC-02 | User Login and Authentication | All Roles | User Management |
| UC-03 | Create New Chat Session | Parent/Caregiver, Admin | Session Management |
| UC-04 | Send Message to Chatbot | Parent/Caregiver, Admin | AI Chatbot, Session Management |
| UC-05 | View Conversation History | Parent/Caregiver, Admin | Session Management |
| UC-06 | Rename Chat Session | Parent/Caregiver, Admin | Session Management |
| UC-07 | Delete Chat Session | Parent/Caregiver, Admin | Session Management |
| UC-08 | View Personal Dashboard | Parent/Caregiver, Admin | Parent Dashboard |
| UC-09 | View All Parents (Admin) | Admin | Admin Panel |
| UC-10 | View Parent Chat History (Admin) | Admin | Admin Panel |
| UC-11 | Edit Dataset Intent (Admin) | Admin | Admin Panel |
| UC-12 | View System Statistics (Admin) | Admin | Admin Panel |

### 7.2 Detailed Use Case: UC-04 — Send Message to Chatbot

| **Use Case Element** | **Description** |
|----------------------|-----------------|
| **Use Case ID** | UC-04 |
| **Use Case Name** | Send Message to Chatbot |
| **Actor(s)** | Parent/Caregiver, Admin |
| **Preconditions** | User is authenticated. User has selected or created a chat session. |
| **Main Flow** | 1. User types a message in the input field and clicks Send or presses Enter.<br>2. System displays the user message in the chat window aligned to the right.<br>3. System shows a loading indicator (typing animation).<br>4. System sends the message to the backend API with the session ID.<br>5. Backend converts the message to a vector embedding using the Sentence Transformer model.<br>6. Backend computes cosine similarity against all pattern embeddings in the dataset.<br>7. Backend selects the intent with the highest similarity score above threshold (0.30).<br>8. Backend retrieves the best response from the matched intent (prioritizing Rwanda-contextualized responses).<br>9. Backend saves both user message and bot response to the database with timestamps.<br>10. Backend returns the bot response, intent tag, and updated session title to the frontend.<br>11. System displays the bot response in the chat window aligned to the left.<br>12. System updates the session title in the sidebar if it was auto-generated.<br>13. System scrolls the chat window to the bottom to show the latest message. |
| **Alternative Flow 1** | If no intent matches above threshold: Backend returns a fallback response: "I hear your frustration, and I want to provide better support. Sometimes autism care questions need specific details. What does this look like in your daily life?" |
| **Alternative Flow 2** | If API request fails (network error, server error): System displays an error message: "Sorry, I'm having trouble connecting. Please try again." User message remains in the input field for retry. |
| **Postconditions** | User message and bot response are saved to the database. Conversation history is updated. Session updated_at timestamp is refreshed. |
| **Business Rules** | Session title is auto-generated from the first user message (max 60 characters). Rwanda-contextualized responses (containing keywords like "114", "district hospital", "kitenge", "Autism Rwanda") are prioritized over generic responses. |

### 7.3 Detailed Use Case: UC-11 — Edit Dataset Intent (Admin)

| **Use Case Element** | **Description** |
|----------------------|-----------------|
| **Use Case ID** | UC-11 |
| **Use Case Name** | Edit Dataset Intent (Admin) |
| **Actor(s)** | Admin |
| **Preconditions** | User is authenticated with Admin role. User is on the Admin Panel Dataset tab. |
| **Main Flow** | 1. Admin views the list of all intents (38 tags) with pattern and response counts.<br>2. Admin clicks "Edit" on a specific intent (e.g., "meltdown_handling").<br>3. System displays the Edit Intent view with two text areas: Patterns (one per line) and Responses (separated by `---`).<br>4. Admin modifies patterns and/or responses as needed.<br>5. Admin clicks "Save Changes".<br>6. System validates that patterns and responses are not empty.<br>7. System sends a PUT request to `/api/admin/dataset/{tag}` with the updated data.<br>8. Backend updates the dataset JSON file with the new patterns and responses.<br>9. Backend reloads the AI model to index the new patterns.<br>10. System displays "Saved successfully" message.<br>11. Admin clicks "Back to Dataset" to return to the intent list. |
| **Alternative Flow** | If save fails (validation error, file write error): System displays "Save failed" message. Changes are not persisted. Admin can retry or cancel. |
| **Postconditions** | Dataset JSON file is updated. AI model is reloaded with new pattern embeddings. Future user queries will match against the updated patterns. |
| **Business Rules** | Only Admin role can edit the dataset. All dataset changes are logged in the audit trail (future enhancement). The chatbot must be reloaded immediately after dataset changes to ensure consistency. |

---

## 8. Data Requirements

### 8.1 Entity Relationship Overview

The following core entities and their relationships define the data model for the ACSS database:

| **Entity** | **Key Attributes and Relationships** |
|------------|--------------------------------------|
| **User** | `id` (PK), `full_name`, `email` (UNIQUE), `password` (hashed), `child_name`, `child_age`, `role` (admin/parent), `created_at`. Has many Sessions. Has many Conversations. |
| **Session** | `id` (PK), `session_id` (UNIQUE UUID), `user_id` (FK), `title`, `created_at`, `updated_at`. Belongs to one User. Has many Conversations. |
| **Conversation** | `id` (PK), `user_id` (FK), `session_id` (FK), `role` (user/bot), `message` (TEXT), `tag` (intent tag, nullable), `timestamp`. Belongs to one User. Belongs to one Session. |

### 8.2 Database Schema (SQLite)

```sql
CREATE TABLE users (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name   TEXT    NOT NULL,
    email       TEXT    NOT NULL UNIQUE,
    password    TEXT    NOT NULL,
    child_name  TEXT,
    child_age   INTEGER,
    role        TEXT    NOT NULL DEFAULT 'parent',
    created_at  TEXT    NOT NULL
);

CREATE TABLE sessions (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id  TEXT    NOT NULL UNIQUE,
    user_id     INTEGER NOT NULL,
    title       TEXT    NOT NULL DEFAULT 'New Chat',
    created_at  TEXT    NOT NULL,
    updated_at  TEXT    NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE conversations (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL,
    session_id  TEXT    NOT NULL,
    role        TEXT    NOT NULL,
    message     TEXT    NOT NULL,
    tag         TEXT,
    timestamp   TEXT    NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (session_id) REFERENCES sessions(session_id)
);
```

### 8.3 Data Retention Policy

1. **User accounts:** Retained indefinitely while active. Deactivated accounts retained for 12 months, then anonymized.
2. **Conversation history:** Retained indefinitely for research and system improvement purposes (with user consent).
3. **Audit logs:** Retained for 36 months minimum (compliance).
4. **Session data:** Retained indefinitely unless explicitly deleted by the user.

### 8.4 Dataset Structure (JSON)

The AI chatbot dataset is stored in `try_complete.json` with the following structure:

```json
{
  "intents": [
    {
      "tag": "meltdown_handling",
      "patterns": [
        "my child is having a meltdown",
        "child screaming uncontrollably",
        "she is screaming how can i calm her",
        ...
      ],
      "responses": [
        "Hello. I understand this is very hard for you. Your daughter is not being stubborn - she is overwhelmed. Let me give you steps that work in a Rwandan home...",
        ...
      ]
    },
    ...
  ]
}
```

**Dataset Statistics:**
- Total intents: 38 tags
- Total patterns: 1,200+ user query variations
- Total responses: 400+ evidence-based guidance responses
- Rwanda-contextualized responses: 150+ responses mentioning local resources, emergency numbers (114), and cultural adaptations

---

## 9. System Constraints

### 9.1 Technical Constraints

1. The system requires active internet connectivity for cloud-based operation; offline functionality is not supported in the current version.
2. The Sentence Transformer model requires approximately 500MB RAM and 2-3 seconds per query on standard cloud instances.
3. SQLite database is suitable for development and small-scale deployment (< 100 concurrent users); PostgreSQL migration required for production scale.
4. The AI model does not learn from user interactions in real-time; dataset updates require manual admin intervention and model reload.

### 9.2 Business Constraints

1. The system must be operable by users with basic smartphone literacy without dedicated IT support staff.
2. The system must comply with Rwanda's Data Protection Law (Law No. 058/2021) regarding collection, storage, and processing of personal data.
3. Total cloud hosting cost must not exceed $50 USD per month for small-scale deployment (< 100 active users).

### 9.3 Regulatory and Compliance Constraints

1. Personal data handling must comply with Rwanda Law No. 058/2021 on Personal Data Protection and Privacy.
2. Medical guidance provided by the chatbot shall include disclaimers and not replace licensed medical professional consultation.
3. The system shall not store or process sensitive health information beyond what is voluntarily provided by users in chat messages.

---

## 10. Future Enhancements

The following features are explicitly out of scope for the current version but are recommended for subsequent development phases:

1. **Kinyarwanda Language Support:** Full localization of the interface and chatbot to improve adoption among Rwandan families with limited English proficiency.

2. **Voice Input/Output:** Integration of speech-to-text and text-to-speech capabilities for users with low literacy or visual impairments.

3. **Real-time Model Fine-tuning:** Continuous learning from user interactions to improve response accuracy and relevance over time.

4. **Multi-modal Input:** Support for image uploads (e.g., photos of child behavior, rashes, or environmental triggers) with computer vision analysis.

5. **Video Consultation Integration:** Direct connection to autism specialists for live video consultations when chatbot guidance is insufficient.

6. **Mobile Native Application:** Dedicated Android and iOS native applications for improved performance, offline capability, and push notifications.

7. **Community Forum:** Peer support platform where parents can connect, share experiences, and support each other.

8. **Progress Tracking:** Longitudinal tracking of child development milestones, behavior patterns, and intervention effectiveness.

9. **Multi-language Dataset:** Expansion beyond English and Kinyarwanda to support other Rwandan languages (French, Swahili).

10. **Integration with Autism Rwanda:** Direct API integration with Autism Rwanda's systems for referrals, resource sharing, and coordinated support.

---

## 11. Appendices

### Appendix A: Autism Care Topics Covered (38 Intents)

| **Category** | **Intent Tags** |
|--------------|-----------------|
| **Behavioral** | greeting, goodbye, meltdown_handling, aggression_handling, self_injury_behavior, breaking_objects_behavior, refusal_behavior, isolation_behavior, elopement_wandering |
| **Communication** | communication_support |
| **Sensory** | sensory_overload |
| **Daily Living** | sleep_problems, feeding_issues, routine_management, toilet_training_issues, pica_eating_nonfood |
| **Medical/Clinical** | autism_diagnosis_guidance, therapy_services, medical_specialists, professional_referral, seizures_epilepsy, regression_loss_skills |
| **Educational** | school_support, social_skills_development, transition_planning |
| **Adult/Future** | adult_services, financial_legal_planning, insurance_navigation, puberty_sexual_development |
| **Caregiver** | caregiver_support, support_groups |
| **Rwanda-Specific** | rwandan_context, low_resource_strategies, cultural_considerations, rwanda_resources, emergency_rwanda |
| **System** | fallback, rwandan_professional_voice |

### Appendix B: Technology Stack

| **Layer** | **Technology** | **Version** | **Purpose** |
|-----------|----------------|-------------|-------------|
| **Frontend** | React.js | 18.3.1 | User interface library |
| **Frontend Build** | Vite | 5.4.2 | Fast build tool and dev server |
| **Backend** | Flask | 3.0.3 | Python web framework |
| **AI/ML** | sentence-transformers | 3.0.1 | Sentence embedding model |
| **ML Model** | all-MiniLM-L6-v2 | — | 384-dim sentence embeddings |
| **ML Utilities** | scikit-learn | 1.5.1 | Cosine similarity computation |
| **Authentication** | flask-jwt-extended | 4.6.0 | JWT token management |
| **Password Hashing** | bcrypt | 4.1.3 | Secure password hashing |
| **Database** | SQLite | 3.x | Embedded relational database |
| **CORS** | flask-cors | 4.0.1 | Cross-origin resource sharing |

### Appendix C: API Endpoints Reference

| **Method** | **Endpoint** | **Description** | **Auth Required** | **Role** |
|------------|--------------|-----------------|-------------------|----------|
| POST | `/api/auth/register` | Register new parent account | No | — |
| POST | `/api/auth/login` | User login | No | — |
| GET | `/api/auth/me` | Get current user info | Yes | All |
| GET | `/api/sessions` | List user's chat sessions | Yes | All |
| POST | `/api/sessions` | Create new chat session | Yes | All |
| PATCH | `/api/sessions/<id>` | Rename chat session | Yes | All |
| DELETE | `/api/sessions/<id>` | Delete chat session | Yes | All |
| GET | `/api/sessions/<id>/messages` | Get session messages | Yes | All |
| POST | `/api/chat` | Send message to chatbot | Yes | All |
| GET | `/api/dashboard` | Get personal dashboard data | Yes | Parent |
| GET | `/api/admin/stats` | Get system-wide statistics | Yes | Admin |
| GET | `/api/admin/users` | List all parent users | Yes | Admin |
| GET | `/api/admin/users/<id>/messages` | Get parent's chat history | Yes | Admin |
| GET | `/api/admin/dataset` | Get full dataset | Yes | Admin |
| PUT | `/api/admin/dataset/<tag>` | Update intent patterns/responses | Yes | Admin |
| GET | `/api/health` | Health check | No | — |

### Appendix D: Requirement Traceability Matrix (RTM) — Summary

| **FR / NFR ID** | **Requirement Summary** | **Module** | **Test Case Reference** |
|-----------------|-------------------------|------------|-------------------------|
| FR1.1–1.8 | User authentication, RBAC, account management | User Management | TC-UM-001 to TC-UM-008 |
| FR2.1–2.10 | AI chatbot NLP, intent matching, response generation | AI Chatbot | TC-CB-001 to TC-CB-010 |
| FR3.1–3.9 | Session creation, history, persistence | Session Management | TC-SM-001 to TC-SM-009 |
| FR4.1–4.8 | Admin panel, user management, dataset editing | Admin Panel | TC-AP-001 to TC-AP-008 |
| FR5.1–5.7 | Personal dashboard, activity insights | Parent Dashboard | TC-PD-001 to TC-PD-007 |
| NFR-P1–P5 | Performance latency and concurrency targets | All Modules | TC-NFR-PERF-001–005 |
| NFR-R1–R4 | Availability, backup, data persistence | All Modules | TC-NFR-REL-001–004 |
| NFR-S1–S7 | Security controls: encryption, auth, audit | All Modules | TC-NFR-SEC-001–007 |

---

## Document Sign-Off

| **Role** | **Name** | **Signature & Date** |
|----------|----------|----------------------|
| **Author / Developer** | TUYISHIMIRE Lea | ________________________ |
| **Project Supervisor** | [Supervisor Name] | ________________________ |
| **Head of ICT Department** | To be completed | ________________________ |

---

**RP Musanze College**  
**Department of Information and Communication Technology**  
**Bachelor of Technology in Information Technology — RQF Level 8**

**End of Document**
