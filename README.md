# 📊 Finance Dashboard System (Backend API)

A robust backend system for managing financial records, categories, and analytics. Built using Node.js and MySQL, this API supports authentication, role-based access, and detailed financial insights.

---

## 🚀 Live Demo

- 📘 Swagger Docs:  
  https://fds-2elm.onrender.com/api-docs

---

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MySQL (Railway)
- **ORM:** Sequelize
- **Authentication:** JWT (Access & Refresh Tokens)
- **Validation:** Joi
- **Documentation:** Swagger (OpenAPI 3.0)
- **Deployment:** Render

---

## 📁 Project Structure

```
src/
├── config/        # DB & Swagger config
├── controllers/   # Business logic
├── middlewares/   # Auth, validation, rate limiting
├── models/        # Sequelize models
├── routes/        # API routes
├── utils/         # Logger
└── app.js         # Express app setup

server.js          # Entry point
.env.example       # Environment variables template
```

## ⚙️ Setup Instructions

🔹 1. Clone Repository

```bash
git clone <https://github.com/Rishabh2500/FDS>
cd Finance-Dashboard-System

🔹 2. Install Dependencies

npm install

🔹 3. Setup Environment Variables

Create a .env file using .env.example

DB_HOST=
DB_USER=
DB_PASSWORD=
DB_NAME=
DB_PORT=3306

PORT=5000

JWT_SECRET=
ACCESS_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=

DB_SSL=false

🔹 4. Run Locally

npm run dev

Server runs at:  http://localhost:5000

Swagger runs at: http://localhost:5000/api-docs/#/   or  http://localhost:5000/api-docs

Swagger doc on Render at: https://fds-2elm.onrender.com/api-docs/#/

🌍 Deployment

Backend:- Hosted on Render

Database:- Hosted on Railway (MySQL)

Important Notes:
Environment variables configured in Render dashboard
SSL enabled for production DB connection
Free tier may cause cold starts (~30–60 sec delay)

🔐 Authentication & Authorization

JWT-based authentication
Role-Based Access Control (RBAC)
Roles:
- Admin: full access to all operations
- Analyst: can see records such as user listing, record listing, category listing, total income, total expense, net balance, trends(weekly and monthly)
- Viewer: can only see dashboard data i.e., total income, total expense, net balance, trends(weekly and monthly)

🗄️ Database Design
🔹 Core Tables
- Users (Attributes- user_id, name, email, phone_number, country_code, password_hash, role_id, is_active, last_login_at, created_by, deleted_by, is_deleted, timestamps)
- Roles (Attributes- id, role_name, description, timestamps)
- Categories (Attributes- id, category_name, type, timestamps)
- FinancialRecords (Attributes- id, user_id, type, amount, currency, category_id, transaction_date, description, deleted_by, is_deleted, timestamps)
- Tokens (Attributes- id, user_id, access_token, refresh_token, expires_at, timestamps)
- ActivityLogs (Attributes- id, user_id, activity, activity_at, is_active, timestamps)

🔹 Relationships
- A User belongs to a Role
- A User has many Financial Records
- A Category has many Financial Records
- A User has many Tokens
- A User has many Activity Logs
- Self-referencing:
  - created_by → references User (who created the record)
  - deleted_by → references User (who deleted the record)

User ─── belongsTo ─── Role
User ─── hasMany ─── FinancialRecords
Category ─── hasMany ─── FinancialRecords
User ─── hasMany ─── ActivityLogs

📡 API Modules: All endpoints are documented via Swagger with request/response schemas.
👤 Users
- Create user (Admin only)
- Login (JWT authentication - Refresh rotation via middleware)
- Logout
- Update user details (Admin only)
- Delete user (soft deletion) (Admin only)
- User listing (with filters & pagination) (Admin and Analyst only)

📂 Category
- Create category (Admin only)
- Get category list (with filters & pagination) (Admin and Analyst only)

💰 Transactions
- Create financial record (Admin only)
- Update record (Admin only)
- Soft delete record (Admin only)
- List transaction records (with filters & pagination) (Admin and Analyst only)

📊 Dashboard (accessible to all authenticated users- Admin, Analyst and Viewer)
- Total income (with filters & pagination)
- Total expenses (with filters & pagination)
- Net balance (with filters & pagination)
- Financial trends (monthly and weekly)

✨ Key Features
✅ RESTful API design
✅ JWT Authentication (Refresh rotation via auth middleware)
✅ Role-based access control
✅ Input validation using Joi
✅ Pagination & filtering
✅ Rate limiting
✅ Centralized logging
✅ Swagger API documentation
✅ Soft delete support

📌 Assumptions
- Users are assigned predefined roles (Admin, Analyst, Viewer)
- Only Admin can add/modify/delete sensitive data
- Soft delete (is_deleted) is used instead of hard delete
- Database schema is consistent across environments
- Authentication required for protected routes
- Initial roles/users are assumed to be seeded or created manually
- Currency is assumed to be consistent or handled at application level

⚖️ Tradeoffs
🔹 Soft Delete vs Hard Delete
Used soft delete for audit & recovery
Tradeoff: More complex queries

🔹 Free Hosting (Render + Railway)
Cost-effective deployment
Tradeoff: Cold start delays

🔹 Monolithic Architecture
Simple and easy to manage
Tradeoff: Less scalable than microservices

🔹 Basic Security
JWT implemented (Refresh rotation via auth middleware)
Tradeoff: No OAuth / advanced auth

🔹 No Caching Layer
Simpler design
Tradeoff: Slight performance impact

🧠 Future Improvements
Add Redis caching
Add unit & integration tests
Dockerize the application
Add CI/CD pipeline
Introduce microservices architecture
Only authorized users should access API documentation
Centralized swagger and response handling

📞 Contact

Rishabh Sharma

📧 Email: sharmarishabh0025@gmail.com

🔗 LinkedIn: www.linkedin.com/in/rishabh-sharma-134112219
```

## 📜 License

This project is licensed under the MIT License.
