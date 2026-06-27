const { io } = require("socket.io-client");

// ⚠️ তোমার server এখন 5002 port এ চলছে
const socket = io("http://localhost:5002");

socket.on("connect", () => {
  console.log("✅ Connected to backend");

  socket.emit("guest-call", {
    from: "Guest Tester",
    to: "68a1cfbe0210de1313533675", // যেই userId এ FCM token save করেছো
    roomName: "room_test_001",
  });

  console.log("📞 guest-call emitted");

  setTimeout(() => {
    socket.disconnect();
    process.exit(0);
  }, 2000);
});

socket.on("connect_error", (err) => {
  console.error("❌ Socket connection failed:", err.message);
  process.exit(1);
});
