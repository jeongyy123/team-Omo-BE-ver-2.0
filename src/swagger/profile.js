/**
 * @swagger
 * /users/self/profile:
 *   get:
 *     summary: 사용자 정보 조회.
 *     description: 로그인에 성공한 사용자는 마이페이지에서 자신의 프로필 정보를 조회할 수 있다.
 *     tags:
 *       - Profiles
 *     responses:
 *       200:
 *         description: 사용자의 프로필 정보를 성공적으로 조회했을 경우
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                       format: email
 *                       description: 사용자의 이메일 주소
 *                     nickname:
 *                       type: string
 *                       description: 사용자의 닉네임
 *                     imgUrl:
 *                       type: string
 *                       description: 사용자의 프로필 이미지
 *       '500':
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
 * /users/self/profile/posts:
 *   get:
 *     summary: 마이페이지 게시글 및 댓글 목록 조회
 *     description: 사용자의 닉네임과 함께 게시글과 댓글 목록을 조회한다
 *     tags:
 *      - Profiles
 *     responses:
 *       200:
 *         description: 사용자가 작성한 게시글과 댓글 목록을 성공적으로 불러왔을 경우
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 postsCount:
 *                   type: number
 *                   description: 사용자가 작성한 게시글의 갯수
 *                 data:
 *                   type: object
 *                   properties:
 *                     nickname:
 *                       type: string
 *                       description: 사용자의 닉네임
 *                     Posts:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           postId:
 *                             type: number
 *                             description: 게시글의 고유 번호
 *                           UserId:
 *                             type: number
 *                             description: 작성한 사용자의 고유 번호
 *                           imgUrl:
 *                             type: string
 *                             description: 게시글 이미지
 *                           content:
 *                             type: string
 *                             description: 게시글 내용
 *                           likeCount:
 *                             type: number
 *                             description: 게시글 좋아요 갯수
 *                           commentCount:
 *                             type: number
 *                             description: 게시글의 댓글 갯수
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             description: 게시글 작성 날짜
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                             description: 게시글이 업데이트 된 날짜
 *                           Comments:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 UserId:
 *                                   type: number
 *                                   description: 댓글을 작성한 사용자의 고유 번호
 *                                 PostId:
 *                                   type: number
 *                                   description: 댓글이 달린 게시글의 고유 번호
 *                                 content:
 *                                   type: string
 *                                   description: 댓글 내용
 *                                 createdAt:
 *                                   type: string
 *                                   format: date-time
 *                                   description: 댓글이 작성된 날짜
 *                                 User:
 *                                   type: object
 *                                   properties:
 *                                     nickname:
 *                                       type: string
 *                                       description: 댓글을 작성한 사용자 닉네임.
 *                                     imgUrl:
 *                                       type: string
 *                                       description: 댓글을 작성한 사용자의 닉네임
 *       '500':
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
 *  /users/self/profile/bookmark:
 *    get:
 *      summary: 사용자가 북마크한 장소들의 목록들을 불러온다
 *      description: 로그인에 성공한 사용자는 자신이 북마크한 장소들의 목록들을 조회할 수 있다
 *      tags:
 *        - Profiles
 *      responses:
 *        '200':
 *          description: 사용자가 북마크한 장소들의 목록을 성공적으로 불러왔을 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  bookmarkCount:
 *                    type: integer
 *                    description: 사용자가 북마크한 장소들의 객수
 *                    example: 10
 *                  data:
 *                    type: array
 *                    description: 사용자가 북마크한 장소들의 목록들
 *                    items:
 *                      type: object
 *                      properties:
 *                        Location:
 *                          type: object
 *                          properties:
 *                            locationId:
 *                              type: integer
 *                              description: 북마크한 장소의 고유 번호
 *                            storeName:
 *                              type: string
 *                              description: 북마크한 장소 이름
 *                            address:
 *                              type: string
 *                              description: 북마크한 장소의 주소
 *                            starAvg:
 *                              type: number
 *                              description: 해당 장소의 별점 평균
 *                            Posts:
 *                              type: array
 *                              description: 장소에 관련관 게시글들의 목록
 *                              items:
 *                                type: object
 *                                properties:
 *                                  LocationId:
 *                                    type: integer
 *                                    description: 장소 고유의 번호
 *                                  likeCount:
 *                                    type: integer
 *                                    description: 해당하는 장소에 관련된 게시글의 좋아요 갯수
 *                                  imgUrl:
 *                                    type: string
 *                                    description: 해당하는 장소의 이미지 주소
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
 *  /users/self/profile/edit:
 *    patch:
 *      summary: 사용자 프로필 수정
 *      description: 사용자는 자신의 프로필을 수정할 수 있다
 *      tags:
 *        - Profiles
 *      requestBody:
 *        required: true
 *        content:
 *          multipart/form-data:
 *            schema:
 *              type: object
 *              properties:
 *                nickname:
 *                  type: string
 *                  description: 새로운 닉네임
 *                newPassword:
 *                  type: string
 *                  description: 새로운 비밀번호
 *                confirmedPassword:
 *                  type: string
 *                  description: 입력된 새로운 비밀번호 재확인
 *                imgUrl:
 *                  type: string
 *                  format: binary
 *                  description: 프로필 사진 수정하기 위해서 업로드
 *      responses:
 *        '201':
 *          description: 프로필이 성공적으로 수정되었을 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    message: 회원정보가 수정되었습니다.
 *        '400':
 *          description: 입력한 두 비밀번호가 일치하지 않을 경우 (new password !== repeat password)
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  errorMessage:
 *                    type: string
 *                    example: 비밀번호가 일치하지 않습니다. 다시 확인해주세요.
 *        '401':
 *          description: 사용자가 입력한 비밀번호가 이전의 비밀번호와 같은 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  errorMessage:
 *                    type: string
 *                    message: 새 비밀번호를 입력해 주세요
 *        '500':
 *          description: 서버에서 에러가 발생하였을 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  errorMessage:
 *                    type: string
 *                    example: 서버에서 에러가 발생하였습니다
 */
