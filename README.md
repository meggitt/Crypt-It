# Crypt-It
![Crypt-It by Meghana Chevva](images/crypt-it.gif)
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

### Scenarios Handled in Routes

1. **Root Route and Register Route**
   - **GET /**: Renders the registration page (`register.html`).
   - **GET /register**: Renders the registration page (`register.html`).

2. **Upload Route**
   - **GET /upload**: Redirects to the login page if the user is not logged in (`/login`). If logged in, redirects to `/dashboard`.

3. **Handle Registration**
   - **POST /register**: Handles user registration.
     - Validates inputs (first name, last name, email, password).
     - Checks if passwords match (`password !== confirmPassword`).
     - Checks if the email is already registered (`existingUser` check).
     - Generates a random OTP and sends it to the user's email for verification (`transporter.sendMail`).
     - Stores temporary user data in session (`tempUser`).
     - Redirects to `/otp` for OTP verification.

4. **Login Route**
   - **GET /login**: Renders the login page (`login.html`).
   - **POST /login**: Handles user login.
     - Checks if the email exists in the database.
     - Compares the hashed password with the stored password hash using bcrypt.
     - Sets session variables upon successful login (`isLoggedIn`, `user`).
     - Redirects to `/dashboard` on successful login.

5. **OTP Verification Route**
   - **GET /otp**: Renders the OTP verification page (`otp.html`).
     - Redirects to `/register` or `/login` if necessary session data (`OTP`, `tempUser`) is missing.
   - **POST /otp**: Handles OTP verification for registration.
     - Compares the received OTP with the stored OTP in session.
     - Checks if OTP is expired (`otpExpires`).
     - If verified, hashes the password, creates a new User document, and sends a registration confirmation email (`transporter.sendMail`).
     - Redirects to `/login` on successful registration.

6. **Dashboard Route**
   - **GET /dashboard**: Lists user files and shared files.
     - Requires user authentication (`user` session variable).
     - Retrieves user-specific files (`userFiles`) and files shared with the user (`sharedFiles`) from the database using `File` model.

7. **File Retrieval and Decryption Route**
   - **GET /file/:id**: Retrieves and decrypts file content using the provided file ID (`:id`) and decryption key (`key` query parameter).
     - Uses AES-256-CBC encryption algorithm and verifies decryption validity.
     - Responds with decrypted file content or appropriate error messages (`res.status(404).send('File Not Found')`, decryption errors).

8. **API User Information Route**
   - **GET /api/user**: Returns the current user's information (`user` session variable) as JSON if authenticated.
     - Otherwise, responds with `401 Unauthorized`.

9. **Logout Route**
   - **GET /logout**: Logs out the user.
     - Destroys session data (`isLoggedIn`, `user`).
     - Redirects to `/login`.

### Error and Success Cases

- **Registration**
  - **Success**: User successfully registered. Redirects to `/login`.
  - **Fail - Passwords do not match**: Returns status `400` with message `'Passwords do not match'`.
  - **Fail - Email already registered**: Redirects to `/login?alreadyRegistered=true`.
  - **Fail - Email OTP send error**: Returns status `500` with message `'Error sending OTP'`.

- **Login**
  - **Success**: User successfully logged in. Redirects to `/dashboard`.
  - **Fail - Incorrect password**: Redirects to `/login?loginFailed=true`.
  - **Fail - User not found**: Redirects to `/login?loginFailed=true`.
  - **Fail - Database error**: Redirects to `/login?loginError=true`.

- **OTP Verification**
  - **Success**: OTP successfully verified. Proceeds with registration.
  - **Fail - OTP expired**: Redirects to `/otp?registrationFailedOtp=true`.
  - **Fail - Incorrect OTP**: Redirects to `/otp?registrationFailedOtp=true`.

- **File Handling**
  - **Success**: File successfully uploaded, retrieved, and decrypted.
  - **Fail - File Not Found**: Returns status `404` with message `'File Not Found'`.
  - **Fail - Decryption Error**: Returns status `400` with message `'Decryption failed: Invalid key'`.

- **Session Management**
  - **Logout**: Session data (`isLoggedIn`, `user`) successfully destroyed.

## Contributions

Contributions are welcome! Please create an issue or submit a pull request with your changes.
