import express from "express"

import { prisma } from '../utils/prisma/index.js';



const router = express.Router();




router.post("/posts/:postId/comments", async (req, res, next) => {
    const { postId } = req.params
    const { content, userId } = req.body
    
    const post = await prisma.posts.findFirst({
        where: { Id: +postId }
    })
    const comment = await prisma.comments.create({
        data: {
            UserId: +userId,
            PostId: +postId,
            content: content
        }
    })
    return res.status(200).json({ data: comment })

})

router.get("/posts/:postId/comments", async (req, res, next) => {
    const { postId } = req.params

    const post = await prisma.posts.findFirst({
        where: { Id: +postId }
    })
    const comment = await prisma.comments.findMany({
        where: { PostId: +postId },
        
    })
    return res.status(200).json({ data: comments })
})

router.delete("/posts/:postId/comments/:commentId", async (req, res, next) => {
    const { commnetId } = req.params

    const comment = await prisma.comments.findFirst({
        where: { commnetId: +commentId }
    })

})


export default router;