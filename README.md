## Really sorry for being working still on that. I initially started by Prisma by learning it and that challenge taking caused me problems. I am fluent in Mongoose and have a lot of projects see my portfolio. Now I am converting the whole project to mongoose just to finish. I will learn Prisma and PostgreSQL withing 1week. I know SQL queries. Please consider my situation.
🏦 Postman Documentation
------------------------

**[Download Postman Collection](https://github.com/Hr-Sajib/Gym-Management-Server/blob/main/Postman_Collection_Gym-Management..json)** --- Use this to test all API endpoints. Import into Postman to get started quickly.

* * * * *

🏋️‍♂️ Project Overview
-----------------------

The Gym Management System is a backend application that supports gym operations including trainee management, class scheduling, and trainer assignments. It provides secure authentication and role-based access, enabling efficient management of trainees, classes, and trainers.

📊 Entity-Relationship Diagram
------------------------------

The ER diagram illustrates the relationships between key entities in the system. It is located in the root directory of the project.

🖼️ Image: `ER Diagram.jpg`

* * * * *

🚀 Live Hosting Link
--------------------

The backend API is live and accessible here:\
🔗 [gym-management-system-tawny-phi.vercel.app](https://gym-management-system-tawny-phi.vercel.app/)

⚙️ Admin Credentials
--------------------

To access admin-level functionality, use the following credentials:

-   Email: <admin@gym.com>

-   Password: admin@gym

📊 Relation Diagram

The system includes three main entities:

-   Trainee

-   Trainer

-   Class

Each Trainee can enroll in multiple Classes, and each Trainer can be assigned to multiple Classes.

### [View Relation Diagram Click Here](https://github.com/Hr-Sajib/Gym-Management-Server/blob/main/ER%20Diagram.jpg)

* * * * *

⚙️ Technology Stack
-------------------

-   Backend Language: TypeScript

-   Framework: Express.js

-   ODM: Mongoose

-   Database: MongoDB

-   Authentication: JWT (Access Token, Refresh Token)

-   Deployment: Vercel

* * * * *

🌐 API Endpoints
----------------

### 🔐 Authentication (All Role)

-   POST /auth/login -- Login for trainees

-   POST /auth/refresh-token -- Get new access token

### 👥 Trainee

-   POST /trainee/register -- Register a new trainee

-   GET /trainee/ -- Get all trainees

-   GET /trainee/:id -- Get trainee by ID

-   PATCH /trainee/:id -- Update trainee by ID

-   DELETE /trainee/:id -- Delete trainee by ID

-   POST /trainee/enroll-in-class/:classId -- Enroll in a class

-   POST /trainee/cancel-enroll/:classId -- Cancel class enrollment

### 🧑‍🏫 Trainer

-   POST /trainer/register -- Register a trainer

-   GET /trainer/ -- Get all trainers

-   GET /trainer/:id -- Get trainer by ID

-   PATCH /trainer/:id -- Update trainer

-   DELETE /trainer/:id -- Delete trainer

-   PATCH /trainer/:trainerId/assign-class -- Assign trainer to class

### 🏫 Class

-   POST /class/register -- Create a class

-   GET /class/ -- Get all classes

-   GET /class/:id -- Get class by ID

-   PATCH /class/:id -- Update class

-   DELETE /class/:id -- Delete class

* * * * *

🧪 Instructions to Run Locally
------------------------------

### 1\. Clone the Repository

git clone <https://github.com/hr-sajib/gym-management-system.git>\
cd gym-management-system

### 2\. Install Dependencies

npm install

### 3\. Setup Environment Variables

Create a .env file and add the following:

DATABASE_URL=mongodb+srv://Fine-Med:<tQDXgQE63rqsumSz@cluster-sajib.cqfdgne.mongodb.net>/Gym-Man?retryWrites=true&w=majority&appName=Cluster-Sajib

### 4\. Start the Server

npm i

npm run start:dev