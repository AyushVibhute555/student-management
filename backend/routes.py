# backend/routes.py
from flask import Blueprint, request, jsonify
from pydantic import ValidationError
from sqlalchemy.exc import IntegrityError
from models import db, Student
from schemas import StudentCreateSchema, StudentUpdateSchema

student_bp = Blueprint('students', __name__)

@student_bp.route('/students', methods=['POST'])
def create_student():
    try:
        data = request.get_json()
        validated_data = StudentCreateSchema(**data)
        
        new_student = Student(**validated_data.model_dump())
        db.session.add(new_student)
        db.session.commit()
        
        return jsonify(new_student.to_dict()), 201

    except ValidationError as e:
        # FIX: Extract only the serializable string messages from Pydantic
        clean_errors = [{"field": err.get("loc"), "message": err.get("msg")} for err in e.errors()]
        return jsonify({"error": "Validation failed", "details": clean_errors}), 400
        
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Conflict", "message": "Email already exists"}), 409

@student_bp.route('/students', methods=['GET'])
def get_students():
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 10, type=int)
    status = request.args.get('status', type=str)

    query = Student.query

    if status:
        query = query.filter_by(enrollment_status=status)

    paginated_students = query.paginate(page=page, per_page=limit, error_out=False)

    return jsonify({
        "data": [student.to_dict() for student in paginated_students.items],
        "meta": {
            "total": paginated_students.total,
            "page": paginated_students.page,
            "pages": paginated_students.pages
        }
    }), 200

@student_bp.route('/students/<int:student_id>', methods=['GET'])
def get_student(student_id):
    # FIX: Use the modern SQLAlchemy 2.0 query syntax to prevent warnings
    student = db.get_or_404(Student, student_id, description="Student not found")
    return jsonify(student.to_dict()), 200

@student_bp.route('/students/<int:student_id>', methods=['PUT', 'PATCH'])
def update_student(student_id):
    student = db.get_or_404(Student, student_id, description="Student not found")
    
    try:
        data = request.get_json()
        validated_data = StudentUpdateSchema(**data)
        
        update_dict = validated_data.model_dump(exclude_unset=True)
        for key, value in update_dict.items():
            setattr(student, key, value)
            
        db.session.commit()
        return jsonify(student.to_dict()), 200

    except ValidationError as e:
        clean_errors = [{"field": err.get("loc"), "message": err.get("msg")} for err in e.errors()]
        return jsonify({"error": "Validation failed", "details": clean_errors}), 400
        
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Conflict", "message": "Email already exists"}), 409

@student_bp.route('/students/<int:student_id>', methods=['DELETE'])
def delete_student(student_id):
    student = db.get_or_404(Student, student_id, description="Student not found")
    db.session.delete(student)
    db.session.commit()
    return '', 204

@student_bp.app_errorhandler(404)
def handle_404(error):
    return jsonify({"error": "Not Found", "message": str(error.description)}), 404