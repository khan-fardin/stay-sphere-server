### 🖥️ Stay Sphere Server - Backend for Room Booking App

This is the backend server for the **Stay Sphere** room booking application. It provides RESTful APIs to handle room data, bookings, user filtering, and other operations.

---

## 🌐 Live Server > 🔗 [Visit Live Server](https://stay-sphere-server-ashen.vercel.app)

---

## 🎯 Purpose

This backend serves the core data and logic for the Stay Sphere front-end:
- Serve room details from database
- Prevent double bookings
- Allow client-side filtering (e.g., by price)
- Return reviews, ratings, and booking metadata

---

## ⚙️ Tech Stack

- **Node.js**
- **Express.js**
- **MongoDB** (via Mongoose)
- **CORS**
- **dotenv**

---

## 🚀 Key Features

- 📦 REST API for fetching all rooms, single room, or filtered data
- 🧠 Server-side logic to prevent overlapping bookings
- 💰 Price filtering (high → low, low → high)
- 📅 Store and retrieve booking information with user details
- 🛡️ Secure with environment variables and optional auth

---

## 📦 NPM Packages Used

| Package         | Purpose                                 |
|-----------------|------------------------------------------|
| `express`       | Web server and routing                   |
| `cors`          | Cross-Origin Resource Sharing            |
| `mongoose`      | MongoDB ODM                              |
| `dotenv`        | Manage sensitive credentials             |
| `nodemon`       | Auto restart dev server                  |

---
