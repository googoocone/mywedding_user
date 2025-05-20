"use client";

import { RiKakaoTalkFill } from "react-icons/ri";
import { loginWithKakao } from "@/lib/auth/loginWithKakao";
import { useContext, useEffect } from "react"; // useEffect와 useContext 추가
import { useRouter } from "next/navigation"; // next/navigation에서 useRouter 사용 (App Router 기준)
import { AuthContext } from "@/context/AuthContext"; // AuthContext 경로를 실제 프로젝트에 맞게 수정해주세요.

export default function SignInPage() {
  const router = useRouter();
  // AuthContext에서 user와 isLoading 상태를 가져온다고 가정합니다.
  // 실제 AuthContext의 구조에 따라 타입 단언이나 옵셔널 체이닝을 조정해야 할 수 있습니다.
  const authContext = useContext(AuthContext);
  const user = authContext?.user;
  const isLoading = authContext?.isLoading; // AuthContext에 isLoading 상태가 있다고 가정

  useEffect(() => {
    // isLoading 상태가 명시적으로 false (인증 상태 확인 완료)이고,
    // user 객체가 존재하면 (로그인 된 상태)
    if (isLoading === false && user) {
      console.log(
        "SignInPage: 이미 로그인된 사용자입니다. 홈페이지로 리다이렉션합니다."
      );
      router.replace("/"); // 홈페이지로 리다이렉션합니다. 뒤로가기 시 로그인 페이지로 돌아오지 않도록 replace 사용.
    }
  }, [user, isLoading, router]);

  // 로딩 중이거나, (로딩이 끝났고) 이미 user가 있어서 리다이렉션 될 예정이라면
  // 실제 페이지 내용 대신 로딩 표시를 합니다.
  if (isLoading || (isLoading === false && user)) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-600">잠시만 기다려주세요...</p>
        {/* 또는 여기에 로딩 스피너 컴포넌트를 사용할 수 있습니다. */}
      </div>
    );
  }

  // 로딩이 완료되었고, 사용자가 로그인하지 않은 경우에만 아래 UI를 렌더링합니다.
  return (
    <div className="max-w-xl mt-20 sm:mt-40 mx-auto pt-10 pb-24 px-4">
      {/* 상단 마진 및 좌우 패딩 조정 */}
      <div className="flex flex-col gap-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-center text-gray-800">
          로그인 또는 회원가입
        </h1>
        <hr className="w-48 sm:w-full max-w-[300px] mx-auto border-b-gray-300"></hr>
        {/* 너비 조정 */}
        <div className="text-center text-md sm:text-lg md:text-xl font-semibold text-gray-700">
          {/* 텍스트 크기 조정 */}
          <span className="text-[#F6969A] font-bold">My Wedding Diary</span>에
          오신것을 환영합니다.
        </div>
      </div>
      <div className="text-center text-xs sm:text-sm text-gray-500 mt-3 mb-12">
        {/* 마진 조정 */}
        SNS 계정을 이용해서 로그인 또는 회원가입을 해주세요.
      </div>
      <div className="flex flex-col gap-5">
        <button
          type="button"
          onClick={() => {
            loginWithKakao();
          }}
          className="relative w-full max-w-[500px] mx-auto flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-3 px-4 text-sm sm:text-base hover:bg-yellow-400 hover:border-yellow-500 transition-colors duration-200 text-gray-800 font-medium cursor-pointer shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50"
        >
          <RiKakaoTalkFill className="text-2xl text-[#3A1D1D]" />
          <span>카카오 로그인 하기</span>
        </button>
      </div>
    </div>
  );
}
