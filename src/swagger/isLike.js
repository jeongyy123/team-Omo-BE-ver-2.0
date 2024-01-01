/**
 * @swagger
 * paths:
 *  /posts/:postId/like:
 *    post:
 *      summary: 게시글에 좋아요를 추가합니다.
 *      description: 로그인한 사용자가 게시글에 좋아요를 추가하는 API입니다.
 *      tags:
 *        - Like
 *      parameters:
 *        - name: postId
 *          in: path
 *          description: 좋아요를 추가할 게시글의 Id
 *          required: true
 *          schema:
 *            type: string
 *      responses:
 *        '201':
 *          description: 게시글에 좋아요를 성공적으로 추가한 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: 좋아요
 *        '400':
 *          description: |
 *            1. 해당 게시글이 존재하지 않는 경우
 *            2. 사용자가 이미 좋아요한 게시글인 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: 해당 게시글이 존재하지 않거나 이미 좋아요한 게시글입니다.
 *        '500':
 *          description: 서버에서 에러가 발생한 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: 서버에서 에러가 발생했습니다.
 */

/**
 * @swagger
 * paths:
 *  /posts/:postId/like:
 *    delete:
 *      summary: 게시글에서 좋아요를 취소합니다.
 *      description: 로그인한 사용자가 게시글에서 좋아요를 취소하는 API입니다.
 *      tags:
 *        - Like
 *      parameters:
 *        - name: postId
 *          in: path
 *          description: 좋아요를 취소할 게시글의 ID
 *          required: true
 *          schema:
 *            type: string
 *      responses:
 *        '200':
 *          description: 게시글에서 좋아요를 성공적으로 취소한 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: 좋아요 취소
 *        '400':
 *          description: |
 *            1. 해당 게시글이 존재하지 않는 경우
 *            2. 사용자가 이미 좋아요를 취소한 게시글인 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: 해당 게시글이 존재하지 않거나 이미 좋아요 취소한 게시글입니다.
 *        '500':
 *          description: 서버에서 에러가 발생한 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: 서버에서 에러가 발생했습니다.
 */

/**
 * @swagger
 * paths:
 *  /users/posts/like:
 *    get:
 *      summary: 로그인한 사용자가 좋아요한 게시글 목록을 조회합니다.
 *      description: 로그인한 사용자가 좋아요한 게시글 목록을 조회하는 API입니다.
 *      tags:
 *        - Like
 *      responses:
 *        '200':
 *          description: 사용자가 좋아요한 게시글 목록을 성공적으로 조회한 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                    likeId:
 *                      type: number
 *                      description: 좋아요 likeId
 *                    PostId:
 *                      type: number
 *                      description: 게시글 postId
 *                    UserId:
 *                      type: number
 *                      description: 사용자 userId
 *                    Post:
 *                      type: object
 *                      properties:
 *                        Location:
 *                          type: object
 *                          properties:
 *                            locationId:
 *                              type: number
 *                              description: 게시글에 연결된 장소의 locationId
 *        '400':
 *          description: 사용자가 좋아요한 게시글이 없는 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: 좋아요한 게시글이 없습니다.
 *        '500':
 *          description: 서버에서 에러가 발생한 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: 서버에서 에러가 발생했습니다.
 */
