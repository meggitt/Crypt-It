# Crypt-It

Crypt-It is a robust Node.js application designed for secure file sharing and management. It empowers users with seamless registration, authentication, and file handling capabilities while prioritizing data security through advanced encryption techniques. Whether you're uploading sensitive documents or collaborating on confidential projects, Crypt-It ensures that your information remains private and protected at every step.


## Table of Contents

- [Features](#features)
- [Requirements](#Requirements)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Security Considerations](#security-considerations)
- [Contributions](#contributions)

## Features

- **User Authentication**: Secure user registration and login with JWT authentication.
- **File Encryption**: Advanced encryption methods to safeguard file contents during storage and transmission.
- **File Management**: Effortlessly upload, download, and manage files within a secure environment.
- **File Sharing**: Share encrypted files securely with other users via email.
- **Password Reset**: OTP-based password reset mechanism for enhanced account security.

## Requirements

- Node.js and npm installed on your machine.
- MongoDB server running locally or remotely.
- An SMTP email service for sending OTPs (e.g., Gmail, SendGrid).

## Installation

1. **Clone the repository:**

```bash
git clone https://github.com/meggitt/Crypt-It.git
cd Crypt-It
```

2. **Install dependencies:**

```bash
npm install
```

## Environment Variables

Create a `.env` file in the root directory of the project with the following content:

```dotenv
# MongoDB connection string
MONGODB_URI=mongodb://username:password@host:port/database

# Port number for the server to run on
PORT=3000

# Secret key for JWT token generation
JWT_SECRET=your_jwt_secret_key

# Encryption key for encrypting/decrypting file contents
ENCRYPTION_KEY=your_encryption_key

# Initialization Vector length for encryption
IV_LENGTH=16

# Email server configuration for sending OTPs
EMAIL_HOST=smtp.your-email-provider.com
EMAIL_PORT=587
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-email-password
```

Replace the placeholder values with your actual configuration details.

## Running the Application

3. **Start the server:**

```bash
npm start
```

The server should now be running on the port specified in the `.env` file.

## API Endpoints

### Authentication

- **POST /register**: Register a new user.
- **POST /login**: Authenticate a user and obtain a JWT.

### User

- **POST /reset-password**: Send OTP for password reset.
- **POST /verify-otp**: Verify OTP and allow user to reset the password.

### File

- **POST /upload**: Upload a new file.
- **GET /files/:id**: Get a file by its ID.
- **POST /share**: Share a file with other users via email.

## Security Considerations

- Ensure the `ENCRYPTION_KEY` and `JWT_SECRET` in your `.env` file are kept secure and not hard-coded in your source code.
- Regularly update your dependencies to avoid known vulnerabilities.
- Implement rate limiting to prevent brute-force attacks.

## Contributions

Contributions are welcome! Please create an issue or submit a pull request with your changes.
