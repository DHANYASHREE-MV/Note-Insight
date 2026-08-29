
🩺 Note Insight – Clinical AI Assistant

Note Insight is an AI-powered clinical note analysis platform that helps users analyze clinical notes, identify medical conditions, detect documentation gaps, and manage their analysis history through a private workspace.

---
 🚀 Deployment

- Frontend: https://noteinsight.vercel.app/
- Backend: https://note-insight-xtu5.onrender.com/
- Database & Authentication: https://note-insight-xtu5.onrender.com/docs

---

📌 Short Summary

Note Insight provides a secure workspace where authenticated users can submit clinical notes and receive AI-powered analysis. The application uses a React frontend, FastAPI backend, Gemini AI for analysis, and Firebase for authentication and data storage.

Each user has an isolated workspace, ensuring that analyses belonging to one user are not visible in another user's dashboard or history.


🏗️ Architecture


                         ┌──────────────────┐
                         │      USER        │
                         └────────┬─────────┘
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │     React + Vite        │
                    │        Frontend         │
                    │         Vercel          │
                    └────────────┬────────────┘
                                 │
                            REST API
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │        FastAPI          │
                    │        Backend          │
                    │         Render          │
                    └───────┬─────────┬───────┘
                            │         │
                            │         │
                            ▼         ▼
                 ┌──────────────┐  ┌──────────────┐
                 │ Firebase     │  │  Gemini AI   │
                 │ Auth +       │  │   Analysis   │
                 │ Firestore    │  │              │
                 └──────────────┘  └──────────────┘
`


🛠️ Tech Stack

Frontend

* React.js
* TypeScript
* Vite
* React Router
* CSS

 Backend

* Python
* FastAPI
* Uvicorn
* REST APIs

 AI

* Google Gemini
* Google Generative AI

 Authentication & Database

* Firebase Authentication
* Firebase Firestore
* Firebase Admin SDK

 Deployment

* GitHub
* Vercel
* Render



✨ Key Features

 🔐 Authentication

* User registration
* User login
* Logout
* Authenticated workspace
* User-specific data access

📊 Dashboard

The dashboard provides an overview of the user's activity, including:

* Total analyses
* Pending reviews
* Reviewed analyses
* Conditions identified
* Recent patient analyses
* Search functionality

📝 New Analysis

Users can:

1. Open **New Analysis**
2. Enter a clinical note
3. Submit the note for analysis
4. Receive AI-generated insights
5. Review identified conditions and documentation information

📚 History

Users can view their previous analyses and access their analysis history from their private workspace.

👨‍⚕️ Patients

The Patients section provides access to patient-related analysis information stored within the user's workspace.

⚙️ Settings

Users can customize:

* Appearance

  * Light
  * Dark
  * System
* Language
* Notifications

🔒 Privacy

Each user has an isolated workspace.

A user cannot see another user's:

* Clinical notes
* Analyses
* Patient records
* Dashboard statistics
* Analysis history



▶️ How to Use

### 1. Open Note Insight

Open the deployed frontend application.

### 2. Create an Account

Register using the available authentication option.

### 3. Log In

After successful login, you will be redirected to your private dashboard.

### 4. Dashboard

From the dashboard you can see:

* Your total analyses
* Reviewed analyses
* Identified conditions
* Recent analyses

### 5. Create an Analysis

Click **New Analysis**.

Paste or enter the clinical note and click **Analyze Note**.

### 6. View Results

The application sends the note to the backend, where it is processed using Gemini AI.

The generated analysis is then returned to the frontend.

### 7. View History

Open **History** to view your previous analyses.

### 8. Manage Patients

Open **Patients** to view patient-related analysis information.

### 9. Customize Settings

Open **Settings** to change appearance, language and notification preferences.

### 10. Logout

Click **Sign Out** when you are finished.

---

 
## 🔄 Application Flow

```text
User Login
    │
    ▼
Authentication
    │
    ▼
Private Dashboard
    │
    ├───────────────┐
    │               │
    ▼               ▼
New Analysis      History
    │
    ▼
Enter Clinical Note
    │
    ▼
FastAPI Backend
    │
    ▼
Gemini AI
    │
    ▼
AI Analysis
    │
    ▼
Store User-Specific Data
    │
    ▼
Display Results
```

---

