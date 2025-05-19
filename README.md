# **Event Management System**

## **Overview**  
The Event Management System is a web-based application that simplifies the process of organizing, managing, and tracking events. Built with MongoDB as the database, it provides robust CRUD operations and participant management features.

---

## **Features**  
- **Event Creation**: Add events with details like name, date, time, venue, and description.  
- **Participant Management**: Add and manage participants for events.  
- **Event Tracking**: Track event status (upcoming, ongoing, or completed).  
- **Search and Filter**: Quickly find events based on date, type, or location.  
- **CRUD Operations**: Manage events and participant records seamlessly.  

---

## **Tech Stack**  
- **Frontend**: HTML, CSS, JavaScript  
- **Backend**: Python/Node.js  
- **Database**: MongoDB  
- **Tools**: MongoDB Compass  

---

## **Database Schema**  

### **Events Collection**  
Stores details about events.  
```json
{
  "_id": "unique_event_id",
  "name": "Event Name",
  "date": "YYYY-MM-DD",
  "time": "HH:MM",
  "venue": "Event Location",
  "description": "Details of the event",
  "participants": ["participant_id1", "participant_id2"],
  "status": "upcoming/ongoing/completed"
}
```

### **Participants Collection**  
Stores participant details linked to events.  
```json
{
  "_id": "unique_participant_id",
  "name": "Participant Name",
  "email": "Participant Email",
  "phone": "Phone Number",
  "event_id": "associated_event_id"
}
```

---

## **Setup Instructions**  

### **Prerequisites**  
1. Install Node.js or Python.  
2. Install MongoDB and MongoDB Compass.  
3. Install required libraries:  
   - For Node.js:  
     ```bash
     npm install mongoose express
     ```
   - For Python:  
     ```bash
     pip install pymongo flask
     ```

### **Steps to Run**  
1. Clone the repository:  
   ```bash
   git clone <repository-url>
   ```  
2. Navigate to the project directory:  
   ```bash
   cd Event-Management-System
   ```  
3. Start the application:  
   - For Node.js:  
     ```bash
     node app.js
     ```
   - For Python:  
     ```bash
     python app.py
     ```  
4. Open your browser and go to:  
   ```
   http://127.0.0.1:5000/
   ```

---

## **Future Enhancements**  
- **Authentication**: Add user roles (e.g., admin, participant).  
- **Notifications**: Email reminders for upcoming events.  
- **Payment Integration**: For event registrations.  
- **Real-Time Updates**: Event updates and status tracking.  

---

## **Contributors**  
- **Sanika Thite**

---

## **License**  
This project is licensed under the MIT License.
