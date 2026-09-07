from flask import Flask
from flask_cors import CORS
from config import Config
from models import db
from routes import student_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Enable Cross-Origin Resource Sharing so the React frontend can communicate with this API
    CORS(app)
    
    # Initialize the database with the Flask app
    db.init_app(app)

    # Register the student blueprint for all student-related routes
    app.register_blueprint(student_bp, url_prefix='/api')
    
    # Ensure tables are created automatically (crucial for frictionless local SQLite setup)
    with app.app_context():
        db.create_all()
    
    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5000)