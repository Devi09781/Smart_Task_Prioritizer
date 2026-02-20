

# Smart Task Prioritizer

A full-stack task management application built with Python that automatically ranks tasks using a structured and configurable scoring algorithm. The system integrates backend services, RESTful APIs, database persistence, and frontend interaction to deliver a complete productivity solution.

---

## Overview

Smart Task Prioritizer is designed to automate task ranking based on urgency, importance, deadline proximity, and estimated duration.

The application demonstrates:

- Backend engineering in Python  
- RESTful API design  
- Database modeling and persistence  
- Frontend–backend integration  
- Scalable and modular system architecture  

---

## Problem Statement

Manual task prioritization is often inconsistent and subjective. Traditional task managers rely heavily on user intuition rather than structured decision models.

This project addresses the problem by:

- Converting qualitative task attributes into quantifiable features  
- Applying a deterministic weighted scoring model  
- Providing real-time priority recalculation  
- Supporting persistent storage and dynamic updates  

---

## System Architecture

### Backend

- Task data models  
- Priority scoring engine  
- Feature computation logic  
- REST API endpoints  
- Input validation and error handling  
- Database integration  

Possible technologies:
- Flask / Django / FastAPI  
- SQLAlchemy / Django ORM  
- SQLite / PostgreSQL  

---

### Frontend

- Task creation and editing interface  
- Dynamic task list rendering  
- Sorted priority display  
- Responsive UI design  
- API communication with backend  

Possible technologies:
- React / HTML / CSS / JavaScript  
- Bootstrap / Tailwind CSS  

---

## Priority Scoring Model


Priority Score =
(w1 × Urgency) +
(w2 × Importance) +
(w3 × Deadline_Proximity) -
(w4 × Estimated_Duration)


Features of the model:

- Configurable weights  
- Deterministic and interpretable logic  
- Real-time recalculation upon updates  
- Extensible for machine learning optimization  

---

## Key Features

- Full CRUD operations (Create, Read, Update, Delete)  
- Automated task ranking  
- RESTful API endpoints  
- Persistent database storage  
- Modular backend architecture  
- Clean separation of concerns  
- Unit-tested scoring logic  

---

## Project Structure


smart-task-prioritizer/
│
├── backend/
│ ├── models/
│ ├── routes/
│ ├── services/
│ ├── scoring/
│ └── app.py
│
├── frontend/
│ ├── components/
│ ├── pages/
│ └── assets/
│
├── tests/
├── requirements.txt
└── README.md


---

## API Endpoints (Example)

| Method | Endpoint     | Description                                   |
|--------|-------------|-----------------------------------------------|
| GET    | /tasks      | Retrieve all tasks sorted by priority        |
| POST   | /tasks      | Create a new task                            |
| PUT    | /tasks/{id} | Update an existing task                      |
| DELETE | /tasks/{id} | Delete a task                                |

---

## Installation

Backend setup:


git clone https://github.com/yourusername/smart-task-prioritizer.git

cd smart-task-prioritizer
pip install -r requirements.txt
python app.py


Frontend setup (if separate):


cd frontend
npm install
npm start


---

## Engineering Highlights

- API-first design approach  
- Modular and maintainable code structure  
- Database-driven application  
- Clean separation between business logic and presentation layer  
- Scalable foundation for future feature expansion  

---

## Future Enhancements

- User authentication and authorization  
- Role-based access control  
- WebSocket-based real-time updates  
- Docker containerization  
- CI/CD integration  
- Cloud deployment (AWS / Azure / GCP)  
- Machine learning-based adaptive prioritization  

---

## Skills Demonstrated

- Full Stack Development  
- Python Backend Engineering  
- REST API Design  
- Database Modeling  
- Frontend Integration  
- Scalable System Design  
- Testing and Debugging  

---

## License

MIT License

