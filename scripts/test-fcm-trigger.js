const { io } = require("socket.io-client");

// Connect to your local server
const socket = io("http://localhost:5000");

// Replace this with a REAL FCM token from your frontend/device to test actual delivery
// Or leave as is to test server logic (will verify if code tries to send)
const SAMPLE_FCM_TOKEN = "TEST_TOKEN_FROM_SCRIPT";

const TARGET_USER_ID = "test-user-id";
const CALLER_NAME = "Test Caller";
const ROOM_NAME = "test-room-123";

console.log("Connecting to server...");

socket.on("connect", () => {
    console.log("✅ Connected to server with ID:", socket.id);

    console.log("Emiting 'guest-call' event...");

    // Trigger the event that sends the notification
    socket.emit("guest-call", {
        from: CALLER_NAME,
        to: TARGET_USER_ID,
        roomName: ROOM_NAME,
        fcmToken: SAMPLE_FCM_TOKEN // backend currently expects this from client
    });

    console.log("Event emitted. Check your SERVER console now!");

    // Disconnect after a brief delay
    setTimeout(() => {
        socket.close();
        process.exit(0);
    }, 2000);
});

socket.on("disconnect", () => {
    console.log("Disconnected");
});
