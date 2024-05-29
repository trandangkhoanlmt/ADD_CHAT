const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http, {
  cors: {
    origin: "http://localhost:3001",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  },
});
const cors = require("cors");
const port = 3000;
const usersAPI = require("./api/router/users.router");
const messengerAPI = require("./api/router/messenger.router");
const mongoose = require("mongoose");
var Messenger = require("./models/messenger.model");
var bodyParser = require("body-parser");

const Users = require("./models/users.model");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Cấu hình CORS
const corsOptions = {
  origin: "http://localhost:3001",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

app.use("/users", usersAPI);
app.use("/messenger", messengerAPI);

// connetion Mongoose
mongoose
  .connect("mongodb://localhost:27017/Chat", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
    // const newUser = new Users({
    //   name: "khoatran",
    //   email: "khoatran",
    //   password: "abc123",
    //   image: "image_url",
    // });

    // newUser
    //   .save()
    //   .then(() => {
    //     console.log("User added");
    //   })
    //   .catch((error) => {
    //     console.error("Error adding user:", error);
    //   });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error.message);
  });

io.on("connection", (socket) => {
  console.log(`Có người vừa kết nối, socketID: ${socket.id}`);

  //Khi user đăng nhập thì server sẽ nhận socket với key: user - value: data
  // socket.on('send_user', (data) => {
  //   console.log(data.name + " vừa đăng nhập vào socket || " + data.user_id)

  //Sau đó gửi ngược lại client
  // socket.broadcast.emit('receive_user', data)
  // })

  //Server nhận key send_message với value data do người dùng gửi lên
  socket.on("send_message", (data) => {
    console.log(data.name + ": " + data.message);

    //Sau đó nó sẽ update lại database bên phía người nhận
    //Vì 1 bên gửi 1 bên nhận nên id_user đôi ngược nhau và category cũng vậy
    const newData = {
      id_user1: data.id_user2,
      id_user2: data.id_user1,
      id: Math.random().toString(),
      message: data.message,
      name: data.name,
      category: "receive",
    };

    const postData = async () => {
      try {
        let messenger = await Messenger.findOne({
          id_user1: newData.id_user1,
          id_user2: newData.id_user2,
        });

        if (!messenger) {
          // Nếu không tìm thấy messenger, tạo mới một tài liệu
          messenger = new Messenger({
            id_user1: newData.id_user1,
            id_user2: newData.id_user2,
            content: [],
          });
        }

        // Thêm dữ liệu mới vào thuộc tính content
        messenger.content.push(newData);

        // Lưu tài liệu vào cơ sở dữ liệu
        await messenger.save();
        console.log("Message saved");
      } catch (err) {
        console.error(err);
      }

      // const messenger = await Messenger.findOne({
      //   id_user1: newData.id_user1,
      //   id_user2: newData.id_user2,
      // });

      // messenger?.content?.push(newData);

      // messenger?.save();
    };

    postData();

    //Xử lý xong server gửi ngược lại client thông qua socket với key receive_message
    socket.broadcast.emit("receive_message", newData);
  });

  //server nhận socket do client gửi lên thì sẽ trả ngược lại client tương tự
  socket.on("keyboard_message_send", (data) => {
    console.log(data.id_user1 + ": " + data.message);

    socket.broadcast.emit("keyboard_message_receive", data);
  });

  // socket.on('user-id', (id) => {
  //     console.log("user-id: " + id + " đã tham gia cuộc trò chuyện");
  // });

  // //Server nhận key sendmessage với data đã truyền
  // socket.on('send_message', (data) => {
  //   console.log(data.userID + ": " + data.message)

  //   //Sau đó server gửi ngược trở lại client với key receive_message và value vẫn là data
  //   socket.broadcast.emit('receive_message', data)

  // })

  // socket.on('send-chat', (data) => {
  //     const { message, room } = data;
  //     console.log(`msg: ${message}, room: ${room}`);

  //     socket.broadcast.emit('chat-messegae', {message: message})
  // });

  // socket.on('disconnect', () =>
  //   console.log(`Disconnected: ${socket.id}`));
});

http.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
