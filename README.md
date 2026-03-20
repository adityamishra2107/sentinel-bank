# 🏦 SentinelBank - AI-Based Secure Digital Banking System

A full-stack, hyper-secure banking platform featuring modern aesthetics, real-time transaction processing, role-based access control, and an integrated rule-based AI Fraud Detection system. Built exactly to enterprise specifications.

![Banking Theme UI](https://images.unsplash.com/photo-1616803140344-6682afb13cda?auto=format&fit=crop&w=1200&q=80)

## 🌟 Core Features

- **Secure Authentication**: JWT & BCrypt password hashing.
- **Role-Based Access**: Specialized views for `USER` and `ADMIN`.
- **KYC & Profile Management**: Complete user profiling with PAN/Aadhaar tracking.
- **Account Management**: Support for Savings & Current accounts.
- **Instant Money Transfers**: Atomic SQL transactions guaranteeing isolation.
- **AI Fraud Detection**: Rule-based detection flagging transactions over ₹1,00,000 or high-frequency transfers.
- **Admin Dashboard**: Comprehensive CRM for approving KYC, reviewing flagged transactions, and managing users.
- **Dark/Light Mode**: Premium, glassmorphism-inspired UI powered by Tailwind CSS.

## 🛠️ Tech Stack

**Frontend:**

- React 18
- Vite
- Tailwind CSS v4 (Modern Styling & Glassmorphism)
- React Router DOM
- Axios

**Backend:**

- Node.js & Express.js
- Prisma ORM
- PostgreSQL (or local Prisma DB)
- JSON Web Tokens (JWT)
- Nodemailer

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- Either a running PostgreSQL database OR the ability to use Prisma's local dev DB.

### 1. Backend Setup

```bash
cd backend
npm install
```

Configure your environment variables. Open `backend/.env` and ensure your database is accessible. If you don't have Postgres running locally, you can use Prisma's local dev database:

```bash
# Terminal 1 - Start the local Prisma database and generate schema
npx prisma dev

# Terminal 2 - Start the backend server
node src/app.js
# Or use nodemon if installed: npx nodemon src/app.js
```

The backend API runs on `http://localhost:5000`.

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The application will launch on `http://localhost:5173`.

## 💼 Demonstration Flow

1. **Register**: Go to `/register` and create an account.
2. **Setup Profile**: Go to Profile and fill in your details (PAN, Aadhaar, DOB, Address).
3. **Admin KYC Approval**:
   - To make testing easier, you can manually change a user's role to `ADMIN` in your database.
   - Login as the Admin user, go to `/admin`.
   - In "User Management", approve the registered user's KYC.
4. **Create Accounts**: The verified user can now open an Account.
5. **Transfer Money**: Create two accounts and test the internal transfer system. Try sending more than `100000` to trigger the **AI Fraud Detection** flag!
6. **Admin Review**: Log back into the Admin account to Review the globally flagged transaction.

## 📄 License

MIT License. Created by Vivek.
