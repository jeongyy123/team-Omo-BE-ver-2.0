<p align="center">
프로젝트 완료 후 기능을 추가하기 위해 fork한 repository
</p>

<p align="center">
<img src="https://velog.velcdn.com/images/dbsdud143/post/9a342f35-eb94-413f-8c57-7cd09015bd3a/image.png"  width="800" />
</p>

<br>

# 🎯 프로젝트 소개

- 주제 : 오늘 뭘 하면 좋을까? 고민할 때, 찾고 싶은 웹 서비스
- 프로젝트 명: 오늘 모하지?
- 최신순 기반으로 **최근 트렌드의 피드를 반영**
다른 사람들이 어떤 곳에서 무엇을 하며 즐거운 시간을 보냈는지 구경하고 찾아 볼 수 있습니다.
또한 본인이 즐겁게 다녀온 활동이나 가게 등을 간단한 글과 사진으로 공유할 수 있고,
특정 좋아요 수를 넘으면 인기 게시물로 분류가 됩니다. 북마크 기능으로 가고싶은 장소를 저장해놓을 수도 있습니다.
- **위치 기반**
현 위치에서 가까운 곳을 대상으로 작성한 **유저들의 가게 방문 게시글**을 볼 수 있으며,
기준 위치를 변경할 수도 있습니다.
(현재 서비스는 서울 지역만 제공됩니다. 😥)
<br>

---

# 🎯 핵심 기능

<br>
<details>
<summary><b>카카오 로그인 / 이메일 인증 로그인</b></summary>
<p align="center">
<img src="https://velog.velcdn.com/images/dbsdud143/post/3c0fb5f8-e676-43b7-907f-dc52c4d274ab/image.png"/>
<img src="https://velog.velcdn.com/images/dbsdud143/post/506bff8b-e2ea-4712-9eb4-dd0a859e08b6/image.png"/>
</p>

- 소셜로그인으로 간편하게 회원가입 및 로그인이 가능합니다.
- 이메일 회원가입 시 유효한 이메일로만 인증 할 수 있도록 이메일 인증 방식을 구현했습니다.
</details>

<details>
<summary><b>마이페이지</b></summary>
<p align="center">
<img src="https://velog.velcdn.com/images/dbsdud143/post/a1f0361a-e95d-43de-9586-de9b8870b0e1/image.png"/>
<img src="https://velog.velcdn.com/images/dbsdud143/post/e2036a00-fba7-475e-b2ca-80889cf1c289/image.png"/>
<img src=""/>
</p>

- 프로필 이미지 편집이 가능합니다.
- 닉네임 변경 및 비밀번호 재설정, 회원탈퇴가 가능합니다.
- 내가 북마크한 장소를 한눈에 볼 수 있습니다.
- 내가 쓴 게시물들을 한눈에 볼 수 있습니다.
</details>

<details>
<summary><b>메인페이지</b></summary>
<p align="center">
<img src="https://velog.velcdn.com/images/dbsdud143/post/0066afb9-d204-4e25-8bff-f15d577f6036/image.png"/>
<img src="https://velog.velcdn.com/images/dbsdud143/post/5d107a89-4cd2-4af0-b2b1-ceefd65b87ac/image.png"/>
<img src="https://velog.velcdn.com/images/dbsdud143/post/c900eac4-7677-4f38-b69b-aca75e55322b/image.png"/>
<img src="https://velog.velcdn.com/images/dbsdud143/post/60d6fe4e-8cd5-49e2-8be9-9083f982aa44/image.png"/>
<img src="https://velog.velcdn.com/images/dbsdud143/post/3943e16c-724e-441c-8637-f7e92a1dd164/image.png"/>
<img src="https://velog.velcdn.com/images/dbsdud143/post/534d5010-b2f1-4e7f-822a-f537ee199029/image.png"/>
</p>

