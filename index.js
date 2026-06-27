const { createServer } = require("http");
const { Server } = require("socket.io");
const admin = require("firebase-admin");
require("dotenv").config();
const pushVOIP = require("./src/api/v1/push/pushVOIP");

if (
  process.env.PROJECT_ID &&
  process.env.CLIENT_EMAIL &&
  process.env.PRIVATE_KEY
) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        type: process.env.TYPE,
        project_id: process.env.PROJECT_ID,
        private_key_id: process.env.PRIVATE_KEY_ID,
        private_key: process.env.PRIVATE_KEY?.replace(/\\n/g, "\n"),
        client_email: process.env.CLIENT_EMAIL,
        client_id: process.env.CLIENT_ID,
        auth_uri: process.env.AUTH_URI,
        token_uri: process.env.TOKEN_URI,
        auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_CERT_URL,
        client_x509_cert_url: process.env.CLIENT_CERT_URL,
        universe_domain: process.env.UNIVERSE_DOMAIN,
      }),
    });
    console.log("Firebase Admin initialized with local serviceAccountKey.json");
  } catch (err) {
    console.error(
      "Failed to initialize Firebase Admin with serviceAccountKey.json:",
      err,
    );
  }
} else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  // If GOOGLE_APPLICATION_CREDENTIALS is set, admin SDK will use the application default credentials
  try {
    admin.initializeApp();
    console.log(
      "Firebase Admin initialized using GOOGLE_APPLICATION_CREDENTIALS",
    );
  } catch (err) {
    console.error(
      "Failed to initialize Firebase Admin using application default credentials:",
      err,
    );
  }
} else {
  console.warn(
    "Firebase service account not found and GOOGLE_APPLICATION_CREDENTIALS not set. Firebase Admin is NOT initialized. FCM and other admin features will fail until configured.",
  );
}
const cors = require("cors");
const express = require("express");
const User = require("./src/models/User");
require("dotenv").config();

const app = express();
app.use(
  cors({
    origin: [process.env.FRONTEND_URL, process.env.FRONTEND_URL_2],
    credentials: true,
  }),
);
app.use(express.json());
const httpServer = createServer(app);
const port = parseInt(process.env.PORT) || 5000;
const connectDB = require("./src/db/connectDB.js");

const io = new Server(httpServer, {
  cors: {
    origin: [process.env.FRONTEND_URL, process.env.FRONTEND_URL_2],
  },
});

let userSockets = []; // Move outside, so it's shared across all connections

io.on("connection", (socket) => {
  socket.on("register", (userId) => {
    // Remove any previous socket entry for this user
    userSockets = userSockets.filter((user) => user.id !== userId);
    // Add new socket
    userSockets.push({ id: userId, socketId: socket.id });
    // Broadcast updated users (without socketId exposed)
    io.emit(
      "users",
      userSockets.map(({ socketId, ...rest }) => rest),
    );
    // **Send the socket ID back to the WebView**
    socket.emit("registered", { userId, socketId: socket.id });
  });

  // Guest calls registered user
  socket.on(
    "guest-call",
    async ({ from, to, roomName, fcmToken, gestId, gestPhone }) => {
      const target = userSockets.find((entry) => entry.id === to);
      // 1. Notify via Socket (Foreground)
      if (target) {
        io.to(target.socketId).emit("incoming-call", {
          from: {
            name: from,
            gestSocketId: socket.id,
            guest: true,
            socketId: socket.id,
            gestId,
            gestPhone,
          },
          roomName,
        });
      }

      // 2. Notify via FCM (Background / Killed)
      const receiver = await User.findById(to);

      if (!receiver || !receiver.fcmToken) {
        console.log("❌ Push skipped: No FCM token");
        return;
      }

      const dataPayload = {
        type: "incoming_call",
        user_id: String(receiver._id),
        user_name: String(from),
        roomName: String(roomName),
        peerSocketId: String(socket.id),
        sender: String("Caller"),
        uuid: Date.now().toString(),
        avatar: "",
      };

      try {
        const res = await pushVOIP(receiver.fcmToken, dataPayload);
        console.log("✅ VOIP push sent", res);
      } catch (err) {
        console.error("❌ VOIP push failed", err.response?.data || err.message);
      }
    },
  );

  // Registered user accepts the call
  socket.on("call-accepted", ({ roomName, guestSocketId }) => {
    io.to(guestSocketId).emit("call-accepted", {
      roomName,
      peerSocketId: socket.id,
    });
  });

  // Registered user declines call
  socket.on("call-declined", ({ guestSocketId }) => {
    // Send decline event back to the guest
    io.to(guestSocketId).emit("call-declined");
  });

  // When a user ends the call
  socket.on("end-call", ({ targetSocketId }) => {
    io.to(targetSocketId).emit("end-call");
  });

  // When the caller cancels the call
  socket.on("callCanceled", ({ userId }) => {
    const target = userSockets.find((entry) => entry.id === userId);
    if (target) {
      io.to(target.socketId).emit("callCanceled", {
        from: socket.id,
        success: true,
      });
    }
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    const index = userSockets.findIndex(
      (entry) => entry.socketId === socket.id,
    );
    if (index !== -1) userSockets.splice(index, 1);

    io.emit(
      "users",
      userSockets.map(({ socketId, ...rest }) => rest),
    );
  });
});

const userRoutes = require("./src/routes/auth/index.js");
const liveKit = require("./src/routes/liveKit/index.js");
const users = require("./src/routes/users/index.js");
const paygic = require("./src/routes/paygic/index.js");
const adminRoutes = require("./src/routes/admin/index.js");
const pushRoutes = require("./src/routes/push/index.js");
const distributor = require("./src/routes/distributor/index.js");
const gest = require("./src/routes/gest/index.js");
const razorpay = require("./src/routes/razorpay/razorpay.js");

app.use("/v1/api/auth", userRoutes);
app.use("/v1/api/liveKit", liveKit);
app.use("/v1/api/users", users);
app.use("/v1/api/paygic", paygic);
app.use("/v1/api/admin", adminRoutes);
app.use("/v1/api/push", pushRoutes);
app.use("/v1/api/distributor", distributor);
app.use("/v1/api/gest", gest);
app.use("/v1/api/rozarpay", razorpay);

app.get("/", (req, res) => {
  res.send("Welcome to the virtual callbell Call Backend");
});

// Start HTTP server with retry on EADDRINUSE (try next ports)
const startServerWithRetry = (startPort, maxRetries = 5) => {
  let attempts = 0;

  const tryListen = (portToTry) => {
    // Use once() so listeners don't accumulate between retries
    httpServer.once("error", (err) => {
      if (err && err.code === "EADDRINUSE") {
        if (attempts < maxRetries) {
          console.warn(`Port ${portToTry} in use, trying ${portToTry + 1}...`);
          attempts += 1;
          // small delay before retrying to allow OS to settle
          setTimeout(() => tryListen(portToTry + 1), 200);
        } else {
          console.error(
            `Port ${startPort} and next ${maxRetries} ports are in use. Exiting.`,
          );
          process.exit(1);
        }
      } else {
        console.error("Server error:", err);
        process.exit(1);
      }
    });

    httpServer.once("listening", () => {
      const addr = httpServer.address();
      const listeningPort = typeof addr === "object" ? addr.port : addr;
      console.log("listening to port", listeningPort);
    });

    httpServer.listen(portToTry);
  };

  tryListen(startPort);
};

const main = async () => {
  console.log("Called");
  await connectDB();

  // Start server with retries if port is already in use
  startServerWithRetry(port, 10);
};

main();
