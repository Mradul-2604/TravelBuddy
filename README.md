# TravelBuddy - Ride Sharing Application

TravelBuddy is a ride-sharing application that connects drivers with passengers for shared travel experiences. The application allows users to offer rides, find rides, manage ride requests, and view statistics about their rides.

## Features

- **User Authentication**: Secure login and registration system
- **Ride Management**: Create, view, and manage rides
- **Request Handling**: Accept or reject ride requests
- **Notifications**: Real-time notifications for ride requests and updates
- **Statistics**: View ride statistics including total rides, active rides, upcoming rides, completed rides, and cancelled rides
- **Profile Management**: Update user profile information

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- MongoDB (running locally or a cloud instance)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/TravelBuddy-Project.git
   cd TravelBuddy-Project
   ```

2. Install dependencies for the frontend:
   ```
   npm install
   ```

3. Install dependencies for the backend:
   ```
   cd backend
   npm install
   ```

### Running the Application

1. Start the frontend application:
   ```
   # From the TravelBuddy-Project directory
   npm start
   ```

2. Start the backend server:
   ```
   # Open a new terminal
   cd backend
   npm start
   ```

3. Open your browser and navigate to `http://localhost:3000`

## User Journey

1. **Registration and Login**: Users can register with their email, name, and password, or log in if they already have an account.

2. **Dashboard**: After logging in, users are directed to the dashboard where they can access various features:
   - My Rides: View and manage rides offered by the user
   - Requests: Handle incoming and sent ride requests
   - Profile: Update personal information
   - Notifications: View system notifications
   - Statistics: View ride statistics

3. **Offering a Ride**: Users can offer rides by providing details such as departure location, destination, date, time, available seats, and price.

4. **Finding a Ride**: Users can search for available rides based on their travel requirements.

5. **Managing Requests**: Users can accept or reject ride requests, and track the status of their sent requests.

6. **Viewing Statistics**: Users can view statistics about their rides, including total rides, active rides, upcoming rides, completed rides, and cancelled rides.

## Salient Features

- **Real-time Notifications**: Users receive instant notifications for ride requests and updates.
- **Interactive Dashboard**: A user-friendly dashboard for easy navigation and management of rides and requests.
- **Responsive Design**: The application is designed to work seamlessly on various devices, including desktops, tablets, and smartphones.
- **Secure Authentication**: Secure user authentication to protect user data and ensure privacy.
- **Comprehensive Statistics**: Detailed statistics to help users track their ride-sharing activities.

## Technologies Used

- **Frontend**: React.js, Chart.js, Axios
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)

