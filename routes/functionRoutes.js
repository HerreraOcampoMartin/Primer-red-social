const router = require("express").Router();
const authorize = require("./verifyRoute");
const Post = require("../models/Post");
const User = require("../models/User");
const uniqid = require("uniqid");
const axios = require("axios");
const {
    validatePost,
    validateDocExtension,
    validateMediaExtension,
} = require("../validation");
const postsPerRequest = 5;
let postsRequests = 0;
const number_of_users = 3;

//ROUTES
router.get("/home", authorize, (req, res) => {
    loadPosts(req, res);
});

router.get("/home/getMorePosts", authorize, (req, res) => {
    loadPosts(req, res);
});

router.post("/home/createPost", authorize, (req, res) => {
    try {
        const {
            error
        } = validatePost(req.body);
        if (error) return res.send(error);

        if (req.files && req.files.mediaFile) {
            if (!validateMediaExtension(req.files.mediaFile))
                return res.send("La extension del archivo no es valido.");
        }
        if (req.files && req.files.documentFile) {
            if (!validateDocExtension(req.files.documentFile))
                return res.send("La extension del documento no es valido.");
        }

        let postContent = {
            user: req.userData.username,
            content: req.body.content,
        };
        if (req.files && req.files.mediaFile) {
            const media = req.files.mediaFile;
            const extension = media.name.split(".").pop();
            const name_id = uniqid("media-");
            const complete_name = `${name_id}.${extension}`;

            media.mv(`files/media/${complete_name}`, (err) => {
                if (err) console.log(err);
            });
            postContent.media = complete_name;
        }
        if (req.files && req.files.documentFile) {
            const doc = req.files.documentFile;
            const extension = doc.name.split(".").pop();
            const name_id = uniqid("doc-");
            const complete_name = `${name_id}.${extension}`;

            doc.mv(`files/docs/${complete_name}`, (err) => {
                if (err) console.log(err);
            });
            postContent.doc = complete_name;
        }

        const newPost = new Post(postContent);

        newPost.save();
        res.send("POST CREATED");
    } catch (ex) {
        res.send("ERROR: " + ex);
    }
});

router.post("/home/likePost/:id", authorize, async (req, res) => {
    const postID = req.params.id;
    const user = req.userData.username;

    await Post.findOne({
        _id: postID,
    },
        (err) => {
            if (err) return res.send(err);

            User.findOne({
                username: user,
            },
                (err, doc) => {
                    if (err) return res.send(err);

                    let pull_or_push = "$push";
                    if (doc.likedPosts.some((like) => like === postID)) {
                        pull_or_push = "$pull";
                    }

                    Post.findOneAndUpdate({
                        _id: postID,
                    }, {
                        [pull_or_push]: {
                            likes: user,
                        },
                    },
                        (err) => {
                            if (err) console.log(err);
                        }
                    );

                    User.findOneAndUpdate({
                        username: user,
                    }, {
                        [pull_or_push]: {
                            likedPosts: postID,
                        },
                    },
                        (err) => {
                            if (err) console.log(err);
                        }
                    );

                    if (pull_or_push === '$push')
                        sendNotification(postID, 'like', req, res);
                    else
                        res.send("REMOVED LIKE");

                }
            );
        }
    );

});

router.post("/home/commentPost/:id", authorize, (req, res) => {
    const postID = req.params.id;
    const comment = req.body.comment;
    const user = req.userData.username;
    const commentID = uniqid("comment-");

    Post.findOneAndUpdate({
        _id: postID,
    }, {
        $push: {
            comments: {
                id: commentID,
                user,
                comment,
            },
        },
    },
        (err) => {
            if (err) console.log(err);
        }
    );

    sendNotification(postID, 'comment', req, res);
});

router.post("/home/deleteComment", authorize, (req, res) => {
    const commentID = req.body.commentID;
    const postID = req.body.postID;

    Post.findByIdAndUpdate({
        _id: postID,
    }, {
        $pull: {
            comments: {
                id: commentID,
            },
        },
    },
        (err) => {
            if (err) console.log(err);
        }
    );

    res.send("DELETED COMMENT");
});

//USERS ROUTES
router.get('/users/search', authorize, (req, res) => {
    const search = req.body.q;
    const skip = req.body.skip;
    const regex = RegExp(`${search}`, 'i');
    User.find({
        username: regex
    }).sort('-username').skip(skip * number_of_users).limit(number_of_users).exec((err, data) => {
        if (err) return res.status('500').send(err);

        return res.send(data);
    });
});

router.get("/users/logout", authorize, (req, res) => {
    res.clearCookie("auth-token");
    res.send("CLEARED SESSION");
});

router.get("/users/searchById", authorize, async (req, res) => {
    const userID = req.body.userToSearch;
    const userData = await User.findById(userID);
    res.send(userData);
});

router.post("/users/follow/:id", authorize, async (req, res) => {
    const userID = req.params.id;
    const newFollower = req.userData.id;

    if (userID == newFollower) return res.status(400).send('USERS CANNOT FOLLOW THEMSELF');

    await User.findOne({
        _id: userID,
    },
        (err) => {
            if (err) return res.send(err);

            User.findOne({
                _id: newFollower,
            },
                (err, doc) => {
                    if (err) return res.send(err);

                    let pull_or_push = "$push";
                    if (doc.following.some((like) => like === userID)) {
                        pull_or_push = "$pull";
                    }

                    User.findOneAndUpdate({
                        _id: userID,
                    }, {
                        [pull_or_push]: {
                            followers: newFollower,
                        },
                    },
                        (err) => {
                            if (err) console.log(err);
                        }
                    );

                    User.findOneAndUpdate({
                        _id: newFollower,
                    }, {
                        [pull_or_push]: {
                            following: userID,
                        },
                    },
                        (err) => {
                            if (err) console.log(err);
                        }
                    );

                    if (pull_or_push === '$push')
                        sendFollowNotification(userID, 'follower', req, res);
                    else
                        res.send("UNFOLLOWING USER");

                }
            );
        }
    );

});

//FUNCTIONS
async function loadPosts(req, res) {
    try {
        const posts = [];
        for await (const p of Post.find().skip(postsRequests * postsPerRequest).limit(postsPerRequest).sort("-date")) {
            posts.push(p);
        }
        res.send(posts);
        postsRequests++;
    } catch (ex) {
        res.send("ERROR: " + ex);
    }
}

async function sendNotification(postID, type, req, res) {
    let owner;

    await Post.findById(postID).exec((err, resp) => {
        if (err) return res.status(500).send(err);
        owner = resp.user;

        axios({
            method: "post",
            url: `http://localhost:${process.env.PORT}/notif/generate/`,
            withCredentials: true,
            headers: {
                'auth-token-axios': req.cookies["auth-token"],
                accept: 'application/json, text/plain, */*',
                'content-type': 'application/json;charset=utf-8',
                'action': type,
                'at': postID,
                'to-user': owner
            }
        })
            .then(response => {
                res.send(response.data);
            })
            .catch(err => res.status(500).send(err));
    });
}

async function sendFollowNotification(ID, type, req, res) {

    axios({
        method: "post",
        url: `http://localhost:${process.env.PORT}/notif/generateFollow/`,
        withCredentials: true,
        headers: {
            'auth-token-axios': req.cookies["auth-token"],
            accept: 'application/json, text/plain, */*',
            'content-type': 'application/json;charset=utf-8',
            'action': type,
            'to-user': ID
        }
    })
        .then(response => {
            res.send(response.data);
        })
        .catch(err => res.status(500).send(err));
}

module.exports = router;