const router = require("express").Router();
const authorize = require("./verifyRoute");
const Chat = require("../models/Chat");
const {
    validateMessage
} = require("../validation");

router.get("/chats/getChats", authorize, async (req, res) => {
    const id = req.userData.id;
    let chatList1 = await Chat.find({
        user1: id
    });
    let chatList2 = await Chat.find({
        user2: id
    });


    let user1 = [];
    if (chatList1.length > 0) chatList1.forEach((chat) => {
        user1.push(chat.user2);
    });
    let user2 = [];
    if (chatList2.length > 0) chatList2.forEach((chat) => {
        user2.push(chat.user1);
    });

    const usersWithChat = user1.concat(user2);

    res.send(usersWithChat);
})

router.get('/chats/getMessages', authorize, async (req, res) => {
    const id = req.userData.id;
    const contact = req.body.contact;
    if (!contact || contact.length <= 6) return res.status(400).send("Send a valid user ID");

    const messages1 = await Chat.findOne({
        user1: id,
        user2: contact
    });
    const messages2 = await Chat.findOne({
        user2: id,
        user1: contact
    });

    if (messages1) return res.send(messages1);
    return res.send(messages2);
});

router.post('/chats/sendMessage', authorize, async (req, res) => {
    const {
        error
    } = validateMessage(req.body);
    if (error) res.status(400).send(error);

    const {
        text,
        to
    } = req.body;
    const from = req.userData.id;

    await Chat.findOneAndUpdate({
        user1: from,
        user2: to
    }, {
        $push: {
            messages: {
                text,
                from,
                date: Date.now()
            }
        }
    });

    await Chat.findOneAndUpdate({
        user1: to,
        user2: from
    }, {
        $push: {
            messages: {
                text,
                from,
                date: Date.now()
            }
        }
    });

    res.send("SUCCESS");
});

router.post("/chats/createChat", authorize, async (req, res) => {
    const user1 = req.userData.id;
    const user2 = req.body.to;
    if (user2.length <= 6) return res.status(400).send("Send a valid user ID");

    const chat1 = await Chat.find({
        user1,
        user2
    });

    const chat2 = await Chat.find({
        user1,
        user2
    });

    if (chat1.length !== 0 || chat2.length !== 0) return res.status(400).send("THE CHAT ALREADY EXISTS");

    const newChat = new Chat({
        user1,
        user2
    });
    await newChat.save();

    res.send("CHAT CREATED");
});

module.exports = router;