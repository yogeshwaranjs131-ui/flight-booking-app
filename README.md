# Flight Booking App

This is a full-stack MERN (MongoDB, Express, React, Node.js) flight booking application. This app allows users to search for flights, make bookings, and enables administrators to manage flights.

## Features

### User Features
- **User Authentication**: Registration, login, and secure JWT authentication.
- **Password Reset**: Facility to reset password via email.
- **Two-Factor Authentication (2FA)**: Additional security using apps like Google Authenticator.
- **Flight Search**: Search for flights based on departure, arrival, and date.
- **Filters**: Filter search results based on price, time, and stops.
- **Seat Selection**: Select desired seats from the flight's seat map.
- **Booking Process**: Enter passenger details and pay securely via Razorpay.
- **Booking History**: Users can view and cancel all their bookings.
- **Ticket Download**: Download the booked ticket as a PDF.
- **Profile Management**: Users can upload their profile picture and change their password.

### Admin Features
- **Admin Dashboard**: A dashboard showing statistics like total users, flights, bookings, and revenue.
- **Charts**: Charts showing monthly revenue and bookings.
- **Flight Management**: Add, edit, and delete new flights.
- **User Management**: View, edit, and delete all users.
- **Booking Management**: View and cancel all bookings.

### Security Features
- **JWT Authentication**: Secure API endpoints.
- **Password Hashing**: Passwords are securely stored using `bcrypt`.
- **Role-Based Access Control (RBAC)**: Separate routes for users and admins.
- **HTTP Security Headers**: Protection from common vulnerabilities using `helmet`.
- **Rate Limiting**: Use of `express-rate-limit` to prevent brute-force attacks.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Axios, Recharts
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JSON Web Tokens (JWT), bcrypt, Speakeasy (for 2FA)
- **Payment**: Razorpay
- **Email**: Nodemailer
- **PDF Generation**: jsPDF, html2canvas
- **Security**: Helmet, express-rate-limit

## Folder Structure

```
my-Flight/
├── backend/
│   ├── controllers/      # Files that handle API logic
│   ├── middleware/       # Files for authentication, admin, and error handling
│   ├── models/           # MongoDB schema definitions
│   ├── routes/           # Files that define API routes
│   ├── seeder/           # Files to add seed data
│   ├── utils/            # Common utility files (PNR, email, PDF)
│   ├── app.js            # Main Express application file
│   └── server.js         # File to run the server
└── frontend/
    ├── src/
    │   ├── components/   # Reusable React components
    │   ├── hooks/        # Custom React hooks (useAuth, useFetch)
    │   ├── pages/        # Components for each page of the app
    │   ├── services/     # Files that call the Backend API
    │   ├── utils/        # Common utility files (formatDate)
    │   ├── App.jsx       # Main app and routing
    │   └── main.jsx      # File to mount the React app to the DOM
    └── README.md         # Project description file
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB

### Backend Setup

1.  Navigate to the `backend` folder:
    ```bash
    cd backend
    ```
2.  Install the required libraries:
    ```bash
    npm install
    ```
3.  Create a `.env` file and enter your details:
    ```
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    RAZORPAY_KEY_ID=your_razorpay_key_id
    RAZORPAY_KEY_SECRET=your_razorpay_key_secret
    EMAIL_HOST=smtp.gmail.com
    EMAIL_PORT=587
    EMAIL_USERNAME=your-email@gmail.com
    EMAIL_PASSWORD=your-gmail-app-password
    ```
4.  To add seed data to the database:
    ```bash
    npm run seed:airports
    npm run seed:flights
    ```
5.  Run the server:
    ```bash
    npm run dev
    ```

### Frontend Setup

1.  Navigate to the `frontend` folder:
    ```bash
    cd frontend
    ```
2.  Install the required libraries:
    ```bash
    npm install
    ```
3.  Create a `.env` file and enter your backend API URL:
    ```
    VITE_API_URL=http://localhost:5001/api
    ```
4.  Run the application:
    ```bash
    npm run dev
    ```

Now, you can view the application by navigating to `http://localhost:5173` in your browser.

---

This project was created for learning purposes. Your contributions and feedback are welcome!
