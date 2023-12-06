import express from "express";
import multer from "multer"
import { prisma } from '../utils/prisma/index.js';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import crypto from "crypto"

import dotenv from "dotenv"

dotenv.config()
// 이미지 String 을 16진수로 바꾸는
const randomImageName = (bytes = 32) => crypto.randomBytes(bytes).toString("hex")

const bucketName = process.env.BUCKET_NAME
const bucketRegion = process.env.BUCKET_REGION
const accessKey = process.env.ACCESS_KEY
const secretAccesskey = process.env.SECRET_ACCESS_KEY

const s3 = new S3Client({
    credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretAccesskey,
    },
    region: bucketRegion
})

const router = express.Router();


const storage = multer.memoryStorage();
const upload = multer({ storage: storage })


router.post("/posts", upload.single("image"), async (req, res, next) => {
    console.log("req.body", req.body);
    console.log("req.files", req.files);


    req.files.buffer
    const params = {
        Bucket: bucketName,
        Key: randomImageName(),
        Body: req.file.buffer,
        ContentType: req.file.mimetype
    }

    const command = new PutObjectCommand(params)
    await s3.send(command)

    const userId = 1;
    const { address, content, imgUrl, likeCount } = req.body;

    try {
        const post = await prisma.posts.create({
            data: {
                address,
                content,
                imgUrl,
                likeCount,
                User: {
                    connect: { userId },  // User와 연결
                },
                Category: { connect: { categoryId: 1 } },
                Location: { connect: { locationId: 1 } },
            }
        });

        return res.status(200).json({ message: "등록완료" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.get("/posts/:postId", async (req, res, next) => {
    const { postId } = req.params
    const post = await prisma.posts.findFirst({
        where: { postId: +postId },
        select: {
            nickname: true,
            address: true,
            imgUrl: true,
            content: true,
            likeCount: true,
            createdAt: true,
            updatedAt: true
        }
    })
    if(!post) {
        return res.status(400).json({ errorMessage: "존재하지 않는 게시글 입니다." })
    }
    return res.status(200).json({ data: post })
})

// router.patch("/posts/:postId", async (req, res, next) => {
//     const { postId } = req.
// })


export default router;