/**
 * @swagger
 * /locations:
 *   get:
 *     summary: 지도페이지에서 주변 둘러보기
 *     description: 화면에서 보여지는 지도에서 가운데 기준으로 가까운 게시글을 조회한다.
 *     tags:
 *      - Locations
 *     parameters:
 *       - in: query
 *         name: categoryName
 *         schema:
 *           type: string
 *         description: 조회할 카테고리 이름 ('음식점', '카페', '기타', '전체')
 *       - in: query
 *         name: qa
 *         schema:
 *           type: string
 *         description: latitude의 최소값
 *       - in: query
 *         name: pa
 *         schema:
 *           type: string
 *         description: latitude의 최대값
 *       - in: query
 *         name: ha
 *         schema:
 *           type: string
 *         description: longitude의 최소값
 *       - in: query
 *         name: oa
 *         schema:
 *           type: string
 *         description: longitude의 최대값
 *     responses:
 *       200:
 *         description: 사용자가 지도에서 성공적으로 주변 게시물을 불러왔을 경우
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 postsCount:
 *                   type: number
 *                   description: 사용자가 보고있는 화면에서 나타나는 게시글의 갯수
 *                 data:
 *                   type: object
 *                   properties:
 *                     nickname:
 *                       type: string
 *                       description: 사용자가 해당하는 게시물을 클릭했을 경우
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
 * /locations/:locationId:
 *   get:
 *     summary: 인기 게시글 조회
 *     description: 특정 위치의 인기 게시글과 위치 정보를 조회한다.
 *     tags:
 *      - Locations
 *     parameters:
 *       - in: path
 *         name: locationId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 조회할 위치의 고유 식별자
 *       - in: query
 *         name: latitude
 *         schema:
 *           type: string
 *         description: 선택적으로 조회할 위치의 latitude
 *       - in: query
 *         name: longitude
 *         schema:
 *           type: string
 *         description: 선택적으로 조회할 위치의 longitude
 *     responses:
 *       200:
 *         description: 성공적으로 위치와 게시글 정보를 불러왔을 경우
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 location:
 *                   type: object
 *                   properties:
 *                     locationId:
 *                       type: number
 *                       description: 위치의 고유 식별자
 *                     address:
 *                       type: string
 *                       description: 위치의 주소
 *                     starAvg:
 *                       type: number
 *                       description: 위치에 대한 별점 평균
 *                     postCount:
 *                       type: number
 *                       description: 위치에 속한 게시글의 수
 *                     storeName:
 *                       type: string
 *                       description: 위치의 상점 이름
 *                     Posts:
 *                       type: object
 *                       properties:
 *                         imgUrl:
 *                           type: string
 *                           description: 위치에 속한 게시글의 이미지 URL (첫 번째 이미지만 사용)
 *                 posts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       User:
 *                         type: object
 *                         properties:
 *                           nickname:
 *                             type: string
 *                             description: 게시글 작성자의 닉네임
 *                           imgUrl:
 *                             type: string
 *                             description: 게시글 작성자의 이미지 URL
 *                       postId:
 *                         type: number
 *                         description: 게시글의 고유 식별자
 *                       imgUrl:
 *                         type: string
 *                         description: 게시글의 이미지 URL
 *                       content:
 *                         type: string
 *                         description: 게시글의 내용
 *                       commentCount:
 *                         type: number
 *                         description: 게시글의 댓글 수
 *                       likeCount:
 *                         type: number
 *                         description: 게시글의 좋아요 수
 *                       star:
 *                         type: number
 *                         description: 게시글의 평점
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         description: 게시글 작성 날짜
 *       400:
 *         description: 요청이 잘못된 경우
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "locationId 요청 송신에 오류가 있습니다."
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
