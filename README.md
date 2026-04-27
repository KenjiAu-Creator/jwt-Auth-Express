# JWT-Auth-Express Backend
A robust Node.js backend providing user registration and authentication using Express, JWT (JSON Web Tokens), and Bcrypt.
The repository utilizes Baserow to store client data.
## 🚀 Features
- User Registration: Secure password hashing with Bcrypt.
- User Login: Identity verification and JWT generation.
- Protected Routes: Middleware to verify tokens for sensitive endpoints.
- Baserow Integration: Utilizes Baserow as a headless database for easy data management.
## 🛠️ Tech Stack
- Runtime: Node.js
- Framework: Express.js
- Database: Baserow (No-code database platform)
- Authentication: JWT (jsonwebtoken)
- Security: Bcryptjs, Cors, Dotenv
## 🏁 Getting Started
1. Prerequisites
   - Node.js (v18.x or higher recommended)
   - npm or yarn
   - A baserow database
2. Installation<br/>
   Clone the repository and install dependencies
3. Environment Variables<br/>
   Create a .env file in the root directory and add the following:</br>
   ```
   PORT=3030
   BASEROW_API_TOKEN=your_super_secret_baserow_api_key
   AUTH_SECRET=your_super_secret_jwt_key
   AUTH_SECRET_EXPIRES_IN="3600"
   ```
4. Run the App
   Development mode<br/>
   ```npm run dev```
## 🧠 Lessons Learned
- Headless Database Integration: I learned how to treat Baserow as a primary data store, performing CRUD operations via its REST API. This involved handling external API responses and mapping Baserow's row-based structure to my application logic.
- Cryptographic Security with Bcrypt: I implemented password salting and hashing to ensure that even if the Baserow database were compromised, user credentials remain secure. I learned why we compare hashes rather than decrypting passwords.
- Data Sanitization & Validation: I prioritized cleaning and validating incoming request bodies (email and password) to prevent injection attacks and ensure data integrity before it reaches the Baserow API.
- Stateless Authentication: By using JWT (JSON Web Tokens), I learned how to maintain user sessions without storing session data on the server, making the backend more scalable and compatible with serverless environments like Vercel.
