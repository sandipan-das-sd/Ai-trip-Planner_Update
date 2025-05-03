<h1 align="center"><strong>🌍 Full-Stack AI Trip Planner Web App</strong></h1>

<p align="center">
  <a href="#technologies">Technologies</a> |
  <a href="#features">Features</a> |
  <a href="#layout">Layout</a> |
  <a href="#prerequisites">Prerequisites</a>
</p>

<p align="center">
A full-stack web application that helps users plan their trips by providing AI-powered recommendations for travel itineraries, places to visit, and hotels. This app integrates Google Generative AI for dynamic travel planning, Firebase for data storage, and Google Places API for fetching detailed information about places and hotels.
</p>

<h3 align="center">
  <a href="https://ai-trip-planner-five-zeta.vercel.app/" target="_blank">🚀 Visit Live Project</a>
</h3>

---

## 💻 Technologies

### 🔹 Frontend:
- **React** – For building dynamic UI and handling client logic.
- **TailwindCSS** – For modern, utility-first styling and responsive design.
- **Axios** – For HTTP requests to APIs.

### 🔹 Backend & Services:
- **Google Generative AI API** – For generating intelligent travel plans.
- **Google Places API** – For detailed data about locations and hotels.
- **Firebase Firestore** – For cloud-based real-time database.
- **Firebase Authentication** – For secure login via Google OAuth.

---

## 🚀 Features

- 🧠 **AI-Powered Travel Plans** – Smart itineraries & hotel suggestions via Generative AI.
- 🏨 **Place & Hotel Info** – Retrieve images, reviews, and descriptions using Google Places API.
- 🔐 **User Authentication** – Secure Google OAuth sign-in with Firebase.
- 📱 **Responsive UI** – Interactive and mobile-friendly interface with TailwindCSS.
- 💾 **Persistent Storage** – Store all user trips using Firebase Firestore.
- 📆 **Daily Travel Itineraries** – Include attractions, timing, and pricing in each day’s plan.

---

## 🎨 Layout

### Home Page
![Home](https://github.com/barika001/ai-trip-planner/blob/main/public/asset/1.1.png)

### Google OAuth Sign-in
![Google Sign-In](https://github.com/barika001/ai-trip-planner/blob/main/public/asset/2.png)

### Create Trip Page
![Create Trip](https://github.com/barika001/ai-trip-planner/blob/main/public/asset/4.4.png)

### AI-Generated Trip View
![Trip View](https://github.com/barika001/ai-trip-planner/blob/main/public/asset/7.png)

### My Trips Page
![My Trips](https://github.com/barika001/ai-trip-planner/blob/main/public/asset/6.png)

### Mobile Responsive View
<img src="https://github.com/barika001/ai-trip-planner/blob/main/public/asset/8.jpg" width="30%" />

---

## 🗁 Prerequisites

To run this app locally, you’ll need:

- **Node.js** and **npm** (or yarn)
- A **Firebase Project**
  - Enable **Firestore** and **Authentication**
  - Copy your Firebase config
- **Google API Keys**
  - Google **Generative AI API** key
  - Google **Places API** key

---

## 📦 Getting Started

```bash
# Clone the repo
git clone https://github.com/your-username/ai-trip-planner.git
cd ai-trip-planner

# Install dependencies
npm install
# or
yarn install

# Run development server
npm run dev
Create a .env.local file and add:

env
Copy
Edit
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

NEXT_PUBLIC_GOOGLE_API_KEY=your_google_places_key
NEXT_PUBLIC_GENERATIVE_AI_API_KEY=your_generative_ai_key


 👨‍💻 Author
Sandipan Das
Full Stack Developer | TravelTech Enthusiast
🌐 LinkedIn
🐙 GitHub

📄 License
This project is licensed under the MIT License.

🌟 Show Your Support
If you liked this project, feel free to ⭐ the repo and share it with others!
Feedback and contributions are welcome.



Let me know if you’d like:
- A version with a `.gif` demo or video preview
- README in HTML or other formats
- A contributor section for team projects

Happy deploying! 🚀
