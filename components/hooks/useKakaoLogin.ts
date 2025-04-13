// "use client";

// import { useAuth } from "@/context/AuthContext";
// import { useSession, signIn } from "next-auth/react";
// import { useEffect, useRef } from "react";

// export const useKakaoLogin = () => {
//   const { data: session } = useSession();
//   const { isAuthenticated, refreshToken } = useAuth();
//   const isProcessingRef = useRef(false);
//   const loginSuccessRef = useRef(false);

//   // 쿠키 확인 함수
//   const checkCookies = () => {
//     console.log("현재 브라우저 쿠키:", document.cookie);
//     return document.cookie.includes("access_token") || document.cookie.includes("refresh_token");
//   };

//   // NextAuth 세션이 변경될 때 실행
//   useEffect(() => {
//     const handleAuthSession = async () => {
//       // 이미 인증되었거나 처리 중이면 스킵
//       if (isAuthenticated || isProcessingRef.current) return;
//       isProcessingRef.current = true;

//       if (session?.accessToken) {
//         try {
//           console.log("세션 토큰으로 Firebase 토큰 요청");
//           // Firebase 토큰 요청
//           const firebaseRes = await fetch("/api/auth/firebase-token", {
//             method: "POST",
//             headers: { 
//               "Content-Type": "application/json"
//             },
//             body: JSON.stringify({ kakaoAccessToken: session.accessToken }),
//             credentials: "include" // 쿠키 포함
//           });

//           if (!firebaseRes.ok) {
//             throw new Error("Firebase 토큰 발급 실패");
//           }

//           const data = await firebaseRes.json();
//           console.log("서버 로그인 응답:", data);
          
//           // 쿠키 확인
//           console.log("서버 로그인 후 쿠키 확인:", checkCookies());
          
//           // 로그인 성공 플래그 설정
//           loginSuccessRef.current = true;
          
//           // 쿠키가 설정되었는지 확인 후 사용자 정보 요청
//           setTimeout(() => {
//             console.log("지연 후 쿠키 확인:", checkCookies());
            
//             // 사용자 정보를 가져오기 위해 직접 /auth/me 호출
//             fetch("http://localhost:8000/auth/me", {
//               method: "GET",
//               credentials: "include", // 쿠키 포함
//               headers: {
//                 "Content-Type": "application/json"
//               },
//               mode: "cors" // 크로스 오리진 요청 명시
//             })
//             .then(res => {
//               console.log("사용자 정보 응답 상태:", res.status);
//               console.log("사용자 정보 요청 헤더:", res.headers);
//               return res.ok ? res.json() : Promise.reject(`상태 코드: ${res.status}`);
//             })
//             .then(userData => {
//               console.log("사용자 정보 조회 성공:", userData);
//             })
//             .catch(err => {
//               console.error("사용자 정보 조회 실패:", err);
//               console.log("현재 쿠키:", document.cookie);
//             });
//           }, 1000); // 1초 후에 요청
          
//         } catch (err) {
//           console.error("❌ 인증 프로세스 에러:", err);
//         } finally {
//           isProcessingRef.current = false;
//         }
//       } else {
//         isProcessingRef.current = false;
//       }
//     };

//     handleAuthSession();
//   }, [session, isAuthenticated, refreshToken]);

//   // 카카오 로그인 함수
//   const handleKakaoLogin = () => {
//     signIn("kakao", { callbackUrl: "/" });
//   };

//   return { handleKakaoLogin };
// }; 