/**
 * @swagger
 * paths:
 *  /main/popular:
 *    get:
 *      summary: 인기글을 조회합니다.
 *      description: 자치구별, 좋아요 3개 이상, 작성일 기준 최신순으로 정렬된 인기글을 조회하는 API입니다.
 *      tags:
 *        - Main
 *      parameters:
 *        - name: districtName
 *          in: query
 *          description: 조회할 자치구의 이름
 *          required: false
 *          schema:
 *            type: string
 *        - name: limit
 *          in: query
 *          description: 조회할 게시글의 최대 개수
 *          required: true
 *          schema:
 *            type: integer
 *            minimum: 1
 *            maximum: 100
 *      responses:
 *        '200':
 *          description: 인기글을 성공적으로 조회한 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                    imgUrl:
 *                      type: array
 *                      items:
 *                        type: string
 *                        format: uri
 *                      description: 게시글의 이미지 URL 목록
 *                    content:
 *                      type: string
 *                      description: 게시글의 내용
 *                    PostHashtags:
 *                      type: array
 *                      items:
 *                        type: object
 *                        properties:
 *                          Hashtag:
 *                            type: object
 *                            properties:
 *                              hashtagName:
 *                                type: string
 *                                description: 해시태그 이름
 *                    Location:
 *                      type: object
 *                      properties:
 *                        locationId:
 *                          type: number
 *                          description: 게시글이 연결된 가게의 locationId
 *                        storeName:
 *                          type: string
 *                          description: 게시글이 연결된 가게의 이름
 *                        latitude:
 *                          type: number
 *                          format: double
 *                          description: 게시글이 연결된 가게의 위도
 *                        longitude:
 *                          type: number
 *                          format: double
 *                          description: 게시글이 연결된 가게의 경도
 *                        address:
 *                          type: string
 *                          description: 게시글이 연결된 가게의 주소
 *                        starAvg:
 *                          type: number
 *                          description: 게시글이 연결된 가게의 평균 별점
 *                        postCount:
 *                          type: number
 *                          description: 가게에 달린 게시글의 개수
 *                    Category:
 *                      type: object
 *                      properties:
 *                        categoryName:
 *                          type: string
 *                          description: 게시글이 있는 장소의 카테고리 이름
 *        '400':
 *          description: 조회된 인기글이 없는 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: 해당 인기글이 없어요
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
 *  /main/recent:
 *    get:
 *      summary: 최신글 조회
 *      description: 자치구, 카테고리별 최신글을 조회합니다.
 *      tags:
 *        - Main
 *      parameters:
 *        - name: districtName
 *          in: query
 *          description: 조회할 자치구의 이름
 *          required: false
 *          schema:
 *            type: string
 *        - name: limit
 *          in: query
 *          description: 조회할 글의 최대 개수
 *          required: false
 *          schema:
 *            type: integer
 *            minimum: 1
 *            maximum: 100
 *        - name: categoryName
 *          in: query
 *          description: 조회할 카테고리의 이름
 *          required: false
 *          schema:
 *            type: string
 *      responses:
 *        '200':
 *          description: 최신글을 성공적으로 조회한 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                    postId:
 *                      type: number
 *                      description: 게시글의 ID
 *                    imgUrl:
 *                      type: array
 *                      items:
 *                        type: string
 *                        format: uri
 *                      description: 게시글의 이미지 URL 목록
 *                    content:
 *                      type: string
 *                      description: 게시글의 내용
 *                    createdAt:
 *                      type: string
 *                      format: date-time
 *                      description: 게시글 작성일
 *                    likeCount:
 *                      type: number
 *                      description: 게시글의 좋아요 수
 *                    commentCount:
 *                      type: number
 *                      description: 게시글의 댓글 수
 *                    user:
 *                      type: object
 *                      properties:
 *                        nickname:
 *                          type: string
 *                          description: 게시글 작성자의 닉네임
 *                    PostHashtags:
 *                      type: array
 *                      items:
 *                        type: object
 *                        properties:
 *                          Hashtag:
 *                            type: object
 *                            properties:
 *                              hashtagName:
 *                                type: string
 *                                description: 해시태그 이름
 *        '400':
 *          description: 조회된 최신글이 없는 경우 또는 잘못된 limit 값이 주어진 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: 해당 최신글이 없어요 또는 올바른 limit 값을 입력해주세요
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
 *  /main/comments:
 *    get:
 *      summary: 댓글을 조회합니다.
 *      description: 자치구별로 최신순으로 정렬된 댓글을 조회하는 API입니다.
 *      tags:
 *        - Main
 *      parameters:
 *        - name: districtName
 *          in: query
 *          description: 조회할 자치구의 이름
 *          required: false
 *          schema:
 *            type: string
 *        - name: limit
 *          in: query
 *          description: 조회할 댓글의 최대 개수
 *          required: false
 *          schema:
 *            type: integer
 *            minimum: 1
 *            maximum: 100
 *      responses:
 *        '200':
 *          description: 댓글을 성공적으로 조회한 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                    content:
 *                      type: string
 *                      description: 댓글 내용
 *                    createdAt:
 *                      type: string
 *                      format: date-time
 *                      description: 댓글 생성일시
 *                    PostId:
 *                      type: number
 *                      description: 댓글이 연결된 게시글 postId
 *                    Post:
 *                      type: object
 *                      properties:
 *                        Location:
 *                          type: object
 *                          properties:
 *                            address:
 *                              type: string
 *                              description: 게시글이 연결된 위치의 주소
 *        '400':
 *          description: 조회된 댓글이 없는 경우 또는 잘못된 limit 값이 주어진 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: 해당 댓글이 없어요 또는 limit값을 입력해주세요
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
