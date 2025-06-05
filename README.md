# Food Donation App – Frontend

This is the frontend of the Food Donation App, a platform that connects donors and NGOs to reduce food waste and distribute surplus food efficiently. The frontend is built with React, TypeScript, and Vite, and communicates with a Spring Boot backend via secure REST APIs.

---

## Getting Started

These instructions will get you a copy of the frontend project up and running on your local machine for development and testing purposes.

### Prerequisites

Ensure you have the following installed:

- Node.js (v18 or higher)
- npm or yarn
- Git

### Installing

Clone the repository:

```
git clone https://github.com/your-username/food-donation-frontend.git
cd food-donation-frontend
```
## Install Dependencies
```
npm install
# or
yarn install
```
Create a .env file in the root directory and set your backend API URL:

```
env
VITE_API_URL=http://localhost:8080/api
```

Start the development server:
```
npm run dev
# or
yarn dev
```

The application will be accessible at:
```
http://localhost:5173
```
### Environment Variables
Create a .env file in your root folder and configure it like below:

```
VITE_API_URL=http://localhost:8080/api
```

Make sure the backend server is running at the above URL for proper communication.

### Authentication
The frontend handles login and registration via JWT-based authentication.

JWT tokens are stored in localStorage and attached to requests as Bearer tokens.

Protected routes are handled using route guards or wrapper components.

### Build for Production
To create a production-ready build of the app:

```
npm run build
# or
yarn build
```

This will generate a dist/ folder which can be deployed to any static site hosting service like Netlify, Vercel, or GitHub Pages.

### Built With
* React
* TypeScript
* Vite
* Axios
* React Router
* Tailwind CSS

### Authors
Niranjana Chittisani

### License
This project is licensed under the MIT License - see the LICENSE.md file for details.

### Acknowledgments
* Open-source community for the React ecosystem
* Real-world inspiration from community food banks and donation programs
