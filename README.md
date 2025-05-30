## Really sorry for being working still on that. I initially started by Prisma by learning it and that challenge taking caused me problems. I am fluent in Mongoose and have a lot of projects see my portfolio. Now I am converting the whole project to mongoose just to finish. I will learn Prisma and PostgreSQL withing 1week. I know SQL queries. Please consider my situation.

## Gym-Management-Server (not finished yet, working)


##live : https://gym-management-system-cx315tio2-hr-saijbs-projects.vercel.app

### 🔐 Auth

-   `POST /auth/login` -- Login as a trainee

-   `POST /auth/refresh-token` -- Get a new access token

* * * * *

### 🧍 Trainee

-   `POST /trainee/register` -- Register a new trainee

-   `GET /trainee/` -- Get all trainees (**admin only**)

-   `GET /trainee/:id` -- Get a trainee by ID (**admin only**)

-   `PATCH /trainee/` -- Update logged-in trainee info (**trainee only**)

-   `DELETE /trainee/:id` -- Delete a trainee (**trainee only**)

* * * * *

### 🏋️ Trainer

-   `POST /trainer/register` -- Register a new trainer

-   `GET /trainer/` -- Get all trainers (**admin only**)

-   `GET /trainer/:id` -- Get a trainer by ID (**admin or trainer**)

-   `PATCH /trainer/:id` -- Update a trainer (**admin only**)

-   `DELETE /trainer/:id` -- Delete a trainer (**admin only**)

-   `PATCH /trainer/:trainerId/assign-class` -- Assign a class to trainer (**admin only**)

* * * * *

### 📆 Class

-   `POST /class/register` -- Create a new class (**admin only**)

-   `GET /class/` -- Get all classes (**admin only**)

-   `GET /class/:id` -- Get a class by ID (**admin or trainer**)

-   `PATCH /class/:id` -- Update a class (**admin only**)

-   `DELETE /class/:id` -- Delete a class (**admin only**)