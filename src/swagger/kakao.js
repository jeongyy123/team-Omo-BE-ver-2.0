/**
 * @swagger
 * /auth/kakao:
 *   get:
 *     summary: Kakao OAuth 로그인 엔드포인트
 *     description: Kakao OAuth를 통한 로그인을 처리한다
 *     tags:
 *       - Users
 *     responses:
 *       '302':
 *         description: 카카오 로그인 페이지로 리다이렉트한다.
 */

/**
 * @swagger
 * /auth/kakao/callback:
 *   get:
 *     summary: Kakao OAuth 로그인 후 콜백 엔드포인트
 *     description: Kakao OAuth 로그인 후 콜백을 처리하고 토큰을 전달한다.
 *     tags:
 *       - Users
 *     parameters:
 *       - name: accessToken
 *         in: query
 *         description: 생성된 엑세스 토큰
 *         required: true
 *         schema:
 *           type: string
 *       - name: refreshToken
 *         in: query
 *         description: 생성된 리프레시 토큰
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '302':
 *         description: 로그인 성공 후 메인 페이지로 리다이렉트한다 (with access and refresh tokens)
 *       '401':
 *         description: Kakao 로그인 실패
 *       '500':
 *         description: 서버 에러
 */
