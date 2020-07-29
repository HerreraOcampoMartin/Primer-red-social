const router = require("express").Router();
const User = require("../models/User");
const authorize = require("./verifyRoute");

//POST ROUTES
router.post("/notif/generate", authorize, async (req, res) => {
    const from = req.userData.id;
    const toUser = req.headers['to-user'];
    const action = req.headers['action'];
    const at = req.headers['at'];
    const date = Date.now();

    const notif = {
        from, action, at, date
    };

    User.findByIdAndUpdate(toUser, {
        $push: {
            notifications: notif
        }
    }, (err) => {
        if (err) return res.status(500).send(err);
    });

    res.send("SENT NOTIFICATION");

});

router.post("/notif/generateFollow", authorize, async (req, res) => {
    const from = req.userData.id;
    const toUser = req.headers['to-user'];
    const action = req.headers['action'];
    const date = Date.now();

    const notif = {
        from, action, date
    };

    User.findByIdAndUpdate(toUser, {
        $push: {
            notifications: notif
        }
    }, (err) => {
        if (err) return res.status(500).send(err);
    });

    res.send("SENT NOTIFICATION");

});

router.delete("/notif/clear/", authorize, (req, res) => {

    User.findByIdAndUpdate(req.userData.id, {
        $set: {
            notifications: []
        }
    }, (err) => {
        if (err) return res.send("CANNOT CLEAR NOTIFICATIONS");
    });

    res.send("CLEARED NOTIFICATIONS");
});

module.exports = router;
