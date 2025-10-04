# Pothole Reporter Web App

A modern web application that empowers citizens to report potholes in their community using AI-powered image classification. Users can capture and upload images of road conditions, which are automatically analyzed to identify potholes, and visualized on an interactive map for efficient road maintenance planning.

## 🚀 Features

- **Real-time Location Tracking**: Automatically detects and pins user location on the map
- **AI-Powered Classification**: Utilizes YOLOv8 machine learning model to classify uploaded images as potholes or other road conditions
- **Interactive Mapping**: Integrated Mapbox GL map with draggable markers and geolocation controls
- **Cloud Storage**: Secure image storage using Firebase Cloud Storage
- **Real-time Database**: Firestore integration for storing and retrieving pothole reports
- **Responsive Design**: Mobile-friendly interface built with Material-UI
- **Progress Tracking**: Visual upload progress indicators

## 🛠 Tech Stack

### Frontend
- **React 18** - Modern JavaScript library for building user interfaces
- **Vite** - Fast build tool and development server
- **Material-UI (MUI)** - React components implementing Google's Material Design
- **Mapbox GL JS** - Interactive maps and location services
- **Firebase SDK** - Frontend integration with Firebase services

### Backend
- **Firebase Cloud Functions** (Python 3.11) - Serverless backend processing
- **YOLOv8** (Ultralytics) - State-of-the-art object detection and classification
- **OpenCV** - Computer vision library for image processing
- **Firebase Firestore** - NoSQL cloud database
- **Firebase Cloud Storage** - Scalable file storage

### Infrastructure
- **Firebase Hosting** - Fast, secure web hosting
- **Firebase Admin SDK** - Server-side Firebase integration

## 🏗 Architecture

The application follows a serverless architecture:

1. **Frontend**: React app handles user interactions, location services, and map visualization
2. **Storage Layer**: Images uploaded to Firebase Cloud Storage
3. **Database**: Metadata stored in Firestore with automatic triggers
4. **Processing**: Cloud Functions triggered on new uploads, running ML classification
5. **Results**: Classification results updated in database and displayed on map

```
┌─────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React     │───▶│ Firebase Storage│───▶│ Cloud Functions │
│   Frontend  │    │  & Firestore    │    │  (Python + YOLO)│
└─────────────┘    └─────────────────┘    └─────────────────┘
       │                       │                       │
       └───────────────────────┼───────────────────────┘
                               ▼
                    ┌─────────────────┐
                    │   Mapbox Map    │
                    │  Visualization  │
                    └─────────────────┘
```

## 📋 Prerequisites

- Node.js (v16 or higher)
- Python 3.11
- Firebase CLI
- Mapbox account and access token

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/DevanshuSawant/pothole-reporter-webapp.git
   cd pothole-reporter-webapp
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init
   ```

4. **Configure Firebase Functions**
   ```bash
   cd functions
   pip install -r requirements.txt
   ```

5. **Environment Setup**
   - Update Firebase config in `src/App.jsx`
   - Add your Mapbox access token in `src/App.jsx`
   - Ensure ML models (`best.pt`, `yolov8n-cls.pt`) are in the `functions/` directory

## 🏃‍♂️ Usage

1. **Development**
   ```bash
   npm run dev
   ```

2. **Build for production**
   ```bash
   npm run build
   ```

3. **Deploy**
   ```bash
   firebase deploy
   ```

4. **Access the application**
   - Open your browser to the deployed URL or `http://localhost:5173` for development

## 📱 How It Works

1. **Report a Pothole**: Click the camera button to upload an image
2. **Location Detection**: App automatically captures GPS coordinates
3. **AI Analysis**: YOLOv8 model classifies the image in real-time
4. **Map Visualization**: Pothole locations appear as colored markers on the map
5. **Data Storage**: All reports stored securely in Firebase

