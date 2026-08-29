# Threadly

A modern Reddit-inspired social discussion platform where users can create communities, publish posts, comment, vote, follow users, and discover content.

Threadly is built as a full-stack web application using the MERN stack, with a responsive UI and production deployment.

---

## Live Demo

🌐 **Website:** https://threadly-six-smoky.vercel.app

🔗 **GitHub:** https://github.com/SidaRTH-S/threadly

---

## ✨ Features

### Authentication & Profiles

- User registration and login
- Email verification using OTP
- JWT-based authentication
- Protected routes
- User profiles
- Custom profile bios
- Built-in avatar selection
- Edit profile information
- Follow / unfollow users
- Followers and following lists
- User karma

### Communities

- Browse communities
- Create communities
- Community descriptions
- Join communities
- Leave communities
- Community member counts
- Community-specific posts

### Posts

- Create posts inside communities
- Text posts
- Link posts
- Image posts
- Upvote / downvote posts
- Save posts
- View individual posts
- Author and community information

### Comments

- Comment on posts
- Reply to comments
- Nested comment threads
- Upvote / downvote comments
- Edit comments
- Delete comments and replies
- Comment author profiles

### Search

Search across Threadly for:

- Users
- Communities
- Posts

### Notifications

- User notifications
- Follow-related notifications
- Comment and interaction notifications

### UI & Theme

- Responsive design
- Light mode
- Dark mode
- Mobile-friendly layout
- Custom Threadly blue accent
- Interactive buttons and cards
- Responsive navigation
- Custom avatars

---

## Tech Stack

### Frontend

- React
- React Router
- Vite
- CSS
- JavaScript

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- Nodemailer

### Deployment

- Vercel
- MongoDB Atlas

---

##  Project Structure

```text
threadly/
│
├── client/
│   ├── public/
│   │   └── avatars/
│   │       ├── AvatarTechy.png
│   │       ├── Avatar_Cool.png
│   │       ├── Avatar_Nerd.png
│   │       └── ...
│   │
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── app.js
│   │
│   ├── package.json
│   └── .env
│
└── README.md