/**
 * @swagger
 * paths:
 *  /auth/verify-email:
 *    post:
 *     summary: 이메일 인증 요청
 *     description: 회원가입할 때 이메일 인증을 요청하면 인증 이메일이 해당 이메일 주소로 전송한다
 *     tags:
 *       - Users
 *     responses:
 *      '200':
 *        description: 이메일 유효성 검증 후 해당 이메일로 인증번호를 성공적으로 전송한 경우
 *        content:
 *         applicaiton/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: 메일 전송에 성공하였습니다.
 *      '409':
 *        description: 입력한 이메일이 이미 존재하는 경우
 *        content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               errorMessage:
 *                 type: string
 *                 example: 중복된 이메일입니다.
 *      '500':
 *        description: 이메일 전송에 실패한 경우
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                errorMessage:
 *                  type: string
 *                  example: 메일 전송에 실패하였습니다..
 */

/**
 * @swagger
 * paths:
 *  /auth/verify-authentication-code:
 *   post:
 *    summary: 인증코드 확인
 *    description: 입력받은 인증 코드가 올바른지 확인한다
 *    tags:
 *      - Users
 *    responses:
 *      '200':
 *        description: 입력한 인증코드가 서버에서 발급한 인증코드와 일치하는 경우
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: 성공적으로 인증되었습니다
 *      '404':
 *        description: 입력한 인증번호가 서버에서 발급한 인증코드와 일치하지 않는 경우
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                errorMessage:
 *                  type: string
 *                  example: 인증번호가 일치하지 않습니다
 *      '500':
 *        description: 서버에서 에러가 발생한 경우
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                errorMessage:
 *                  type: string
 *                  example: 서버에서 에러가 발생하였습니다.
 */

/**
 * @swagger
 * paths:
 *  /auth/chcek-nickname:
 *   post:
 *    summary: 닉네임 중복확인
 *    description: 닉네임이 이미 사용중인 닉네임인지 확인한다
 *    tags:
 *      - Users
 *    responses:
 *     '200':
 *       description: 입력받은 닉네임이 유효한 경우
 *       content:
 *        application/json:
 *         schema:
 *          type: object
 *          properties:
 *           message:
 *            type: string
 *            example: 중복검사 완료
 *        '409':
 *          description: 다른 사용자가 이미 같은 닉네임을 사용중인 경우
 *          content:
 *           application/json:
 *            schema:
 *             type: object
 *             properties:
 *              errorMessage:
 *               type: string
 *               example: 이미 사용 중인 닉네임입니다. 다른 닉네임을 사용해주세요.
 *        '500':
 *          description: 서버에서 에러가 발생한 경우
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
 * /auth/register:
 *   post:
 *     summary: 사용자 등록
 *     description: POST 방식으로 사용자를 등록한다
 *     tags:
 *       - Users
 *     requestBody:
 *       description: 사용자가 서버에 전달하는 값에 따라 결과 값이 다르다 (사용자 등록)
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nickname:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               confirmedPassword:
 *                 type: string
 *     responses:
 *       '201':
 *         description: 회원가입에 성공했을 경우
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                  type: string
 *                  example: "회원가입이 완료되었습니다."
 *       '400':
 *         description: 비밀번호 일치하지 않을 경우
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errorMessage:
 *                  type: string
 *                  example: "비밀번호가 일치하지 않습니다. 다시 확인해주세요."
 *       '409':
 *         description: 중복된 이메일 주소나 닉네임을 입력했을 경우
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errorMessage:
 *                  type: stringnode
 *                  example: "중복된 닉네임입니다. 또는 중복된 이메일입니다."
 *       '500':
 *         description: "서버 에러가 발생했을 경우"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errorMessage:
 *                  type: string
 *                  example: "서버에서 오류가 발생하였습니다."
 */

/**
 * @swagger
 * paths:
 *  /auth/login:
 *    post:
 *      summary: 로그인
 *      description: 이메일 주소와 비밀번호로 로그인
 *      tags:
 *        - Users
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                email:
 *                  type: string
 *                password:
 *                  type: string
 *      responses:
 *        '200':
 *          description: 로그인에 성공했을 경우
 *          headers:
 *            Authorization:
 *              description: Bearer token for authentication
 *              schema:
 *                type: string
 *                example: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *            RefreshToken:
 *              description: Bearer token for refresh purposes
 *              schema:
 *                type: string
 *                example: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *            message:
 *              type: string
 *              example: "로그인에 성공하였습니다."
 *        '401':
 *          description: 입력된 비밀번호가 일치하지 않을 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  errorMessage:
 *                    type: string
 *                    example: "비밀번호가 일치하지 않습니다."
 *        '404':
 *          description: 유저가 존재하지 않을 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  errorMessage:
 *                    type: string
 *                    example: "해당 이메일로 가입된 계정이 없습니다."
 *        '500':
 *          description: 서버에서 발생한 에러일 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  errorMessage:
 *                    type: string
 *                    example: "서버에서 오류가 발생하였습니다."
 */

/**
 * @swagger
 * paths:
 *  /auth/tokens/refresh:
 *    post:
 *      summary: 엑세스 토큰 재발급
 *      description: 유효한 리프레시 토큰을 가지고 엑세스 토큰을 재발급 받는다
 *      tags:
 *        - Users
 *      responses:
 *        '200':
 *          description: 성공적으로 엑세스 토큰이 재발급된 경우
 *          headers:
 *            Authorization:
 *              description: Bearer token for authentication
 *              schema:
 *                type: string
 *                example: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *            message:
 *              type: string
 *              example: "엑세스 토큰이 정상적으로 재발급되었습니다."
 *        '419':
 *          description: 전달받은 리프레시 토큰이 유효하지 않거나 존재하지 않을 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  errorMessage:
 *                    type: string
 *                    example: Refresh token의 정보가 서버에 존재하지 않습니다.
 *        '500':
 *          description: 서버에서 오류가 발생한 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  errorMessage:
 *                    type: string
 *                    example: 서버에서 오류가 발생하였습니다.
 */

/**
 * @swagger
 * paths:
 *  /auth/logout:
 *    post:
 *      summary: 로그아웃
 *      description: 유저를 로그아웃 시키고 토큰을 무효화시킨다
 *      tags:
 *       - Users
 *      responses:
 *        '200':
 *          description: 성공적으로 로그아웃이 된 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: "로그아웃 되었습니다."
 *        '500':
 *          description: 서버에서 에러가 발생한 경우
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
 *  /auth/withdraw:
 *    delete:
 *      summary: 회원탈퇴
 *      description: 회원탈퇴를 요청받은 경우 유저 데이터를 삭제, 발급받은 리프레시 토큰을 무효화 시킨다
 *      tags: [Users]
 *      responses:
 *        '200':
 *          description: 유저의 정보가 삭제되고 성공적으로 회원탈퇴가 된 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: "회원탈퇴가 성공적으로 처리되었습니다. 이용해 주셔서 감사합니다."
 *        '500':
 *          description: 서버에서 에러가 발생한 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  errorMessage:
 *                    type: string
 *                    example: 서버에서 에러가 발생하였습니다.
 */
