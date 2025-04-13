// "use client";
// import React, {
//   createContext,
//   useContext,
//   useState,
//   useEffect,
//   ReactNode,
// } from "react";
// import axios from "axios";

// interface User {
//   id: string;
//   name: string;
//   email?: string;
//   profile_image?: string;
//   // 필요한 필드 더 추가하세요
// }

// interface AuthContextType {
//   accessToken: string | null;
//   setAccessToken: React.Dispatch<React.SetStateAction<string | null>>;
//   user: User | null;
//   refreshToken: () => Promise<string | null>;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// interface AuthProviderProps {
//   children: ReactNode;
// }

// export const AuthProvider = ({ children }: AuthProviderProps) => {
//   const [accessToken, setAccessToken] = useState<string | null>(null);
//   const [user, setUser] = useState<User | null>(null);

//   console.log("accessToken", accessToken);

//   useEffect(() => {
//     if (accessToken) {
//       axios
//         .get("http://localhost:8000/api/v1/auth/me", {
//           headers: { Authorization: `Bearer ${accessToken}` },
//           withCredentials: true,
//         })
//         .then((res) => {
//           if (res.data.code === 200 && res.data.data) {
//             setUser(res.data.data);
//           }
//         })
//         .catch((err) => {
//           console.error("사용자 정보 조회 에러:", err);
//         });
//     }
//   }, [accessToken]);

//   const refreshToken = async () => {
//     try {
//       const response = await axios.post(
//         "http://localhost:8000/api/v1/auth/refresh",
//         {},
//         { withCredentials: true }
//       );
//       if (response.data.code === 200 && response.data.data) {
//         const newToken = response.data.data.access_token;
//         setAccessToken(newToken);
//         return newToken;
//       }
//     } catch (error) {
//       console.error("Refresh token 요청 에러:", error);
//       return null;
//     }
//   };

//   return (
//     <AuthContext.Provider
//       value={{ accessToken, setAccessToken, user, refreshToken }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = (): AuthContextType => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// };
