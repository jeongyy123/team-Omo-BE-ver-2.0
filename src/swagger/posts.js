/**
 * @swagger
 * paths:
 *  /posts:
 *    get:
 *      summary: 게시물 목록을 조회합니다.
 *      description: 페이지네이션을 사용하여 게시물 목록을 조회하는 API입니다. 카테고리별, 자치구별로 필터링할 수 있습니다.
 *      tags:
 *        - Posts
 *      parameters:
 *        - name: page
 *          in: query
 *          description: 조회할 페이지 개수
 *          required: false
 *          schema:
 *            type: integer
 *            minimum: 1
 *            default: 1
 *        - name: lastSeenPage
 *          in: query
 *          description: 이전 조회했던 페이지의 마지막 게시물 ID
 *          required: false
 *          schema:
 *            type: integer
 *            minimum: 1
 *        - name: categoryName
 *          in: query
 *          description: 조회할 카테고리의 이름
 *          required: false
 *          schema:
 *            type: string
 *        - name: districtName
 *          in: query
 *          description: 조회할 자치구의 이름
 *          required: false
 *          schema:
 *            type: string
 *      responses:
 *        '200':
 *          description: 게시물 목록을 성공적으로 조회한 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                    User:
 *                      type: object
 *                      properties:
 *                        nickname:
 *                          type: string
 *                          description: 게시물 작성자의 닉네임
 *                    Category:
 *                      type: object
 *                      properties:
 *                        categoryName:
 *                          type: string
 *                          description: 게시물의 카테고리 이름
 *                    Location:
 *                      type: object
 *                      properties:
 *                        locationId:
 *                          type: number
 *                          description: 게시물이 연결된 장소의 locationId
 *                        storeName:
 *                          type: string
 *                          description: 게시물이 연결된 장소의 가게 이름
 *                        address:
 *                          type: string
 *                          description: 게시물이 연결된 장소의 주소
 *                        starAvg:
 *                          type: number
 *                          description: 게시물이 연결된 장소의 별점 평균
 *                        postCount:
 *                          type: number
 *                          description: 게시물이 연결된 장소의 게시물 수
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
 *                    postId:
 *                      type: number
 *                      description: 게시물 postId
 *                    imgUrl:
 *                      type: array
 *                      items:
 *                        type: string
 *                        format: uri
 *                      description: 게시물의 이미지 URL 목록
 *                    content:
 *                      type: string
 *                      description: 게시물의 내용
 *                    likeCount:
 *                      type: number
 *                      description: 게시물의 좋아요 수
 *                    commentCount:
 *                      type: number
 *                      description: 게시물의 댓글 수
 *                    createdAt:
 *                      type: string
 *                      format: date-time
 *                      description: 게시물 생성일시
 *        '400':
 *          description: 잘못된 페이지 번호 또는 마지막 게시물 postId가 주어진 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: 잘못된 페이지 번호 또는 마지막 게시물 postId가 주어졌습니다.
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
 *  /posts/:postId:
 *    get:
 *      summary: 게시글 상세 정보를 조회합니다.
 *      description: 게시글의 상세 정보를 조회하는 API입니다. 게시글에 대한 모든 정보를 포함하며, 댓글과 댓글의 답글까지 모두 포함합니다.
 *      tags:
 *        - Posts
 *      parameters:
 *        - name: postId
 *          in: path
 *          description: 조회할 게시글의 postId
 *          required: true
 *          schema:
 *            type: integer
 *            minimum: 1
 *      responses:
 *        '200':
 *          description: 게시글 상세 정보를 성공적으로 조회한 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  postId:
 *                    type: number
 *                    description: 게시글 postId
 *                  content:
 *                    type: string
 *                    description: 게시글 내용
 *                  createdAt:
 *                    type: string
 *                    format: date-time
 *                    description: 게시글 생성일시
 *                  likeCount:
 *                    type: number
 *                    description: 게시글 좋아요 수
 *                  commentCount:
 *                    type: number
 *                    description: 게시글 댓글 수
 *                  imgUrl:
 *                    type: array
 *                    items:
 *                      type: string
 *                      format: uri
 *                    description: 게시글의 이미지 URL 목록
 *                  star:
 *                    type: number
 *                    description: 게시글의 평점
 *                  User:
 *                    type: object
 *                    properties:
 *                      nickname:
 *                        type: string
 *                        description: 게시글 작성자의 닉네임
 *                      imgUrl:
 *                        type: string
 *                        format: uri
 *                        description: 게시글 작성자의 프로필 이미지 URL
 *                  Location:
 *                    type: object
 *                    properties:
 *                      locationId:
 *                        type: number
 *                        description: 게시글이 연결된 장소의 locationId
 *                      address:
 *                        type: string
 *                        description: 게시글이 연결된 장소의 주소
 *                      storeName:
 *                        type: string
 *                        description: 게시글이 연결된 장소의 가게 이름
 *                      latitude:
 *                        type: number
 *                        description: 게시글이 연결된 장소의 위도
 *                      longitude:
 *                        type: number
 *                        description: 게시글이 연결된 장소의 경도
 *                      postCount:
 *                        type: number
 *                        description: 게시글이 연결된 위치의 총 게시물 수
 *                      Category:
 *                        type: object
 *                        properties:
 *                          categoryId:
 *                            type: number
 *                            description: 게시글이 속한 카테고리의 categoryId
 *                          categoryName:
 *                            type: string
 *                            description: 게시글이 속한 카테고리의 이름
 *                  PostHashtags:
 *                    type: array
 *                    items:
 *                      type: object
 *                      properties:
 *                        Hashtag:
 *                          type: object
 *                          properties:
 *                            hashtagName:
 *                              type: string
 *                              description: 해시태그 이름
 *                  Comments:
 *                    type: array
 *                    items:
 *                      type: object
 *                      properties:
 *                        commentId:
 *                          type: number
 *                          description: 댓글 commentId
 *                        content:
 *                          type: string
 *                          description: 댓글 내용
 *                        createdAt:
 *                          type: string
 *                          format: date-time
 *                          description: 댓글 생성일시
 *                        User:
 *                          type: object
 *                          properties:
 *                            imgUrl:
 *                              type: string
 *                              format: uri
 *                              description: 댓글 작성자의 프로필 이미지 URL
 *                            nickname:
 *                              type: string
 *                              description: 댓글 작성자의 닉네임
 *                        Replies:
 *                          type: array
 *                          items:
 *                            type: object
 *                            properties:
 *                              replyId:
 *                                type: number
 *                                description: 답글 replyId
 *                              content:
 *                                type: string
 *                                description: 답글 내용
 *                              createdAt:
 *                                type: string
 *                                format: date-time
 *                                description: 답글 생성일시
 *                              User:
 *                                type: object
 *                                properties:
 *                                  imgUrl:
 *                                    type: string
 *                                    format: uri
 *                                    description: 답글 작성자의 프로필 이미지 URL
 *                                  nickname:
 *                                    type: string
 *                                    description: 답글 작성자의 닉네임
 *        '400':
 *          description: 존재하지 않는 게시글 식별자가 주어진 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: 존재하지 않는 게시글입니다.
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
 *  /posts:
 *    post:
 *      summary: 게시물을 작성합니다.
 *      description: 사용자가 게시물을 작성하는 API입니다. 게시물 내용, 이미지, 위치 등의 정보를 포함합니다.
 *      tags:
 *        - Posts
 *      parameters:
 *        - name: body
 *          in: body
 *          description: 게시물 작성에 필요한 정보들을 담은 객체
 *          required: true
 *          schema:
 *            type: object
 *            properties:
 *              content:
 *                type: string
 *                description: 게시물 내용
 *              categoryName:
 *                type: string
 *                description: 게시물이 속한 카테고리의 이름
 *              storeName:
 *                type: string
 *                description: 가게 이름
 *              address:
 *                type: string
 *                description: 가게의 주소
 *              latitude:
 *                type: number
 *                description: 가게의 위도
 *              longitude:
 *                type: number
 *                description: 가게의 경도
 *              star:
 *                type: number
 *                description: 게시물에 대한 별점
 *      consumes:
 *        - multipart/form-data
 *      produces:
 *        - application/json
 *      requestBody:
 *        required: true
 *        content:
 *          multipart/form-data:
 *            schema:
 *              type: object
 *              properties:
 *                imgUrl:
 *                  type: array
 *                  items:
 *                    type: string
 *                    format: binary
 *                  description: 게시물에 첨부된 이미지 파일들
 *      responses:
 *        '201':
 *          description: 게시물이 성공적으로 작성되었을 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: 게시글 등록이 완료되었습니다.
 *        '400':
 *          description: 요청이 유효하지 않거나 필수 정보가 누락된 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: 사진을 등록해주시고, 사진을 50KB이하의 사진파일만 넣어주세요.
 *        '500':
 *          description: 서버에서 에러가 발생한 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: 게시글 작성에 실패했습니다.
 */

