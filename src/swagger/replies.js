/**
 * @swagger
 * /posts/:postId/comments/:commentId/replies:
 *   post:
 *     summary: 대댓글 작성
 *     description: 특정 댓글에 대한 대댓글을 작성한다.
 *     tags:
 *       - Replies
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 댓글이 속한 게시글의 고유 식별자
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 대댓글을 작성할 댓글의 고유 식별자
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: 대댓글 내용
 *     responses:
 *       200:
 *         description: 성공적으로 대댓글을 작성한 경우
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     replyId:
 *                       type: integer
 *                       description: 작성된 대댓글의 고유 식별자
 *       404:
 *         description: 댓글이나 게시글이 존재하지 않는 경우
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errorMessage:
 *                   type: string
 *                   example: "댓글을 찾을 수 없습니다."
 *       500:
 *         description: 서버에서 에러가 발생했을 경우
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errorMessage:
 *                   type: string
 *                   example: 서버에서 에러가 발생하였습니다.
 */

/**
 * @swagger
 * /posts/:postId/comments/:commentId/replies:
 *   get:
 *     summary: 대댓글 목록 조회
 *     description: 특정 댓글에 대한 대댓글 목록을 조회한다.
 *     tags:
 *       - Replies
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 댓글이 속한 게시글의 고유 식별자
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 대댓글을 조회할 댓글의 고유 식별자
 *     responses:
 *       200:
 *         description: 성공적으로 대댓글 목록을 조회한 경우
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       replyId:
 *                         type: integer
 *                         description: 대댓글의 고유 식별자
 *                       User:
 *                         type: object
 *                         properties:
 *                           nickname:
 *                             type: string
 *                             description: 대댓글 작성자의 닉네임
 *                           imgUrl:
 *                             type: string
 *                             description: 대댓글 작성자의 프로필 이미지 URL
 *                       Comment:
 *                         type: object
 *                         properties:
 *                           commentId:
 *                             type: integer
 *                             description: 댓글의 고유 식별자
 *                           content:
 *                             type: string
 *                             description: 댓글 내용
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             description: 댓글 작성 일자
 *                       content:
 *                         type: string
 *                         description: 대댓글 내용
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         description: 대댓글 작성 일자
 *       404:
 *         description: 댓글이나 게시글이 존재하지 않는 경우
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errorMessage:
 *                   type: string
 *                   example: "댓글을 찾을 수 없습니다."
 *       500:
 *         description: 서버에서 에러가 발생했을 경우
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errorMessage:
 *                   type: string
 *                   example: 서버에서 에러가 발생하였습니다.
 */

/**
 * @swagger
 * /posts/:postId/comments/:commentId/replies/replyId:
 *   delete:
 *     summary: 대댓글 삭제
 *     description: 특정 댓글의 대댓글을 삭제한다.
 *     tags:
 *       - Replies
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 대댓글이 속한 게시글의 고유 식별자
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 대댓글이 속한 댓글의 고유 식별자
 *       - in: path
 *         name: replyId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 삭제할 대댓글의 고유 식별자
 *     responses:
 *       200:
 *         description: 대댓글이 성공적으로 삭제된 경우
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     replyId:
 *                       type: integer
 *                       description: 삭제된 대댓글의 고유 식별자
 *       404:
 *         description: 대댓글이나 댓글, 게시글이 존재하지 않는 경우
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errorMessage:
 *                   type: string
 *                   example: "대댓글을 찾을 수 없습니다."
 *       500:
 *         description: 서버에서 에러가 발생했을 경우
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errorMessage:
 *                   type: string
 *                   example: 서버에서 에러가 발생하였습니다.
 */
