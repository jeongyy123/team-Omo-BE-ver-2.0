/**
 * @swagger
 * /posts/:postId/comments:
 *   post:
 *     summary: 댓글 등록
 *     description: 특정 게시글에 댓글을 등록한다.
 *     tags:
 *      - Comments
 *     security:
 *       - bearerAuth: []  # JWT Bearer Token을 필요로 함
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 댓글을 등록할 게시글의 고유 식별자
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: 등록할 댓글의 내용
 *     responses:
 *       200:
 *         description: 성공적으로 댓글을 등록한 경우
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     UserId:
 *                       type: number
 *                       description: 댓글 작성자의 고유 식별자
 *                     PostId:
 *                       type: number
 *                       description: 댓글이 속한 게시글의 고유 식별자
 *                     content:
 *                       type: string
 *                       description: 댓글 내용
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       description: 댓글 작성 날짜
 *       400:
 *         description: 요청이 잘못된 경우
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errorMessage:
 *                   type: string
 *                   example: "댓글을 등록할 권한이 없습니다."
 *       401:
 *         description: 인증이 실패한 경우
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errorMessage:
 *                   type: string
 *                   example: "Unauthorized"
 *       404:
 *         description: 게시글이 존재하지 않는 경우
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errorMessage:
 *                   type: string
 *                   example: "게시글을 찾을 수 없습니다."
 *       500:
 *          description: 서버에서 에러가 발생했을 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  errorMessage:
 *                    type: string
 *                    example: 서버에서 에러가 발생하였습니다.
 */

/**
 * @swagger
 * /posts/:postId/comments:
 *   get:
 *     summary: 댓글 조회
 *     description: 특정 게시글의 댓글을 조회한다.
 *     tags:
 *      - Comments
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 댓글을 조회할 게시글의 고유 식별자
 *     responses:
 *       200:
 *         description: 성공적으로 댓글을 조회한 경우
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
 *                       User:
 *                         type: object
 *                         properties:
 *                           nickname:
 *                             type: string
 *                             description: 댓글 작성자의 닉네임
 *                           imgUrl:
 *                             type: string
 *                             description: 댓글 작성자의 이미지 URL
 *                       Post:
 *                         type: object
 *                         properties:
 *                           postId:
 *                             type: integer
 *                             description: 게시글의 고유 식별자
 *                       commentId:
 *                         type: integer
 *                         description: 댓글의 고유 식별자
 *                       content:
 *                         type: string
 *                         description: 댓글 내용
 *                       replyCount:
 *                         type: integer
 *                         description: 댓글에 대한 답글 수
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         description: 댓글 작성 날짜
 *       404:
 *         description: 게시글이 존재하지 않는 경우
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errorMessage:
 *                   type: string
 *                   example: "게시글을 찾을 수 없습니다."
 *       500:
 *          description: 서버에서 에러가 발생했을 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  errorMessage:
 *                    type: string
 *                    example: 서버에서 에러가 발생하였습니다.
 */

/**
 * @swagger
 * /posts/:postId/comments/:commentId:
 *   delete:
 *     summary: 댓글 삭제
 *     description: 특정 게시글의 댓글을 삭제한다.
 *     tags:
 *      - Comments
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
 *         description: 삭제할 댓글의 고유 식별자
 *     responses:
 *       200:
 *         description: 성공적으로 댓글을 삭제한 경우
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     commentId:
 *                       type: integer
 *                       description: 삭제된 댓글의 고유 식별자
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
 *          description: 서버에서 에러가 발생했을 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  errorMessage:
 *                    type: string
 *                    example: 서버에서 에러가 발생하였습니다.
 */