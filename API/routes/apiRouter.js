const express = require("express");
const authRouter = require("./authRouter");
const userRouter = require("./userRouter");
const postRouter = require("./postRouter");
const categoryRouter = require("./categoryRouter");
const commentRouter = require("./commentRouter");
const bookmarkRouter = require("./bookmarkRouter");
const blocklistRouter = require("./blocklistRouter");

const router = express.Router();

router.use('/auth', authRouter);

router.use('/users', userRouter);
router.use('/posts', postRouter);
router.use('/categories', categoryRouter);
router.use('/comments', commentRouter);
router.use('/bookmarks', bookmarkRouter);
router.use('/blocks', blocklistRouter);

module.exports = router;