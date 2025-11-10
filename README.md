# 🌍 Travella: AI-Based Trip Planner

## ✈️ About The Project

**Travella-Final** is an AI-based travel planning application designed to make trip planning easier, more efficient, and truly personal. This project leverages artificial intelligence to analyze user preferences and provide tailored recommendations for destinations, accommodations, and activities.

### Key Features

* **Personalized Recommendations:** The AI suggests ideal destinations, hotels, and activities perfectly suited to the traveler’s unique preferences.
* **Automated Itinerary Generation:** The app automatically creates a comprehensive itinerary, intelligently considering factors like travel time, location, and user interests.

Travella-Final aims to enhance the entire travel experience by providing a streamlined, easy-to-use platform for trip planning, ideal for both casual holiday-goers and frequent explorers.

### Built With

This project is built with the following major frameworks, libraries, and services:

* **React**
* **Vite**
* **Tailwind CSS**
* **Google Cloud** (for Maps, Geolocation, and Places APIs)
* **Gemini AI**
* **Firebase**
* **Auth0**

---

## 🚀 Getting Started

Setting up Travella is simple. Follow these instructions to set up the project locally on your machine for development and testing.

### Prerequisites

Before you begin, ensure you have the following installed:

* **Node.js** (v16.0 or above)
* **VS Code** (Code Editor)

### Services & API Keys Setup

To fully integrate the application, you'll need API keys and configuration details from the following services:

1.  **Google Cloud Setup:** For Maps and Places APIs.
2.  **Gemini API Setup:** For AI-based content generation.
3.  **Auth0 Setup:** For user authentication.
4.  **Firebase Setup:** For real-time data storage and other services.

### Installation

The installation process is straightforward:

#### 1. Clone the Repository

Clone the project from GitHub:

```bash
git clone https://github.com/Atharwa23/travella-final.git
```

2. Open the Project
Navigate into the cloned directory and open the project folder in your preferred code editor (e.g., VS Code).

3. Set up the .env file
You must set up your environment variables by creating a file named .env in the root directory of the project. Add the following required keys, replacing the placeholders with your actual keys from the services you set up in the previous step:

```
VITE_GOOGLE_MAP_API_KEY = "your-google-api-key"
VITE_GEMINI_API_KEY = "your-gemini-api-key"
VITE_AUTH0_CLIENT_ID = "your-auth0-client-id"
VITE_DOMAIN_NAME = "your-auth0-domain-name"
VITE_FIREBASE_API_KEY = "your-firebase-api-key"
VITE_FIREBASE_AUTH_DOMAIN = "your-firebase-auth-domain"
VITE_FIREBASE_PROJECT_ID = "your-firebase-project-id"
VITE_FIREBASE_STORAGE_BUCKET = "your-firebase-storage-bucket"
VITE_FIREBASE_MESSAGING_SENDER_ID = "your-firebase-messaging-sender-id"
VITE_FIREBASE_APP_ID = "your-firebase-app-id"
VITE_MEASUREMENT_ID = "your-firebase-measurement-id"
```

4. Install NPM Packages
Install the required dependencies:
```
npm install
```
5. Run the Project
Start the local development server:
```
npm run dev
```
