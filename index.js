const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const path = require("path");

// Initialize Express and HTTP server
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*", // Allow all origins
        methods: ["GET", "POST"]
    }
});

// Export io before requiring routes (Prevents circular dependency)
module.exports = { io };

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect("mongodb+srv://vivektilekar17:wO3kdLZm6TFtLnrf@resq.xus2nep.mongodb.net/ResQ", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 10000, // 10s timeout
})
    .then(() => console.log("✅ Database connected"))
    .catch((err) => console.log(err));

// Serve uploaded images
app.use("/uploads/images", express.static(path.join(__dirname, "uploads", "images")));

// Define routes
const authRoutes = require("./routes/auth_route");
const issueRoute = require("./routes/issue_route");

app.use("/api/auth", authRoutes);
app.use("/api/issue", issueRoute);

// Socket.IO connection handling
io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    
    if (userId) {
        socket.join(userId);
        console.log(`✅ User ${userId} connected to socket`);
    }

    // User joins their personal room
    socket.on("joinRoom", (userId) => {
        if (userId) {
            socket.join(userId);
            console.log(`User ${userId} joined room`);
        }
    });

    // Real-time profile updates
    socket.on("profileChange", (userId) => {
        User.findById(userId).select("-password").then((updatedUser) => {
            io.to(userId).emit("profileUpdated", updatedUser);
        });
    });

    // Real-time issue request updates
    socket.on("newRequest", () => {
        io.emit("requestsUpdated"); // Notify all clients
    });

    socket.on("disconnect", () => {
        console.log(`❌ User ${userId} disconnected`);
    });
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});



// const express = require("express");
// const mongoose = require("mongoose");
// const http = require("http");
// const socketIo = require("socket.io");
// const cors = require("cors");
// const path = require("path");

// const app = express();
// const server = http.createServer(app); // Use HTTP server for WebSockets
// const io = socketIo(server, {
//     cors: {
//         origin: "*", // Allow all origins
//         methods: ["GET", "POST"]
//     }
// });

// // Export io before requiring other routes to prevent circular dependency
// module.exports = { io };

// app.use(express.json());
// app.use(cors());

// // MongoDB Connection
// mongoose.connect("mongodb://localhost:27017/ResQ")
//     .then(() => console.log("✅ Database connected"))
//     .catch((err) => console.log(err));

// // Serve uploaded images
// app.use("/uploads/images", express.static(path.join(__dirname, "uploads", "images")));

// // Define routes (Import after io export to prevent circular dependency)
// const authRoutes = require("./routes/auth_route");
// const issueRoute = require("./routes/issue_route");

// app.use("/api/auth", authRoutes);
// app.use("/api/issue", issueRoute);

// // Socket.IO connection handling
// io.on("connection", (socket) => {
//     const userId = socket.handshake.query.userId; // Get userId from client
//     if (userId) {
//         socket.join(userId); // User joins a room with their userId
//         console.log(`✅ User ${userId} connected to socket`);
//     }

//     socket.on("joinRoom", (userId) => {
//         if (userId) {
//             socket.join(userId);
//             console.log(`User ${userId} joined room`);
//         }
//     });

//     socket.on("profileChange", (userId) => {
//         User.findById(userId).select("-password").then((updatedUser) => {
//             io.to(userId).emit("profileUpdated", updatedUser); // Send update
//         });
//     });

//     socket.on("disconnect", () => {
//         console.log(`❌ User ${userId} disconnected`);
//     });
// });

// // Start the server
// const PORT = 3000;
// server.listen(PORT, () => {
//     console.log(`🚀 Server is running on port ${PORT}`);
// });



// const express = require('express');
// const mongoose = require('mongoose');
// const authRoutes = require('./routes/auth_route');
// const issueRoute = require('./routes/issue_route');
// const path = require("path");
// const cors = require('cors');
// const http = require("http"); // Required for WebSockets
// // const { Server } = require("socket.io"); // Import Socket.IO

// const app = express();
// const server = http.createServer(app); // Create HTTP server
// const io = require("socket.io")(server, {
//   cors: {
//       origin: "*",
//       methods: ["GET", "POST"]
//   }
// });

// app.use(express.json());
// app.use(cors());

// const PORT = 3000;

// // MongoDB Connection
// mongoose
//     .connect("mongodb://localhost:27017/ResQ")
//     .then(() => {
//         console.log("Database connected");
//     })
//     .catch((err) => {
//         console.log(err);
//     });

// // Serve Images
// app.use('/uploads/images', express.static(path.join(__dirname, 'uploads', 'images')));

// // Test API
// app.get("/data", (req, res) => {
//     res.send("hello");
// });

// // Use Routes
// app.use("/api/auth", authRoutes);
// app.use("/api/issue", issueRoute);

// // WebSocket Connection (Socket.IO)
// io.on("connection", (socket) => {
//   const userId = socket.handshake.query.userId; // Get userId from client

//   if (userId) {
//       socket.join(userId); // Join a room with userId
//   }

//   console.log(`User ${userId} connected`);

//   socket.on("disconnect", () => {
//       console.log(`User ${userId} disconnected`);
//   });
// });

// // Make io available globally
// app.set("socketio", io);

// // Start Server with Socket.IO
// server.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });



// const express = require('express');
// const mongoose = require('mongoose');
// const authRoutes = require('./routes/auth_route');
// const issueRoute = require('./routes/issue_route');
// const ngrok = require("ngrok");
// const path = require("path")
// const app = express();
// const cors = require('cors');

// app.use(express.json())
// app.use(cors());

// const PORT = 3000;

// mongoose
//   .connect(
//     "mongodb://localhost:27017/ResQ"
//   ).then(() => {
//     console.log("Database connected")
//   }).catch((err) => {
//     console.log(err)
//   })

//   // app.use('/uploads/images', express.static('uploads/images'));
//   app.use('/uploads/images', express.static(path.join(__dirname, 'uploads', 'images')));

// app.get("data" , (req, res) => {
//     res.send("hello")
// })
// app.use("/api/auth" , authRoutes)
// app.use("/api/issue" , issueRoute)

// app.listen(PORT, () => {
//     console.log("Server is running on port 3000");

//     // ngrok.connect(PORT).then(ngrokUrl => {
//     //   console.log(`Ngrok tunnel in: ${ngrokUrl}`);
//     // }).catch(error=> {
//     //   console.log(`errors: ${error.message}`)
//     // })
//   });