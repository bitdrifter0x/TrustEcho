# TrustEcho 

A high-performance, full-stack Testimonial Management SaaS engine designed to help businesses collect, manage, and seamlessly embed client reviews into their websites. Built with a decoupled monorepo architecture featuring robust security structures and dynamic multi-environment setups.

🔗 **Live Link:** https://trust-echo.vercel.app/ 

---

## 🛠️ Architecture & Tech Stack

- **Frontend:** React (Vite), Tailwind CSS, Single Page Application (SPA) architecture, deployed globally via **Vercel**.
- **Backend:** Node.js, Express.js, RESTful API architecture, deployed via automated pipelines on **Render**.
- **Database:** MongoDB Atlas (Mongoose ODM) with optimized relational structures for performance.
- **Security & Optimization:** JSON Web Tokens (JWT), Cryptographic Cookie-Parser, and Context-Aware Origin Isolation.

---

## ⚡ Key Engineering Highlights & Best Practices

Rather than just a basic CRUD app, this platform implements industry-standard production patterns:

### 1. Advanced Context-Aware CORS Middleware
To optimize SaaS delivery, the backend utilizes a dynamic conditional middleware layer:
* **Public Route Delivery:** Routes fetching embedded widgets (`/api/testimonials/widget/*`) and public submission routes bypass static constraints, serving dynamic content via a global wildcard access pattern (`*`).
* **Dashboard Protection:** Private dashboard actions are rigidly locked down using explicit, dynamically loaded origins (`process.env.CLIENT_URL`) with full credential passing enabled to prevent cross-origin exploits.

### 2. Multi-Layered Rate Limiting & API Protection
Implements individual traffic throttling mechanisms via `express-rate-limit` to defend infrastructure against malicious automated spam:
* **Submission Limiter:** Restricts new testimonial inputs strictly to **5 requests per hour per IP** to eliminate database flooding.
* **Widget Limiter:** Protects rendering logic by throttling widget views to a safe **100 views per minute per IP**.
