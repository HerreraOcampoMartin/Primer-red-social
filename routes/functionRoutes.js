const router = require("express").Router();
const authorize = require("./verifyRoute");
const Post = require("../models/Post");
const User = require("../models/User");
const uniqid = require("uniqid");
const {
    validatePost,
    validateDocExtension,
    validateMediaExtension,
} = require("../validation");

router.get("/home", authorize, async (req, res) => {
    try {
        const posts = [];
        for await (const p of Post.find().limit(10).sort("date")) {
            posts.push(p);
        }
        res.send(posts);
    } catch (ex) {
        res.send("ERROR: " + ex);
    }
});

router.post("/home/createPost", authorize, (req, res) => {
    try {
        const {
            error
        } = validatePost(req.body);
        if (error) return res.send(error);
        if (req.files.mediaFile) {
            validateMediaExtension(req.files.mediaFile);
            return res.send("La extension del archivo no es valido.");
        }
        if (req.files.documentFile) {
            validateDocExtension(req.files.documentFile);
            return res.send("La extension del documento no es valido.");
        }

        let postContent = {
            user: req.body.user,
            content: req.body.content,
        };
        if (req.files.mediaFile) {
            const media = req.files.mediaFile;
            const extension = media.name.split(".").pop();
            const name_id = uniqid("media-");
            const complete_name = `${name_id}.${extension}`;

            media.mv(`files/media/${complete_name}`, (err) => {
                if (err) console.log(err);
            });
            postContent.media = complete_name;
        }
        if (req.files.documentFile) {
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

router.post("/home/likePost/:id", authorize, (req, res) => {
    const postID = req.params.id;
    const user = req.userData.username;

    Post.findOne({
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
                }
            );
        }
    );

    res.send("FINISHED");
});

router.post("/home/commentPost/:id", authorize, (req, res) => {
    const postID = req.params.id;
    const comment = req.body.comment;
    const user = req.userData.username;
    const commentID = uniqid('comment-');

    Post.findOneAndUpdate({
            _id: postID,
        }, {
            $push: {
                comments: {
                    id: commentID,
                    user,
                    comment
                }
            },
        },
        (err) => {
            if (err) console.log(err);
        }
    );


    res.send("FINISHED");
});

router.post('/home/deleteComment', authorize, (req, res) => {
    const commentID = req.body.commentID;
    const postID = req.body.postID;

    Post.findByIdAndUpdate({
        _id: postID
    }, {
        $pull: {
            comments: {
                id: commentID
            }
        }
    }, (err) => {
        if (err) console.log(err);
    });

    res.send('DELETED COMMENT');
})

router.get("/users/logout", authorize, (req, res) => {
    res.clearCookie("auth-token");
    res.send("CLEARED SESSION");
});

module.exports = router;