const router = require("express").Router();
const authorize = require("./verifyRoute");
const Chat = require("../models/Chat");
const {
    validateMessage
} = require("../validation");

router.get("/chats/getChats", authorize, (req, res) => {
    res.send("GET CHATS");
})

router.get("/chats/getMessages", authorize, (req, res) => {
    res.send("GET MESSAGES");
});

router.post('/chats/sendMessage', authorize, async (req, res) => {
    const {
        error
    } = validateMessage(req.body);
    if (error) res.status(400).send(error);

    const {
        text,
        from,
        to
    } = req.body;

    let chat = await Chat.findOne({
        user1: from,
        user2: to
    });
    if (!chat) {
        createChat(from, to, res);
        return;
    }

    await Chat.findOneAndUpdate({
        user1: from,
        user2: to
    }, {
        $push: {
            messages: {
                text,
                from,
                date: Date.now
            }
        }
    });

    res.send("SUCCESS");
});

//FUNCTIONS

function createChat(user1, user2, res) {
    const newChat = new Chat({
        user1,
        user2
    });
    newChat.save();
    res.send('CREATED CHAT');
}

module.exports = router;