/**
 * @swagger
 * paths:
 *  /posts/:postId:
 *    patch:
 *      summary: 게시물을 수정합니다.
 *      description: 사용자가 자신의 게시물을 수정하는 API입니다. 게시물의 내용, 주소, 가게 이름, 별점 등을 수정할 수 있습니다.
 *      tags:
 *        - Posts
 *      parameters:
 *        - name: postId
 *          in: path
 *          description: 수정하려는 게시물의 postId
 *          required: true
 *          schema:
 *            type: integer
 *            format: int64
 *        - name: body
 *          in: body
 *          description: 수정할 정보를 담은 객체
 *          required: true
 *          schema:
 *            type: object
 *            properties:
 *              address:
 *                type: string
 *                description: 수정된 주소
 *              content:
 *                type: string
 *                description: 수정된 게시물 내용
 *              star:
 *                type: number
 *                description: 수정된 별점
 *              storeName:
 *                type: string
 *                description: 수정된 가게 이름
 *      produces:
 *        - application/json
 *      responses:
 *        '201':
 *          description: 게시물이 성공적으로 수정되었을 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: 게시물을 수정하였습니다.
 *        '401':
 *          description: 게시글에 수정 권한이 없는 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: 수정할 권한이 존재하지 않습니다.
 *        '404':
 *          description: 요청한 게시물이 존재하지 않는 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: 존재하지 않는 게시글 입니다.
 *        '500':
 *          description: 서버에서 에러가 발생한 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: 게시글 수정에서 에러가 발생했습니다.
 */

/**
 * @swagger
 * paths:
 *  /posts/:postId:
 *    delete:
 *      summary: 게시물을 삭제합니다.
 *      description: 사용자가 자신의 게시물을 삭제하는 API입니다. 게시물을 삭제할 때 해당 게시물에 첨부된 이미지도 함께 삭제됩니다.
 *      tags:
 *        - Posts
 *      parameters:
 *        - name: postId
 *          in: path
 *          description: 삭제하려는 게시물의 postId
 *          required: true
 *          schema:
 *            type: integer
 *            format: int64
 *      produces:
 *        - application/json
 *      responses:
 *        '200':
 *          description: 게시물이 성공적으로 삭제되었을 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: 게시글을 삭제하였습니다.
 *        '401':
 *          description: 게시글에 삭제 권한이 없는 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: 삭제할 권한이 존재하지 않습니다.
 *        '404':
 *          description: 요청한 게시물이 존재하지 않는 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: 존재하지 않는 게시글 입니다.
 *        '500':
 *          description: 서버에서 에러가 발생한 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: 게시글 삭제에서 에러가 발생했습니다.
 */
