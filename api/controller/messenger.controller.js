var Messenger = require("../../models/messenger.model");

module.exports.index = async (req, res) => {
  //Dùng để load ra những tin nhắn mà người dùng định chat
  //Dựa vào id của chính user và id người mà user muốn chat

  const id_user1 = req.query.id_user1;
  const id_user2 = req.query.id_user2;

  let messenger = await Messenger.findOne({
    id_user1,
    id_user2,
  });

  // Nếu không tìm thấy, thử tìm với id_user1 và id_user2 đảo ngược
  if (!messenger) {
    messenger = await Messenger.findOne({
      id_user1: id_user2,
      id_user2: id_user1,
    });
  }

  if (messenger) {
    res.json(messenger);
  } else {
    res.json(null);
  }

  //   const messenger = await Messenger.findOne({
  //     id_user1: id_user1,
  //     id_user2: id_user2,
  //   });
  //   console.log(11111111111111111, messenger);
  //   res.json(messenger);
};

module.exports.send = async (req, res) => {
  //Khi mà user bấm gửi tin nhắn thì nó sẽ lấy query sau đó push vào cơ sở dữ liệu

  const data = {
    id_user1: req.query.id_user1,
    id_user2: req.query.id_user2,
    id: req.query.id,
    message: req.query.message,
    name: req.query.name,
    category: req.query.category,
  };

  //Tìm đúng tới cuộc trò chuyện của user xong sau đó push vào

  // try {
  //   let messenger = await Messenger.findOne({
  //     id_user1: data.id_user1,
  //     id_user2: data.id_user2,
  //   });

  //   if (!messenger) {
  //     // Nếu không tìm thấy messenger, tạo mới một tài liệu
  //     messenger = new Messenger({
  //       id_user1: data.id_user1,
  //       id_user2: data.id_user2,
  //       content: [],
  //     });
  //   }

  //   // Thêm dữ liệu mới vào thuộc tính content
  //   messenger.content.push(data);

  //   // Lưu tài liệu vào cơ sở dữ liệu
  //   await messenger.save();
  //   console.log("Message saved");
  // } catch (err) {
  //   console.error(err);
  // }

  const messenger = await Messenger.findOne({
    id_user1: data.id_user1,
    id_user2: data.id_user2,
  });

  messenger?.content?.push(data);

  messenger?.save();

  res.send("Thành Công!");
};
