# ChatGPT-Style Chat Application

A simplified ChatGPT-style web application built with **React**, **TailwindCSS**, and **Node.js (Express)**.  
The app supports session-based chats, a collapsible left sidebar with session history, a chat-style interface, mock table responses, and dark/light theme toggle.

---

## 🔧 Tech Stack

**Frontend**

- React (JavaScript)
- TailwindCSS
- Fetch / Axios for API calls (whichever you use)

**Backend**

- Node.js
- Express.js
- In-memory / mock JSON-based data (no real database)

---

## ✨ Features

### Frontend

- **Landing / New Chat Page**
  - “New Chat” button to start a fresh session.
- **Left Side Panel**
  - Shows:
    - List of all chat sessions
    - “New Chat” option
    - User info (static/dummy)
  - Collapsible panel (expand / collapse).
- **Chat Interface**
  - Ask a question within a session.
  - Fetch dummy data from backend.
  - Display answer as:
    - **Structured tabular data**
    - **Textual description**
- **Answer Feedback**
  - Each answer supports:
    - 👍 Like
    - 👎 Dislike
- **Dark / Light Theme**
  - Theme toggle in the top bar.
  - Entire app UI (background, text, components) updates accordingly.
- **Responsive Design**
  - Works on mobile, tablet, and desktop.

### Backend

- **Mock data APIs** (no DB, just JS/JSON in memory).
- Endpoints for:
  - Start new chat → returns new `sessionId`.
  - Ask a question → returns dummy table + description.
  - Fetch sessions list → returns all sessions with IDs/titles.
  - Fetch session history → returns all Q&A for a given session.

### Bonus: Session Management

- Each **New Chat** generates a **new session**.
- Session ID is reflected in the URL (e.g. `/chat/:sessionId`).
- All subsequent questions in that tab belong to the same session.
- Clicking a session in the left panel loads its full history.

### Screenshots

<img width="1921" height="979" alt="Dark_theme Home Page" src="https://github.com/user-attachments/assets/b249eaf0-97a2-41bc-8ca6-ab6cd2dfd8b3" />

<img width="1926" height="984" alt="Light-theme home Page" src="https://github.com/user-attachments/assets/1bae5a7d-5d8f-4e86-8d31-7f4955d86a29" />

<img width="1926" height="975" alt="Screenshot_1" src="https://github.com/user-attachments/assets/3d6d1b3f-0cdb-4383-b58b-1563371964eb" />

<img width="1916" height="981" alt="Screenshot_2" src="https://github.com/user-attachments/assets/e53f91b9-9afe-487d-82f4-d1e2cea5c4be" />

https://github.com/user-attachments/assets/02657221-e79a-4543-bda5-9df5563aafb4
