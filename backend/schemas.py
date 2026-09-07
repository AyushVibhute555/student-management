from pydantic import BaseModel, EmailStr, field_validator
from datetime import date
from typing import Literal, Optional

class StudentBaseSchema(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    date_of_birth: date
    enrollment_status: Literal["active", "graduated", "dropped"]

    @field_validator('first_name', 'last_name')
    @classmethod
    def check_not_empty(cls, v: str):
        if not v or not v.strip():
            raise ValueError("Field cannot be empty")
        return v.strip()

    @field_validator('date_of_birth')
    @classmethod
    def check_past_date(cls, v: date):
        if v > date.today():
            raise ValueError("Date of birth cannot be in the future")
        return v

class StudentCreateSchema(StudentBaseSchema):
    pass

class StudentUpdateSchema(BaseModel):
    # All fields are optional for PUT/PATCH updates, but still validated if provided
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    date_of_birth: Optional[date] = None
    enrollment_status: Optional[Literal["active", "graduated", "dropped"]] = None

    @field_validator('first_name', 'last_name')
    @classmethod
    def check_not_empty(cls, v: Optional[str]):
        if v is not None and not v.strip():
            raise ValueError("Field cannot be empty")
        return v.strip() if v else v

    @field_validator('date_of_birth')
    @classmethod
    def check_past_date(cls, v: Optional[date]):
        if v and v > date.today():
            raise ValueError("Date of birth cannot be in the future")
        return v