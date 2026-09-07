# backend/tests/test_students.py
import pytest
from app import create_app
from models import db
from datetime import date, timedelta

@pytest.fixture
def client():
    # 1. Setup a test app instance
    app = create_app()
    app.config.update({
        "TESTING": True,
        # Use an in-memory database specifically for testing
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:"
    })

    # 2. Create the test database tables
    with app.app_context():
        db.create_all()
        yield app.test_client()  # This client will be used to make mock API requests
        db.drop_all()            # Clean up after tests are done

# --- TEST 1: Successful Creation ---
def test_create_student_success(client):
    payload = {
        "first_name": "John",
        "last_name": "Doe",
        "email": "john.doe@example.com",
        "date_of_birth": "2000-01-01",
        "enrollment_status": "active"
    }
    response = client.post('/api/students', json=payload)
    
    assert response.status_code == 201
    data = response.get_json()
    assert data["first_name"] == "John"
    assert data["email"] == "john.doe@example.com"
    assert "id" in data

# --- TEST 2: Validation Failure (Future Date) ---
def test_create_student_validation_failure(client):
    future_date = (date.today() + timedelta(days=10)).isoformat()
    payload = {
        "first_name": "Jane",
        "last_name": "Smith",
        "email": "jane.smith@example.com",
        "date_of_birth": future_date,  # Invalid: Future date
        "enrollment_status": "active"
    }
    response = client.post('/api/students', json=payload)
    
    # Should fail validation and return 400 Bad Request
    assert response.status_code == 400
    data = response.get_json()
    assert "error" in data
    assert "Validation failed" in data["error"]

# --- TEST 3: Not-Found Error ---
def test_get_student_not_found(client):
    # Requesting an ID that doesn't exist
    response = client.get('/api/students/999')
    
    # Should return 404 Not Found
    assert response.status_code == 404
    data = response.get_json()
    assert data["error"] == "Not Found"