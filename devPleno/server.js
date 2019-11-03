const app = require("express")();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", socket => {
  console.log("New Connection", socket.id);
  socket.on("msg", msg => {
    console.log(msg);
    socket.broadcast.emit("msgm", msg);
    socket.join("contador");
  });
});
let counter = 0;
setInterval(() => {
  io.to("contador").emit("msgm", counter++);
}, 1000);

http.listen(3000, () => {
  console.log("Listing on port 3000");
});
