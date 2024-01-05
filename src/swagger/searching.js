/**
 * @swagger
 * paths:
 *  /posts/main/searching:
 *    get:
 *      summary: 유저 또는 가게 이름을 검색합니다.
 *      description: 유저 또는 가게 이름으로 검색하여 결과를 반환하는 API입니다.
 *      tags:
 *        - Searching
 *      parameters:
 *        - name: nickname
 *          in: query
 *          description: 검색하려는 유저의 닉네임
 *          required: false
 *          schema:
 *            type: string
 *        - name: storeName
 *          in: query
 *          description: 검색하려는 가게의 이름
 *          required: false
 *          schema:
 *            type: string
 *      produces:
 *        - application/json
 *      responses:
 *        '200':
 *          description: 검색 결과를 성공적으로 반환한 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                    nickname:
 *                      type: string
 *                      example: 유저 닉네임
 *                    imgUrl:
 *                      type: string
 *                      format: uri
 *                      example: "https://example.com/user-profile.jpg"
 *                    storeName:
 *                      type: string
 *                      example: 가게 이름
 *                    address:
 *                      type: string
 *                      example: 서울시 강남구 가로수길 123
 *                    starAvg:
 *                      type: number
 *                      example: 4.5
 *                    Posts:
 *                      type: array
 *                      items:
 *                        type: object
 *                        properties:
 *                          imgUrl:
 *                            type: string
 *                            format: uri
 *                            example: "https://example.com/post-image.jpg"
 *                          content:
 *                            type: string
 *                            example: 게시물 내용
 *                          likeCount:
 *                            type: number
 *                            example: 10
 *                          commentCount:
 *                            type: number
 *                            example: 5
 *                          createdAt:
 *                            type: string
 *                            format: date-time
 *                            example: 2023-01-01T12:00:00Z
 *        '400':
 *          description: 요청이 잘못된 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: nickname 또는 storeName 둘 중 하나만 입력해주세요.
 *        '500':
 *          description: 서버에서 에러가 발생한 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: 검색에서 에러가 발생했습니다.
 */
