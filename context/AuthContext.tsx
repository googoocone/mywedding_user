"use client";
import {
  createContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";

// 사용자 정보 타입 (실제 사용자 객체의 구조에 맞게 필드를 정의해주세요)
interface User {
  id: string | number; // 예시 필드
  name: string; // 예시 필드
  email: string; // 예시 필드
  // ... 기타 필요한 사용자 정보
}

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  fetchUser: () => Promise<void>;
  isLoading: boolean; // 인증 상태 로딩 여부를 나타내는 상태
}

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // 초기 상태는 로딩 중

  // fetchUser 함수를 useCallback으로 감싸서 불필요한 재생성을 방지합니다.
  // (환경 변수는 빌드 시점에 고정되므로 의존성 배열에 넣지 않아도 됩니다.)
  const fetchUser = useCallback(async () => {
    // setIsLoading(true); // fetchUser가 여러 번 호출될 수 있다면 여기서 true로 설정하는 것이 안전합니다.
    // 하지만 초기 마운트 시에만 호출되므로, useState의 초기값으로 충분합니다.
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/me`,
        {
          credentials: "include", // 쿠키 전송을 위해 필요
        }
      );

      if (!res.ok) {
        // 인증되지 않았거나 서버 오류 시 사용자 상태를 null로 설정
        setUser(null);
        // console.error("인증 실패 또는 서버 오류:", res.status, await res.text()); // 디버깅용
      } else {
        const data = await res.json();
        // 백엔드 응답에서 실제 사용자 객체가 data.user에 있는지, 아니면 data 자체가 사용자인지 확인 필요
        // 예시: data가 { user: { id: ..., name: ... } } 형태라면 data.user 사용
        // 예시: data가 { id: ..., name: ... } 형태라면 data 사용
        setUser(data.user || data || null); // 응답 구조에 따라 유연하게 대처, 없으면 null
      }
    } catch (error) {
      // 네트워크 오류 등 fetch 자체가 실패한 경우
      console.error("사용자 정보 로드 중 오류 발생:", error);
      setUser(null);
    } finally {
      // API 요청이 성공하든 실패하든 로딩 상태는 완료됨
      setIsLoading(false);
    }
  }, []); // 의존성 배열이 비어있음 (fetchUser는 환경변수에만 의존)

  useEffect(() => {
    fetchUser(); // 컴포넌트 마운트 시 사용자 정보 요청
  }, [fetchUser]); // fetchUser가 useCallback으로 메모이즈되었으므로 안전

  return (
    <AuthContext.Provider value={{ user, setUser, fetchUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