- 위치 선택 - 아래 게시물들과 장소들을 현 위치, 서울시 구별로 선택하여 원하는 위치의 데이터만 볼 수 있습니다.
- 요즘 뜨는 - 좋아요 수를 많이받은 게시물의 장소를 캐러셀로 한눈에 볼 수 있습니다.
- 오늘 모할까? - 최신 피드 게시물을 캐러셀로 한눈에 볼 수 있습니다.
- 실시간 댓글 - 등록한 댓글들을 캐러셀로 한눈에 볼 수 있습니다.
</details>

<details>
<summary><b>게시글 페이지</b></summary>
<p align="center">
<img src="https://velog.velcdn.com/images/dbsdud143/post/a0bd1645-37f1-4dbe-999b-c4e9d8e44d05/image.png"/>
</p>

- 오모 사용자들이 올린 게시물들을 리스트 형식으로 둘러볼 수 있는 페이지입니다.
- 현위치 혹은 서울시 구 선택으로 원하는 구역의 게시물을 필터링하여 확인할 수 있습니다.
</details>

<details>
<summary><b>상세보기 - 게시글</b></summary>
<p align="center">
<img src="https://velog.velcdn.com/images/dbsdud143/post/356a40e7-084e-46da-857e-d3252946e960/image.png"/>
<img src="https://velog.velcdn.com/images/dbsdud143/post/68006d93-144e-4844-b8ec-1c1e155ba123/image.png"/>
</p>

- 오모 사용자가 작성한 글의 구체적인 내용과 장소를 볼 수 있습니다.
- 간단한 글과 사진, 평점을 확인할 수 있습니다.
- 게시글에 좋아요 표시를 할 수 있습니다.
- 게시글에 대한 댓글과 대댓글로 소통할 수 있습니다.

</details>

<details>
<summary><b>상세보기 - 장소</b></summary>
<p align="center">
<img src="https://velog.velcdn.com/images/dbsdud143/post/157dafc5-4bbb-4514-94fc-5abe245bc3e6/image.png"/>
</p>

- 미니맵을 통해 간단하게 장소에 대한 위치를 확인할 수 있습니다.
- 장소명, 주소, 별점, 영업시간과 영업중, 전화번호 등의 정보를 확인할 수 있습니다.
- 북마크 버튼으로 장소 저장이 가능합니다.
- 지도로 보기 버튼으로 지도 페이지로 이동해서 더욱 자세하게 확인할 수 있습니다.

</details>

<details>
<summary><b>검색</b></summary>
<p align="center">
<img src="https://velog.velcdn.com/images/dbsdud143/post/9a6f3e87-83fe-4082-93ee-57f14170e85d/image.png"/>
</p>

- 유저명으로 검색하여 해당 유저의 피드를 확인할 수 있습니다.
- 게시물로 검색하여 게시글의 상세페이지로 더욱 빠르게 확인할 수 있습니다.

</details>

<details>
<summary><b>지도</b></summary>
<p align="center">
<img src="https://velog.velcdn.com/images/dbsdud143/post/aa14aba5-fc9b-4b3b-a333-4a528b6dac0c/image.png"/>
<img src="https://velog.velcdn.com/images/dbsdud143/post/bee6e0d2-75e9-4803-a5e8-90e6ace3fda9/image.png"/>
</p>

- 현위치 기반의 주변 장소들을 한눈에 확인할 수 있고, 마커 클릭시 장소에 대한 게시물을 확인할 수 있습니다.
- 장소명을 검색하여 빠르게 이동하여 주변 장소들에 대한 정보를 확인할 수 있습니다.

</details>

<details>
<summary><b>다크모드</b></summary>
<p align="center">
<img src="https://velog.velcdn.com/images/dbsdud143/post/e193078b-e468-4287-9c0e-f92d41e40ae0/image.png"/>
<img src="https://velog.velcdn.com/images/dbsdud143/post/d5901a1b-63da-482c-a510-4e28b13680e0/image.png"/>
</p>

- 페이지 전체와 지도에도 다크모드를 적용하여 편안하게 사이트를 이용하실 수 있습니다.
</details>

<br>
<br>
<br>

---

# 🎯 프로젝트 기간

### 2023년 12월 1일 ~ 2024년 1월 12일 (총 6주)

