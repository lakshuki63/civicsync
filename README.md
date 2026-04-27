# CivicSync — Unified Property Transfer Platform 

CivicSync is a comprehensive GovTech platform designed to digitize and unify post-property-purchase ownership transfer processes in India. It eliminates manual, fragmented workflows by integrating Municipal, Electricity, Water, Gas, and Land Records departments into a single digital dashboard.

##  Features

### For Citizens
* **Unified Application**: Apply for ownership transfer across 5 departments simultaneously.
* **DigiLocker Integration**: Fetch Aadhaar, PAN, and Property Cards securely.
* **Aadhaar eKYC**: Instant OTP-based identity verification.
* **Real-time Tracking**: Monitor status at a department-by-department level.
* **Integrated Payments**: Pay all municipal fees in one go via UPI/Cards.

### For Government Officers & Admins
* **Department Queues**: Officers only see applications relevant to their department.
* **Digital Review**: Verify documents and approve/reject with remarks.
* **Audit Logs**: Immutable system-wide logging for fraud prevention.
* **Metrics Dashboard**: Track platform health, revenue, and processing times.

##  Architecture

* **Frontend**: Next.js 14 (App Router), Tailwind CSS, Zustand, Lucide Icons.
* **Backend**: Node.js, Express.js, Prisma ORM.
* **Database**: PostgreSQL.
* **Authentication**: JWT with Role-Based Access Control (Citizen, Officer, Admin).
* **Storage**: Cloudinary (for uploaded documents).

## Quick Start (Docker)

The fastest way to run the entire stack locally is using Docker Compose.

1. Ensure Docker Desktop is running.
2. Clone the repository and navigate to the project root.
3. Run the stack:
   ```bash
   docker compose up --build
   ```
4. Access the applications:
   * **Frontend**: http://localhost:3000
   * **Backend API**: http://localhost:5000/api

*Note: The Docker setup automatically runs database migrations and seeds the database with demo accounts.*

##  Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Citizen | `citizen@example.com` | `Citizen@123` |
| Officer (Tax) | `officer.property_tax@civicsync.gov.in` | `Officer@123` |
| System Admin | `admin@civicsync.gov.in` | `Admin@123` |

##  Manual Setup

If you prefer to run the services individually without Docker:

### Backend Setup
```bash
cd backend
npm install
# Set up your .env file with DATABASE_URL
npx prisma generate
npx prisma migrate dev
node prisma/seed.js
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

##  Testing

### Backend Unit Tests
```bash
cd backend
npm test
```

### Cypress E2E Tests
```bash
cd cypress
npm install
npx cypress open
```


made by -
lakshuki 
