/**
 * @swagger
 * paths:
 *  /posts/:locationId/bookmark:
 *    post:
 *      summary: 사용자가 원하는 장소를 북마크를 할 수 있습니다.
 *      description: 로그인에 성공한 사용자는 원하는 장소에 북마크를 할 수 있습니다.
 *      tags:
 *        - Bookmark
 *      responses:
 *        '201':
 *          description: 사용자가 한 장소 북마크를 성공한 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: 북마크
 *        '400':
 *          description: |
 *            1. 장소가 존재하지 않는 경우
 *            2. 사용자가 이미 북마크한 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  errorMessage:
 *                    type: string
 *                    example: 장소가 존재하지 않거나 이미 북마크한 장소입니다.
 *        '500':
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
 * paths:
 *  /posts/:locationId/bookmark:
 *    delete:
 *      summary: 사용자가 원하는 장소의 북마크를 취소할 수 있습니다.
 *      description: 로그인한 사용자는 원하는 장소의 북마크를 취소할 수 있습니다.
 *      tags:
 *        - Bookmark
 *      parameters:
 *        - name: locationId
 *          in: path
 *          description: 북마크를 취소할 장소의 ID
 *          required: true
 *          schema:
 *            type: string
 *      responses:
 *        '200':
 *          description: 사용자가 북마크를 성공적으로 취소한 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: 북마크 취소
 *        '400':
 *          description: |
 *            1. 장소가 존재하지 않는 경우
 *            2. 사용자가 이미 북마크 취소한 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: 장소가 존재하지 않거나 이미 북마크 취소한 장소입니다.
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