<br>
<br>

---

# 🎯 프로젝트 팀원 소개

### 🔗 개발 GitHub 링크

- [오모 - Backend](https://github.com/Team-Omo/team-Omo-BE)
- [오모 - Frontend](https://github.com/Team-Omo/team-Omo-FE)

<br>
<br>

### 🍿 Project Members

<table align="center">
<tr>
<td align="center"><b><a href="https://github.com/codeeon">👑 김상연</a></b></td>
<td align="center"><b><a href="https://github.com/nkcfe">🍕 남궁철</a></b></td>
<td align="center"><b><a href="https://github.com/kyeongminRoh">👑 노경민</a></b></td>
<td align="center"><b><a href="https://github.com/heyjk2212">🍰 김지나</a></b></td>
<td align="center"><b><a href="https://github.com/jeongyy123">🥯 정윤영</a></b></td>
<td align="center"><b><a href="">🍔 박성빈</a></b></td>
</tr>

<tr>
<td align="center"><a href="https://github.com/codeeon"><img src="https://velog.velcdn.com/images/dbsdud143/post/70204543-b759-4aad-9864-865d32ff197a/image.png" width="100px" /></a></td>
<td align="center"><a href="https://github.com/nkcfe"><img src="https://velog.velcdn.com/images/dbsdud143/post/70204543-b759-4aad-9864-865d32ff197a/image.png" width="100px" /></a></td>
<td align="center"><a href="https://github.com/kyeongminRoh"><img src="https://velog.velcdn.com/images/dbsdud143/post/70204543-b759-4aad-9864-865d32ff197a/image.png" width="100px" /></a></td>
<td align="center"><a href="https://github.com/heyjk2212"><img src="https://velog.velcdn.com/images/dbsdud143/post/70204543-b759-4aad-9864-865d32ff197a/image.png" width="100px" /></a></td>
<td align="center"><a href="https://github.com/jeongyy123"><img src="https://velog.velcdn.com/images/dbsdud143/post/70204543-b759-4aad-9864-865d32ff197a/image.png" width="100px" /></a></td>
<td align="center"><a href="https://github.com/heypoppop"><img src="https://velog.velcdn.com/images/dbsdud143/post/70204543-b759-4aad-9864-865d32ff197a/image.png" width="100px" /></a></td>
</tr>
<tr>
<td align="center"><b>🌱 React</b></td>
<td align="center"><b>🌱 React</b></td>
<td align="center"><b>🌱 Node</b></td>
<td align="center"><b>🌱 Node</b></td>
<td align="center"><b>🌱 Node</b></td>
<td align="center"><b>🌱 Designer</b></td>
</tr>
</table>
<br>
<br>

역할

|  | 이름 | 분담 |
| --- | --- | --- |
| FE ✨​ | 김상연 (L) | ‣ 인증 <br> - 회원가입 / 유효성 검사 / 로그인<br> - 인가 / 토큰 관리<br> - 카카오 로그인<br> - 로그인 / 비로그인 처리<br> ‣ 마이 페이지 <br> - 내 정보 / 게시글 / 북마크 장소 조회<br> ‣ 프로필 편집 페이지<br> - 유저 정보 수정 / 유효성 검사<br> - 프로필 사진 수정<br> - 회원 탈퇴<br> ‣ 유저 페이지 <br> - 유저 정보 / 게시글 조회<br> |
| FE | 남궁철 | ‣ 메인페이지 <br> - 현위치, 인기글, 인기글 장소 정보 모달, 최신글, 댓글 <br>‣ 게시글 페이지<br> - 게시글 CRUD, 게시글 페이지네이션<br> - 좋아요 / 북마크 <br> - 댓글/대댓글 CRD, 페이지네이션 <br> - 장소검색‣ 지도 페이지 <br> - 둘러보기 / 인기게시글 <br> - 지도<br> - 장소 상세 정보 <br> 장소 검색 ‣ 검색 <br> - 유저닉네임 / 가게이름 검색 <br>‣ 테마 <br> - 다크모드<br> |
| BE✨​ | 노경민(VL) | ‣ 댓글 기능 <br> - 작성, 조회, 삭제 <br>‣ 대댓글 기능 <br> - 작성, 조회, 삭제 <br>‣ 지도 페이지 <br> - 둘러보기 / 인기게시글 <br> ‣ 게시글 페이지<br> - 게시글 CRUD중 수정, 삭제 <br>‣ 배포 <br> - nginx (proxy_pass, Load Balance, Https) <br> |
| BE | 김지나 | ‣ 회원가입, 로그인(JWT: Access/Refresh), 로그아웃, 회원탈퇴<br>‣ 회원가입시 이메일 인증 및 인증번호 검증<br>‣ Oauth 2.0 카카오 소셜 로그인 구현<br>‣ 보안 강화를 위한 Refresh Token 기능(RTR 포함)구현<br>‣ 마이페이지 - 내 프로필 정보 조회, 유저 정보 변경(프로필 사진, 닉네임, 비밀번호), 내 게시글 목록 조회, 내 북마크 목록 조회<br>‣ 프로필 페이지 - 다른 사람의 프로필 조회/ 다른 사람의 게시글 목록 조회<br>‣ Swagger 적용 - RESTful API를 문서화<br>‣ Https 배포 (ec2, nginx)<br>‣ CI/CD 구현 <br>‣ Git actions, CodeDeploy, nginx 서버관리<br>‣ 프로필 이미지 관리 - AWS S3, multer<br> ‣ 테스트 코드 작성 |
| BE | 정윤영 | ‣ 메인페이지 <br> - 최신글, 인기글, 댓글 자치구별, 카테고리별 조회 <br> ‣ 게시글 페이지 <br> - 게시글 CRUD, 게시글 페이지네이션<br> - 좋아요 / 북마크 <br>‣ 지도 페이지 <br> - 둘러보기 / 인기게시글 <br> ‣ 검색 <br> - 유저닉네임 / 가게이름 검색 <br> |
| Design | 박성빈 | ‣ 디자인 총괄 PC 환경 작업 <br>   - 브로셔 배너 및 로고 디자인 <br> - 전체페이지 PC 환경 디자인  <br> - 홍보 카드뉴스 디자인 |

<br>

---

# 🎯 아키텍쳐 구성도

<br>

<p align="center">
<img src="https://velog.velcdn.com/images/dbsdud143/post/08296124-69a1-43ac-9bd4-86ad82ca5df9/image.png"/>
</p>

<br>

---

# 🎯 ERD

<br>

<p align="center">
<img src="https://velog.velcdn.com/images/dbsdud143/post/f3294f2b-dd2c-4826-b922-53bb62aab24a/image.png"/>
</p>

<br>

---

# 🎯 사용 기술 스택

### with

![](https://img.shields.io/badge/notion-%23000000?style=for-the-badge&logo=notion&logoColor=white)
![](https://img.shields.io/badge/slack-%234A154B?style=for-the-badge&logo=slack&logoColor=white)
![](https://img.shields.io/badge/git-%23F05032?style=for-the-badge&logo=git&logoColor=white)
![](https://img.shields.io/badge/github-%23181717?style=for-the-badge&logo=github&logoColor=white)


### Design

![](https://img.shields.io/badge/figma-%23F24E1E?style=for-the-badge&logo=figma&logoColor=white)


### FE

![](https://img.shields.io/badge/typescript-%233178C6?style=for-the-badge&logo=typescript&logoColor=white)
![](https://img.shields.io/badge/vite-%23646CFF?style=for-the-badge&logo=vite&logoColor=white)
![](https://img.shields.io/badge/react-%2361DAFB?style=for-the-badge&logo=react&logoColor=black)

<br />

![](https://img.shields.io/badge/styled%20components-%23DB7093?style=for-the-badge&logo=styledcomponents&logoColor=white)
![](https://img.shields.io/badge/framer%20motion-%23E13197?style=for-the-badge&logo=framer&logoColor=white)
![](https://img.shields.io/badge/react%20router%20dom-%23CA4245?style=for-the-badge&logo=reactrouter&logoColor=white)
![](https://img.shields.io/badge/axios-%235A29E4?style=for-the-badge&logo=axios&logoColor=white)
![](https://img.shields.io/badge/tanstack%20query-%23FF4154?style=for-the-badge&logo=reactquery&logoColor=white)
![](https://img.shields.io/badge/zustand-%234F1E31?style=for-the-badge)
![](https://img.shields.io/badge/vercel-%23000000?style=for-the-badge&logo=vercel&logoColor=white)

### BE

![](https://img.shields.io/badge/javascript-%23F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![](https://img.shields.io/badge/node.js-%23339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![](https://img.shields.io/badge/express-%23000000?style=for-the-badge&logo=express&logoColor=white)
![](https://img.shields.io/badge/swagger-%2385EA2D?style=for-the-badge&logo=swagger&logoColor=black)
<br />

![](https://img.shields.io/badge/prisma-%232D3748?style=for-the-badge&logo=prisma&logoColor=white)
![](https://img.shields.io/badge/jwt-%23D63AFF?style=for-the-badge&logoColor=white)
![](https://img.shields.io/badge/aws%20ec2-%23FF9900?style=for-the-badge&logo=amazonec2&logoColor=white)
![](https://img.shields.io/badge/aws%20code%20deploy-%234c70f1?style=for-the-badge)
![](https://img.shields.io/badge/aws%20s3-%23569A31?style=for-the-badge&logo=amazons3&logoColor=white)
![](https://img.shields.io/badge/aws%20rds-%23527FFF?style=for-the-badge&logo=amazonrds&logoColor=white)
![](https://img.shields.io/badge/mysql-%234479A1?style=for-the-badge&logo=mysql&logoColor=white)
![](https://img.shields.io/badge/nginx-%23009639?style=for-the-badge&logo=nginx&logoColor=white)
![](https://img.shields.io/badge/github%20actions-%232088FF?style=for-the-badge&logo=githubactions&logoColor=white)


### API

![](https://img.shields.io/badge/kakao%20oauth-%23FFCD00?style=for-the-badge&logo=kakao&logoColor=black)
![](https://img.shields.io/badge/google%20maps-%234285F4?style=for-the-badge&logo=googlemaps&logoColor=white)


<br>

---

# 🎯 의사결정

<details>
<summary><b>FE</b></summary>

| 사용 기술 | 결정 사유 |
| --- | --- |
| Vite | Vite는 HMR방식의 사전 번들링으로 모듈을 필요에 따라 독립적으로 빌드하고 번들링 과정이 없기 때문에 전반적인 빌드 시간이 감소, CRA보다 아주 빠름. |
| TypeScript | 런타임 오류를 사전에 방지할 수 있고, 코드의 가독성 향상과 안정성이 높고 코드의 품질을 높여줌. JS의 슈퍼셋이기 때문에 모든 기능을 제공하고, 대부분의 라이브러리도 TS를 지원함. |
| Vercel | 코드가 업데이트될 때 자동으로 빌드 및 배포 파이프라인을 실행하여 변경 사항을 신속하게 반영해주기 때문에 배포 설정 보다는 개발에 좀 더 집중할 수 있다고 생각.분산된 CDN을 사용하여 리소스를 제공하기 때문에 보다 나은 웹 환경과 로딩 속도를 제공. |
| Axios | 비동기 작업에 굉장히 간편하게 사용할 수 있으며, 효율적.response 값을 다른 설정없이 간편하게 사용할 수 있음.interceptor와 intstance를 사용하여 관리와 유지보수에 용이. |
| react-query | 타 라이브러리보다 코드의 양이 줄어 가독성 향상 및 개발에 집중할 수 있음.네트워크 데이터를 캐싱으로 성능적 측면에서 효율적.devtools로 오류나 에러시 디버깅에 용이.상태 관리와 데이터 관리 및 네트워크 요청에 지속적 동기화로 인해 씽크가 잘 맞음. |
| Framer motion | GPU가속을 지원하고 성능 최적화된 애니메이션을 지공하며, 타 라이브러리에 비해 코드양이 비교적 줄고 복잡하지 않으며, 생태계가 풍부. |
| Zustand | 보일러 플레이트 코드가 적어 직관적이고 효율적으로 코드를 작성하고 주요 로직에 집중 가능.현 프로젝트 규모에 적합한 전역상태관리 라이브러리라고 생각.컴포넌트 트리에서 필요한 상태만 가져와 사용할 수 있도록 구성  가능. 필요한 상태의 변경이 발생했을 때 해당 컴포넌트만 리렌더링되도록 최적화 가능함. |
| Styled components | JSX 공간을 비교적 깔끔하게 사용할 수 있으며, 즉시 해당 컴포넌트의 스타일 확인과 수정이 가능. 또한 props를 이용한 변환이나 이를 활용한 재사용이 자유로운 편. |

</details>

<details>
<summary><b>BE</b></summary>

| 사용기술 | 결정사유 |
| --- | --- |
| express | node.js를 사용하여 쉽게 서버를 구축할 수 있게 만든 라우팅과 미들웨어 기반인 경량형 Node.js 웹 프레임워크로 미들웨어 확장 용이하며 직관적이여서 선택함. |
| Mysql | 현 서비스에서 쓰기 작업보다 읽기 작업이 많아 읽기 전용 명령을 관리하는데 용이한 mysql을 선택. |
| S3, multer | multer를 사용하여 S3를 사용하여 쉽게 파일 업로드.대규모 파일을 안정적으로 저장하기 위해 사용. |
| Nginx | 이미지와 같은 정적 파일을 사용을 많이 하는 상황이므로 nginx를 선택함. |
| haversine | 두 좌표(위경도)의 거리차를 구하기 위해 도입. haversine보다 mysql의 GIS 쿼리를 사용했을 때 호출되는 쿼리양도 많고(호출되는 데이터도 많음), 평균 호출 속도가 느린결과로haversine 라이브러리를 사용하기로 결정. |
| EC2 | EC2는 다른 AWS 서비스들과 연계해서 사용할 수 있고, 필요한 경우에 데이터베이스(RDS), 클라우드 스토리지(S3) 등의 다양한 기능을 제공. |
| GitHub Action | 깊은 GitHub 통합으로 소스코드 저장소와 CI/CD 설정이 함께 관리가 가능하여 편리, 유연성 으로 다양한 워크 플로우 구성, 무료티어 로 인해 선택 |
| Passport | 간단하고 다양한 로그인 인증전략을 지원하고, 각종 인증 방식에 대한 복잡한 로직과 흐름을 단순화하여서 빠르게 구현할 수 있음.  그리고 다른 여러 소셜 로그인을 동일한 api로 통합해서 사용할 수 있어 선택함. |
| JSON Web Token | 서버에서 사용자의 상태를 관리하지 않고, 토큰 자체에 정보를 포함해서 사용자 인증을 빠르게 할 수 있음. 또한 JWT 토큰에 서명을 추가해서 변조를 방지할 수 있어 선택. |
| joi | 입력한 데이터의 유효성 검사를 직관적이고 간단하게 사용 하기 위해 도입함. |
| swagger | REST API 문서를 설계, 빌드하는데에 자동화하여 관리하고 협업을 위해 도입함. |

</details>

# 🎯 트러블슈팅

<details>
<summary><b>FE</b></summary>

**[VITE에서 환경변수](https://www.notion.so/VITE-1-96cfb7f0b51c468e8ebfe905f1d19e29?pvs=21)**

**[Modal에서 이벤트가 적용되지 않는 문제](https://www.notion.so/Modal-1-b4d2bd7d73ce412084cbb1beb89b2749?pvs=21)**

**[Infinite Scroll + react-query + observer intersection](https://www.notion.so/Infinite-Scroll-react-query-observer-intersection-1-f0123330ed2746c6a5a06fc1660eaaf8?pvs=21)**

**[지도에서 게시물 불러오는 기준](https://www.notion.so/1-0c73f0b0214b4e0db86f73c0295d6012?pvs=21)**

**[지도에서 api 호출 시 bounds가 입력되지 않는 문제](https://www.notion.so/api-bounds-1-3e57cc19e38e43e5b872faba6cf33644?pvs=21)**

**[Styled-components props 콘솔 에러](https://www.notion.so/Styled-components-props-1-4cac5e83013849f5afa160fd973d495e?pvs=21)**

**[구글 장소 검색 지도를 띄우지 않고 사용하기](https://www.notion.so/1-9243f2adacd441e6a8b1f49116bf9f97?pvs=21)**

**[로컬 폰트 적용시 폰트 flash 현상](https://www.notion.so/flash-1-47a5380930f04fc3b9c08ec5a9c3b067?pvs=21)**

**[배포 후 웹페이지 첫 진입시 블랙아웃 현상](https://www.notion.so/1-ee17615ff90643a1868d840809e69014?pvs=21)**

**[scrollIntoView 크롬에서 적용되지 않는 문제](https://www.notion.so/scrollIntoView-1-63e37ba820af4aa9bc21267005007cb4?pvs=21)**

**[좋아요 낙관적 업데이트 적용하기](https://www.notion.so/1-567310c4d04e4fae8130ec178a0b3928?pvs=21)**

**[배포시 폰트가 적용되지 않는 문제](https://www.notion.so/1-52780c0e7d60497eb333b6db406e7960?pvs=21)**

**[폰트 최적화](https://www.notion.so/1-b4a08392647d47ac8c9126c292cf6dde?pvs=21)**

**[배너 이미지 최적화](https://www.notion.so/1-dfc1ca27daf84c1fbb05eaad50220eae?pvs=21)**

**[캐러셀 이미지 최적화 - lazy loading](https://www.notion.so/lazy-loading-1-51fd7f8dbfa44b02ba6fb78d6b439913?pvs=21)**

**[코드 스플리팅 React.lazy 적용하기](https://www.notion.so/React-lazy-1-aacb7549916c458eb732c0bd65a8497d?pvs=21)**

**[검색엔진 최적화 적용해보기](https://www.notion.so/1-d5666b8d493649048b06513ce49ec3a9?pvs=21)**

**[검색 debounce 적용하기](https://www.notion.so/debounce-1-219554217f1f4afdb354f7cbc814cf4b?pvs=21)**

**[긴 리스트를 다루는 방법 - virtuoso 적용하기](https://www.notion.so/virtuoso-1-3a137d20766a4e2ba4e67dea69c4833e?pvs=21)**

</details>

<details>
<summary><b>BE</b></summary>


**[지도페이지 에러 발생](https://www.notion.so/BE-c45556f709bc422eacb93d37bb97dfd8?pvs=21)**

**[Refresh token과 Access token이 같아지는 문제](https://www.notion.so/BE-Refresh-token-Access-token-875a05e41d65466ea09b614501cf0e4b?pvs=21)**

**[로드 밸런싱을 위해 여러대의 ec2 인스턴스에 같은 도메인으로 연결하려고 할 때의 SSL/TLS 인증서 문제가 발생](https://www.notion.so/BE-ec2-SSL-TLS-b70168ed15e74de48278227e1629abea?pvs=21)**

**[comments, replies ValidatIon 오류 (gitbash)](https://www.notion.so/BE-comments-replies-ValidatIon-gitbash-a164f59f265848b2afdbecc45a3c26f0?pvs=21)**

**[Nginx 최신버전 설치 도중 포트번호 충돌오류 (gitbash)](https://www.notion.so/BE-Nginx-gitbash-ec107e7db4ca45749ee660934d3a0165?pvs=21)**

**[프로필 사진 수정 시 타 유저의 프로필 사진도 같이 변경](https://www.notion.so/BE-d67b2bbff08a4e6688a88f040361febc?pvs=21)**

**[코드를 수정했는데 변경사항이 서버에 반영이 안되는 문제가 발생](https://www.notion.so/BE-903926b36d3e480da923ace56d671c53?pvs=21)**

</details>
