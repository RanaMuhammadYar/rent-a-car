# Vehicle Booking System (Rent-a-Car)

A complete car rental management system built with React, Express, MySQL, and Sequelize.

## Features

- **Authentication**: JWT-based secure login and registration.
- **Dashboard**: Real-time stats (counts, revenue) and recent activity tracking.
- **Customer Management**: Full CRUD for managing customers and their contact details.
- **Vehicle Inventory**: Manage car fleet with status tracking (Available/Booked).
- **Booking System**: Create and manage reservations with automatic total amount calculation.
- **Responsive Design**: Modern UI built with Tailwind CSS and Lucide icons.

## Tech Stack

- **Backend**: Node.js, Express.js, MySQL, Sequelize ORM, JWT, bcryptjs.
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Axios, React Router v6.

## Installation

### 1. Prerequisites
- Node.js (v16+)
- MySQL Server

### 2. Backend Setup
```bash
cd backend
npm install
# Create a MySQL database named 'rentacar'
# Copy .env.example to .env and update DB credentials
cp .env.example .env
npm run start
```

### 3. Frontend Setup
```bash
cd frontend
npm install
# Copy .env.example to .env
cp .env.example .env
npm run dev
```

## Database Schema
The system uses the following tables:
- `users`: Authentication credentials.
- `customers`: Client information.
- `vehicles`: Car fleet details and status.
- `bookings`: Rental transactions linking customers and vehicles.

## Post-Install Admin User
Since registration is admin-only, you can create the first user by making a `POST` request to `/api/auth/register` using Postman or CURL.
