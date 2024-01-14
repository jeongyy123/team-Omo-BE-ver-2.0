/**
 * @swagger
 * tags:
 *   name: Following
 *   description: 유저 팔로우 관련 API
 */

/**
 * @swagger
 * paths:
 *  /follows/:userId:
 *    post:
 *      summary: 유저를 팔로우합니다.
 *      description: 로그인한 사용자가 다른 사용자를 팔로우합니다.
 *      tags: [Following]
 *      security:
 *        - BearerAuth: []
 *      parameters:
 *        - name: userId
 *          in: path
 *          description: 팔로우할 사용자의 ID
 *          required: true
 *          schema:
 *            type: integer
 *      responses:
 *        '201':
 *          description: 팔로우 성공
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: 팔로우 성공
 *        '400':
 *          description: |
 *            1. 자기 자신을 팔로우할 수 없는 경우
 *            2. 존재하지 않는 사용자인 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  errorMessage:
 *                    type: string
 *                    example: 자기 자신이거나 존재하지 않는 사용자입니다.
 *        '401':
 *          description: 사용자가 로그인하지 않은 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  errorMessage:
 *                    type: string
 *                    example: 인증되지 않은 사용자입니다.
 *        '500':
 *          description: 서버 에러
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  errorMessage:
 *                    type: string
 *                    example: 서버 에러가 발생했습니다.
 */

/**
 * @swagger
 * paths:
 *  /follows/:userId:
 *    delete:
 *      summary: 유저 팔로우를 취소합니다.
 *      description: 로그인한 사용자가 다른 사용자의 팔로우를 취소합니다.
 *      tags: [Following]
 *      security:
 *        - BearerAuth: []
 *      parameters:
 *        - name: userId
 *          in: path
 *          description: 팔로우를 취소할 사용자의 ID
 *          required: true
 *          schema:
 *            type: integer
 *      responses:
 *        '200':
 *          description: 팔로우 취소 성공
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: 팔로우 취소 성공
 *        '400':
 *          description: |
 *            1. 자기 자신을 팔로우 취소할 수 없는 경우
 *            2. 존재하지 않는 사용자인 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  errorMessage:
 *                    type: string
 *                    example: 자기 자신이거나 존재하지 않는 사용자입니다.
 *        '401':
 *          description: 사용자가 로그인하지 않은 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  errorMessage:
 *                    type: string
 *                    example: 인증되지 않은 사용자입니다.
 *        '500':
 *          description: 서버 에러
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  errorMessage:
 *                    type: string
 *                    example: 서버 에러가 발생했습니다.
 */

/**
 * @swagger
 * paths:
 *  /users/followingList:
 *    get:
 *      summary: 현재 로그인한 사용자가 팔로우한 사람 목록을 가져옵니다.
 *      description: 현재 로그인한 사용자가 팔로우한 사람 목록을 가져옵니다.
 *      tags: [Following]
 *      security:
 *        - BearerAuth: []
 *      responses:
 *        '200':
 *          description: 팔로우 목록 가져오기 성공
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                    userId:
 *                      type: integer
 *                      example: 1
 *                    nickname:
 *                      type: string
 *                      example: john_doe
 *                    imgUrl:
 *                      type: string
 *                      example: https://example.com/profile.jpg
 *        '401':
 *          description: 사용자가 로그인하지 않은 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  errorMessage:
 *                    type: string
 *                    example: 인증되지 않은 사용자입니다.
 *        '404':
 *          description: 팔로우한 사람이 없는 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  errorMessage:
 *                    type: string
 *                    example: 팔로우한 사람이 없습니다.
 *        '500':
 *          description: 서버 에러
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  errorMessage:
 *                    type: string
 *                    example: 서버 에러가 발생했습니다.
 */

/**
 * @swagger
 * paths:
 *  /users/followerList:
 *    get:
 *      summary: 현재 로그인한 사용자를 팔로우한 사람 목록을 가져옵니다.
 *      description: 현재 로그인한 사용자를 팔로우한 사람 목록을 가져옵니다.
 *      tags: [Following]
 *      security:
 *        - BearerAuth: []
 *      responses:
 *        '200':
 *          description: 팔로워 목록 가져오기 성공
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                    userId:
 *                      type: integer
 *                      example: 1
 *                    nickname:
 *                      type: string
 *                      example: john_doe
 *                    imgUrl:
 *                      type: string
 *                      example: https://example.com/profile.jpg
 *        '401':
 *          description: 사용자가 로그인하지 않은 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  errorMessage:
 *                    type: string
 *                    example: 인증되지 않은 사용자입니다.
 *        '404':
 *          description: 나를 팔로우한 사람이 없는 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  errorMessage:
 *                    type: string
 *                    example: 나를 팔로우한 사람이 없습니다.
 *        '500':
 *          description: 서버 에러
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  errorMessage:
 *                    type: string
 *                    example: 서버 에러가 발생했습니다.
 */

/**
 * @swagger
 * paths:
 *  /users/followingList/:userId:
 *    get:
 *      summary: 다른 사용자가 현재 로그인한 사용자를 팔로우한 사람 목록을 가져옵니다.
 *      description: 다른 사용자가 현재 로그인한 사용자를 팔로우한 사람 목록을 가져옵니다.
 *      tags: [Following]
 *      parameters:
 *        - name: userId
 *          in: path
 *          description: 다른 사용자의 ID
 *          required: true
 *          schema:
 *            type: integer
 *      responses:
 *        '200':
 *          description: 팔로우 목록 가져오기 성공
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                    userId:
 *                      type: integer
 *                      example: 1
 *                    nickname:
 *                      type: string
 *                      example: john_doe
 *                    imgUrl:
 *                      type: string
 *                      example: https://example.com/profile.jpg
 *        '404':
 *          description: 다른 사용자가 현재 사용자를 팔로우한 사람이 없는 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  errorMessage:
 *                    type: string
 *                    example: 다른 사용자가 팔로우한 사람이 없습니다.
 *        '500':
 *          description: 서버 에러
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  errorMessage:
 *                    type: string
 *                    example: 서버 에러가 발생했습니다.
 */
/**
 * @swagger
 * /users/followerList/:userId:
 *   get:
 *     summary: 다른 사용자가 나를 팔로우한 사용자 목록을 가져옵니다.
 *     tags: [Following]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: 나를 팔로우한 사용자 목록을 가져올 대상 사용자의 ID
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: 다른 사용자가 나를 팔로우한 사용자 목록을 성공적으로 가져온 경우
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   userId:
 *                     type: integer
 *                     example: 4
 *                   nickname:
 *                     type: string
 *                     example: "BobDoe"
 *                   imgUrl:
 *                     type: string
 *                     example: "https://example.com/profile.jpg"
 *       '404':
 *         description: 다른 사용자가 나를 팔로우하지 않은 경우
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errorMessage:
 *                   type: string
 *                   example: "다른 사용자가 나를 팔로우하지 않았습니다."
 *       '500':
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errorMessage:
 *                   type: string
 *                   example: "서버 오류 발생"
 */
