# MINI-CRM

A simple Client Lead Management CRM built using React, Node.js, Express, and lowdb.

## Features

* User authentication
* Dashboard overview
* Add and manage client leads
* Lead status tracking
* Notes management
* Responsive frontend UI
* REST API backend
* File-based database using lowdb

## Tech Stack

### Frontend

* React.js
* Vite
* CSS

### Backend

* Node.js
* Express.js

### Database

* lowdb (JSON file storage)

---

## Project Structure

```text id="u18pm7"
MINI-CRM/
├── backend/
├── frontend/
├── README.md
└── .gitignore
```

---

## Installation

### 1. Clone Repository

```bash id="u3n9rx"
git clone https://github.com/YOUR_USERNAME/MINI-CRM.git
cd MINI-CRM
```

---

## Backend Setup

```bash id="s4p39l"
cd backend
npm install
npm run dev
```

Backend runs on:

```text id="4l9q7q"
http://localhost:5000
```

---

## Frontend Setup

Open another terminal:

```bash id="3pfcmh"
cd frontend
npm install
npm run dev
```

Frontend runs on:

```text id="4g5k4v"
http://localhost:5173
```

---

## Environment Variables

Create a `.env` file inside backend:

```env id="i91glx"
PORT=5000
JWT_SECRET=your_secret_key
```

---

## Future Improvements

* MongoDB/MySQL integration
* Email notifications
* Role-based authentication
* Analytics dashboard
* Cloud deployment

---

## Author

Built by Haneefa🚀

