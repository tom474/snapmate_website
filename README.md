# SnapMate Website  

A **social media platform** that allows users to connect, share content, and build communities. SnapMate enables users to create and interact with posts, join interest-based groups, and manage friendships, all within a secure and engaging environment.

## Tech Stack  

- **Client:** React.js, Tailwind CSS  
- **Server:** Node.js, Express.js  
- **Database:** MongoDB  

## Features  

### User Management  
- Register and log in to an account.  
- Manage personal profiles, including avatars and personal information.  
- Send, accept, and remove friend requests.  

### Social Networking  
- Create, edit, and delete posts (supports text and image uploads).  
- Comment and react to posts with different reaction types (Like, Love, Haha, Angry).  
- View and manage post history, including edited versions.  

### Group Management  
- Create and manage groups (admin approval required).  
- Join or leave groups based on visibility settings (public/private).  
- Group admins can approve/decline join requests and manage members.  

### Notifications & Requests  
- Real-time notifications for friend requests, post interactions, and group activities.  
- Track pending friend and group join requests with status updates.  

### Admin Controls  
- Manage user accounts (suspend/reactivate users).  
- Approve or reject group creation requests.  
- Moderate posts and comments for rule enforcement.  

### Performance & Security  
- Role-based access control (RBAC) for user privileges.  
- Password hashing and authentication using **bcrypt**.  
- Pagination and infinite scrolling for efficient data loading.  

## Quick Start

> Follow these steps to set up the project locally on your machine.

Clone the repository

```bash
git clone https://github.com/tom474/snapmate_website.git
```

Navigate to the project directory

```bash
cd snapmate_website
```

Create `.env` file in `server` and set up environment variables

```
MONGO_URI="your_mongo_uri"
```

### Server Setup

From the project's root directory, navigate to `server`

```bash
cd server
```

Install dependencies

```bash
npm install
```

Start the server
```bash
npm start
```

### Client Setup

From the project's root directory, navigate to `client`

```bash
cd client
```

Install dependencies

```bash
npm install
```

Start the client
```bash
npm start
```
