# Car Parking System Backend

This is a Node.js backend API for a smart car parking management system. It provides RESTful endpoints for managing users, vehicles, zones, parking spots, devices (e.g. CCTV), bookings, and payments.

## Features

- **User Management:** Register, update, view, and delete users with roles (admin, staff, user).
- **Vehicle Management:** Link vehicles to users, CRUD operations for vehicles.
- **Zone & Spot Management:** Define parking zones and spots with geometric vertices.
- **Device Management:** Manage devices like CCTV cameras and assign them to zones.
- **Booking System:** Book parking spots, manage bookings.
- **Payment Integration:** Record payments for bookings.
- **Pagination & Search:** Most list endpoints support pagination and search.
- **Secure Passwords:** User passwords are hashed using bcrypt.

## Tech Stack

- **Node.js** with **Express.js**
- **MongoDB** with **Mongoose**
- **dotenv** for environment variables
- **bcryptjs** for password hashing

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- MongoDB (local or cloud)

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/yourusername/car-parking-system-backend.git
   cd car-parking-system-backend
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Create a `.env` file in the root directory and set your environment variables:
   ```
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/car_parking_system
   ```

4. Start the server:
   ```sh
   npm start
   ```
   The server will run on `http://localhost:3000` by default.

## API Endpoints

### Users

- `GET /users` - List users (supports pagination & search)
- `GET /users/:id` - Get user by ID
- `POST /users` - Create user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Vehicles

- `GET /vehicles` - List vehicles
- `GET /vehicles/:id` - Get vehicle by ID
- `POST /vehicles` - Create vehicle
- `PUT /vehicles/:id` - Update vehicle
- `DELETE /vehicles/:id` - Delete vehicle

### Zones

- `GET /zones` - List zones
- `GET /zones/:id` - Get zone by ID
- `POST /zones` - Create zone
- `PUT /zones/:id` - Update zone
- `DELETE /zones/:id` - Delete zone

### Spots

- `GET /spots` - List spots
- `GET /spots/:id` - Get spot by ID
- `POST /spots` - Create spot
- `PUT /spots/:id` - Update spot
- `DELETE /spots/:id` - Delete spot

### Devices

- `GET /devices` - List devices
- `GET /devices/:id` - Get device by ID
- `POST /devices` - Create device
- `PUT /devices/:id` - Update device
- `DELETE /devices/:id` - Delete device

### Payments

- `GET /payments` - List payments
- `GET /payments/:id` - Get payment by ID
- `POST /payments` - Create payment
- `PUT /payments/:id` - Update payment
- `DELETE /payments/:id` - Delete payment

### Bookings

- `GET /bookings` - List bookings
- `GET /bookings/:id` - Get booking by ID
- `POST /bookings` - Create booking
- `PUT /bookings/:id` - Update booking
- `DELETE /bookings/:id` - Delete booking

## Postman Collection

A ready-to-use Postman collection is provided in the repository (`CarParkingSystem.postman_collection.json`).  
Import it into Postman to test all API endpoints.

## Folder Structure

```
car_parking_system_backend/
│
├── models/         # Mongoose models (User, Vehicle, Zone, Spot, Device, Payment, Booking)
├── controllers/    # Route controllers for business logic
├── routes/         # Express route definitions
├── config/         # Database config
├── server.js       # Entry point
├── .env            # Environment variables
└── README.md       # Project documentation
```

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.