# Password Manager

## Features
- User Registration & Login
- Secure Password Storage (Client-side Encryption)
- View Passwords with OTP Verification
- Forgot Password Flow

## Setup

### Backend
1. Navigate to `backend` folder: `cd backend`
2. Install dependencies: `npm install`
3. Create a `.env` file in `backend` with:
   ```
   MONGO_URI=your_mongodb_connection_string
   PORT=5000
   JWT_SECRET=your_jwt_secret
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_app_password
   ```
4. Start server: `npm start`

### Frontend
1. Navigate to root folder: `cd ..`
2. Install dependencies: `npm install`
3. Start frontend: `npm run dev`
