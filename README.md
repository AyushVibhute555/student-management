# Student Management System

A full-stack Student Management System built with a Python (Flask) backend and a React (Vite) frontend. This project implements a complete CRUD REST API with server-side validation and a responsive, component-based Single Page Application (SPA).

## 🚀 Setup & Run Instructions (Under 10 minutes)

This project uses SQLite for the database, requiring zero external database configuration to run locally.

### Prerequisites
- Python 3.10+
- Node.js 18+

### 1. Backend Setup
Open a terminal and navigate to the `backend` directory:
```bash
cd backend

# Create and activate a virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Mac/Linux:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the backend (runs on http://localhost:5000)
python app.py
```
*(Note: The SQLite database and tables will be generated automatically on the first run).*

### 2. Frontend Setup
Open a second terminal and navigate to the `frontend` directory:
```bash
cd frontend

# Install dependencies
npm install

# Run the development server (runs on http://localhost:5173)
npm run dev
```

### 3. Running Tests
To verify the backend logic, ensure your virtual environment is active and run:
```bash
cd backend
python -m pytest tests/
```

---

## 🏗️ Design Notes

**Data Model:** 
The data layer utilizes a single `Student` entity mapped via SQLAlchemy to an SQLite database. It includes strict constraints (e.g., unique email, non-nullable names). 

**API Architecture:** 
The backend exposes a RESTful API using Flask Blueprints. It strict adheres to standard HTTP status codes:
- `201 Created` for successful POSTs.
- `400 Bad Request` for validation failures (managed by Pydantic).
- `404 Not Found` for missing IDs.
- `409 Conflict` for unique constraint violations (duplicate emails).

**Component Structure:**
The React frontend separates concerns strictly. 
- `api/studentService.js`: An isolated Axios service layer. Components never make raw `fetch` calls.
- `StudentList.jsx`: The main view handling data fetching, pagination state, and status filtering.
- `StudentFormModal.jsx`: A reusable modal that handles both Create and Update mutations, managing its own local form state and surfacing API errors.

---

## 🛠️ Tech Choices & Rationale

*   **Backend - Flask:** Selected for its lightweight nature and explicit routing, which aligns with the company stack and allows for rapid development without the overhead of Django.
*   **Validation - Pydantic:** Chosen to strictly validate incoming JSON payloads *before* they touch the database, ensuring data integrity (e.g., catching future birthdates).
*   **Database - SQLite (via SQLAlchemy):** Used to ensure a frictionless local setup for reviewers. SQLAlchemy allows this to be instantly swapped to PostgreSQL for production deployment simply by changing the connection string.
*   **Frontend Framework - React (Vite):** While Vue is the company's primary stack, I chose React because it is the component-based framework I am most highly proficient in for building scalable SPAs. Vite was used over CRA for drastically superior HMR and build times.
*   **Styling - Tailwind CSS:** Allowed for the rapid development of a premium, responsive, "glassmorphic" UI with clean error states and transitions without writing bloated custom CSS files.

---

## 🤖 AI Usage & Caught Mistakes

**Tools Used:** Gemini and Claude.

**Concrete Mistake Caught:**
While building the API, I used AI to generate the `POST /students` endpoint and its exception handling block for Pydantic validation errors. The AI generated this code:
```python
except ValidationError as e:
    return jsonify({"error": "Validation failed", "details": e.errors()}), 400
```
**How I noticed:** When I wrote and ran my `pytest` suite simulating a future date of birth, the test failed with a `500 Internal Server Error` instead of the expected `400`. The traceback revealed `TypeError: Object of type ValueError is not JSON serializable`. 

**What I changed:** I realized that Pydantic's `e.errors()` embeds raw Python `ValueError` objects (from the custom validators I wrote) which Flask's `jsonify` cannot serialize. I fixed the AI's mistake by mapping the error array to extract only the safe strings before returning it to the client:
```python
except ValidationError as e:
    clean_errors = [{"field": err.get("loc"), "message": err.get("msg")} for err in e.errors()]
    return jsonify({"error": "Validation failed", "details": clean_errors}), 400
```

---

## 🚧 Known Limitations & Next Steps

If I had more time, I would implement:
1.  **Backend Pagination Optimization:** Currently, the `paginate` method uses standard offset/limit. For a massive dataset, cursor-based pagination would be more performant.
2.  **Debouncing:** Add a debounced search bar to filter students by name, minimizing API calls.
3.  **Frontend State Management:** While local component state is fine for this scope, moving to React Query (TanStack Query) would provide better automatic caching, background refetching, and simpler loading state management.

---

## 📸 Screenshots

### 1. List View (with Pagination & Status Filter)
![List View](https://github.com/AyushVibhute555/student-management/blob/main/screenshots/Student%20List%20with%20Pagination.png)

### 2. Create/Edit Form 
![Create Form](https://github.com/AyushVibhute555/student-management/blob/main/screenshots/New%20Student%20Form.png)

### 3. Validation Errors (Backend 400 mapped to UI)
![Validation Error](https://github.com/AyushVibhute555/student-management/blob/main/screenshots/Duplicate%20Error%20409.png)

### 4. Empty / Error State
![Empty State](https://github.com/AyushVibhute555/student-management/blob/main/screenshots/Empty%20Error%20State.png)

![Empty State](https://github.com/AyushVibhute555/student-management/blob/main/screenshots/Backend%20Logs.png)
>>>>
