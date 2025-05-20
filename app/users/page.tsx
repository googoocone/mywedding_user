"use client";

import { useState, useEffect, FormEvent, useContext, ChangeEvent } from "react";
import { AuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link"; // 약관 보기 링크용

const regionOptions = [
  "서울",
  "부산",
  "대구",
  "인천",
  "광주",
  "대전",
  "울산",
  "세종",
  "경기",
  "강원",
  "충북",
  "충남",
  "전북",
  "전남",
  "경북",
  "경남",
  "제주",
];

export default function MyPage() {
  const router = useRouter();
  const { user, fetchUser }: any = useContext(AuthContext);

  // Form state
  const [isLoaded, setIsLoaded] = useState(false);
  const [nickname, setNickname] = useState("");
  const [nicknameError, setNicknameError] = useState("");
  const [isNicknameChecking, setIsNicknameChecking] = useState(false);
  const [nicknameAvailable, setNicknameAvailable] = useState(false);
  const [hasExistingNickname, setHasExistingNickname] = useState(false);

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const [weddingDate, setWeddingDate] = useState("");
  const [isWeddingDateUndecided, setIsWeddingDateUndecided] = useState(false);
  const [weddingRegion, setWeddingRegion] = useState("");
  const [weddingBudget, setWeddingBudget] = useState("");
  const [estimatedGuests, setEstimatedGuests] = useState("");

  // 🔽 약관 동의 상태 추가
  const [agreedToPrivacyPolicy, setAgreedToPrivacyPolicy] = useState(false);
  const [agreedToTermsOfService, setAgreedToTermsOfService] = useState(false);
  const [agreedToMarketing, setAgreedToMarketing] = useState(false);

  // Load existing info (기존 로직 유지)
  useEffect(() => {
    async function fetchInfo() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/wedding-info`,
          { credentials: "include" }
        );
        if (res.ok) {
          const data = await res.json();
          if (data.nickname && data.nickname.trim() !== "") {
            setNickname(data.nickname);
            setHasExistingNickname(true);
            setNicknameAvailable(true);
            setNicknameError("");
          } else {
            setNickname("");
            setHasExistingNickname(false);
            setNicknameAvailable(false);
          }
          setEmail(data.email || "");
          if (data.weddingDate) {
            setWeddingDate(data.weddingDate);
            setIsWeddingDateUndecided(false);
          } else {
            setWeddingDate("");
            setIsWeddingDateUndecided(true);
          }
          setWeddingRegion(data.weddingRegion || "");
          setWeddingBudget(data.weddingBudget?.toString() || "");
          setEstimatedGuests(data.estimatedGuests?.toString() || "");

          // 🔽 기존 사용자의 약관 동의 정보도 불러와서 상태에 설정 (백엔드에서 해당 정보 제공 시)
          setAgreedToPrivacyPolicy(data.agreedToPrivacyPolicy || false);
          setAgreedToTermsOfService(data.agreedToTermsOfService || false);
          setAgreedToMarketing(data.agreedToMarketing || false);
        } else {
          setHasExistingNickname(false);
          if (user && user.email) {
            setEmail(user.email);
          }
        }
      } catch (err) {
        console.error("Failed to load user info", err);
        setHasExistingNickname(false);
        if (user && user.email) {
          setEmail(user.email);
        }
      } finally {
        setIsLoaded(true);
      }
    }
    if (user !== undefined) {
      fetchInfo();
    }
  }, [user]);

  // Validation 함수들 (기존 로직 유지)
  const validateNickname = (value: string) => {
    if (!value && !hasExistingNickname) {
      setNicknameError("닉네임을 입력해주세요.");
      return false;
    }
    if (value.length >= 10) {
      setNicknameError("닉네임은 10글자 미만으로 입력해주세요.");
      return false;
    }
    if (
      !hasExistingNickname ||
      (hasExistingNickname && nicknameError !== "사용 가능한 닉네임입니다.")
    ) {
      setNicknameError("");
    }
    return true;
  };

  const validateEmail = (value: string) => {
    if (!value) {
      setEmailError("이메일을 입력해주세요.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setEmailError("올바른 이메일 형식이 아닙니다.");
      return false;
    }
    setEmailError("");
    return true;
  };

  const handleNicknameCheck = async () => {
    // (기존 로직 유지)
    if (hasExistingNickname || !validateNickname(nickname)) return;
    setIsNicknameChecking(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/check-nickname`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ nickname }),
        }
      );
      const { available } = await res.json();
      setNicknameAvailable(available);
      setNicknameError(
        available ? "사용 가능한 닉네임입니다." : "이미 사용 중인 닉네임입니다."
      );
    } catch (e) {
      console.error(e);
      setNicknameError("닉네임 중복 확인 중 오류가 발생했습니다.");
    } finally {
      setIsNicknameChecking(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const isNicknameFormatValid = validateNickname(nickname);
    if (hasExistingNickname) {
      if (!isNicknameFormatValid) {
        alert("기존 닉네임 형식이 올바르지 않습니다. 관리자에게 문의하세요.");
        return;
      }
    } else {
      if (!isNicknameFormatValid || !nicknameAvailable) {
        alert("닉네임을 확인해주세요. (형식 오류 또는 중복확인 필요)");
        return;
      }
    }

    const isEmailValid = validateEmail(email);
    if (!isEmailValid) {
      alert("이메일을 확인해주세요.");
      return;
    }
    if (!weddingRegion || (!isWeddingDateUndecided && !weddingDate)) {
      alert("필수 정보를 모두 입력해주세요. (웨딩 예정일, 웨딩 예정 지역)");
      return;
    }

    // 🔽 필수 약관 동의 확인
    if (!agreedToPrivacyPolicy) {
      alert("개인정보처리방침에 동의해주세요.");
      return;
    }
    if (!agreedToTermsOfService) {
      alert("서비스 이용약관에 동의해주세요.");
      return;
    }

    const payload = {
      nickname,
      email,
      weddingDate: isWeddingDateUndecided ? null : weddingDate,
      weddingRegion,
      weddingBudget: weddingBudget ? parseInt(weddingBudget, 10) : null,
      estimatedGuests: estimatedGuests ? parseInt(estimatedGuests, 10) : null,
      // 🔽 약관 동의 정보 payload에 추가
      agreedToPrivacyPolicy,
      agreedToTermsOfService,
      agreedToMarketing,
      // ✨ 백엔드에서는 이 정보와 함께 동의 시각, 약관 버전 등을 함께 저장하는 것이 좋습니다.
    };

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/wedding-info`, // 이 URL은 예시입니다.
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "정보 저장에 실패했습니다.");
      }
      await fetchUser();
      alert("정보가 성공적으로 저장되었습니다.");
      router.push("/");
    } catch (err: any) {
      console.error("저장 실패", err);
      alert(err.message || "정보 저장에 실패했습니다.");
    }
  };

  if (!isLoaded)
    return (
      <div className="flex justify-center items-center min-h-screen">
        로딩 중...
      </div>
    );

  return (
    <div className="w-full h-full py-8 px-4 sm:px-6 lg:px-8 mt-20 sm:mt-30">
      <div className="max-w-2xl mx-auto bg-white srounded-lg p-6 sm:p-10">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-2 text-center text-gray-800">
          내 정보 입력
        </h1>
        <h2 className="text-center text-lg mb-3 text-gray-600 ">
          <span className="text-[#F6969A] font-bold">MyWeddingDiary</span>에서
          딱 맞는 웨딩홀을 찾아서 알려드릴게요😘
        </h2>
        <div className="w-[490px] mx-auto h-[1px] bg-gray-300 mb-10 sm:mb-15 "></div>{" "}
        {/* mb-15 -> mb-10 sm:mb-15 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ... (닉네임, 이메일, 웨딩일정, 지역, 예산, 인원 입력 필드들은 기존과 동일) ... */}
          {/* 닉네임 */}
          <div>
            <label
              htmlFor="nickname"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              닉네임 <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                id="nickname"
                type="text"
                value={nickname}
                onChange={(e) => {
                  if (hasExistingNickname) return;
                  setNickname(e.target.value);
                  setNicknameAvailable(false);
                  validateNickname(e.target.value);
                }}
                onBlur={() => {
                  if (hasExistingNickname) return;
                  validateNickname(nickname);
                }}
                disabled={hasExistingNickname}
                className={`flex-grow px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                  hasExistingNickname
                    ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                    : nicknameError &&
                      nicknameError !== "사용 가능한 닉네임입니다."
                    ? "border-red-500"
                    : nicknameAvailable
                    ? "border-green-500"
                    : "border-gray-300"
                }`}
                required
              />
              <button
                type="button"
                onClick={handleNicknameCheck}
                disabled={
                  hasExistingNickname ||
                  isNicknameChecking ||
                  !nickname ||
                  (nicknameError !== "" &&
                    nicknameError !== "사용 가능한 닉네임입니다." &&
                    nicknameError !== "이미 사용 중인 닉네임입니다.")
                }
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isNicknameChecking ? "확인중..." : "중복확인"}
              </button>
            </div>
            {nicknameError && (
              <p
                className={`mt-1 text-sm ${
                  nicknameError === "사용 가능한 닉네임입니다."
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {nicknameError}
              </p>
            )}
            {hasExistingNickname && (
              <p className="mt-1 text-sm text-gray-500">
                닉네임은 변경할 수 없습니다.
              </p>
            )}
          </div>

          {/* 이메일 */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              이메일 <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => validateEmail(email)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                emailError ? "border-red-500" : "border-gray-300"
              }`}
              required
            />
            {emailError && (
              <p className="mt-1 text-sm text-red-600">{emailError}</p>
            )}
          </div>

          {/* 웨딩 예정일 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              웨딩 예정일 <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-4">
              <input
                type="date"
                value={weddingDate}
                onChange={(e) => setWeddingDate(e.target.value)}
                disabled={isWeddingDateUndecided}
                className="px-3 py-2 border rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-50"
              />
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={isWeddingDateUndecided}
                  onChange={() => {
                    const newIsUndecided = !isWeddingDateUndecided;
                    setIsWeddingDateUndecided(newIsUndecided);
                    if (newIsUndecided) {
                      setWeddingDate("");
                    }
                  }}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />{" "}
                미정
              </label>
            </div>
            {!isWeddingDateUndecided && !weddingDate && (
              <p className="mt-1 text-sm text-red-600">
                웨딩 예정일을 선택하거나 미정으로 표시해주세요.
              </p>
            )}
          </div>

          {/* 웨딩 예정 지역 */}
          <div>
            <label
              htmlFor="weddingRegion"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              웨딩 예정 지역 <span className="text-red-500">*</span>
            </label>
            <select
              id="weddingRegion"
              value={weddingRegion}
              onChange={(e) => setWeddingRegion(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            >
              <option value="">지역 선택</option>
              {regionOptions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
            {!weddingRegion && (
              <p className="mt-1 text-sm text-red-600">
                웨딩 예정 지역을 선택해주세요.
              </p>
            )}
          </div>

          {/* 예산 및 인원 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="weddingBudget"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                예산(만원)
              </label>
              <input
                id="weddingBudget"
                type="number"
                value={weddingBudget}
                onChange={(e) => {
                  const rawValue = e.target.value;
                  let sanitizedValue = rawValue.replace(/[^0-9]/g, "");
                  if (sanitizedValue === "") {
                    setWeddingBudget("");
                  } else {
                    const numericValue = parseInt(sanitizedValue, 10);
                    const maxValue = 100000;
                    if (numericValue > maxValue) {
                      setWeddingBudget(maxValue.toString());
                    } else {
                      setWeddingBudget(sanitizedValue);
                    }
                  }
                }}
                placeholder="예) 3000 (최대 100,000)"
                className="w-full px-3 py-2 border rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="estimatedGuests"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                예상 참석 인원(명)
              </label>
              <input
                id="estimatedGuests"
                type="number"
                value={estimatedGuests}
                onChange={(e) => {
                  const rawValue = e.target.value;
                  let sanitizedValue = rawValue.replace(/[^0-9]/g, "");
                  setEstimatedGuests(sanitizedValue);
                }}
                placeholder="예) 250"
                className="w-full px-3 py-2 border rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          {/* 🔽 약관 동의 UI 추가 */}
          <div className="space-y-4 border-t border-gray-200 pt-6 mt-8">
            {" "}
            {/* 구분선 및 상단 여백 추가 */}
            <div>
              <label htmlFor="privacyPolicy" className="flex items-start">
                <input
                  id="privacyPolicy"
                  type="checkbox"
                  checked={agreedToPrivacyPolicy}
                  onChange={(e) => setAgreedToPrivacyPolicy(e.target.checked)}
                  className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mt-0.5"
                />
                <span className="ml-3 text-sm text-gray-700">
                  <span className="font-medium text-red-500">[필수]</span>{" "}
                  개인정보처리방침에 동의합니다.
                  <Link href="/contract/privacy-policy" legacyBehavior>
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-xs text-indigo-600 hover:text-indigo-500 underline"
                    >
                      내용 보기
                    </a>
                  </Link>
                </span>
              </label>
            </div>
            <div>
              <label htmlFor="termsOfService" className="flex items-start">
                <input
                  id="termsOfService"
                  type="checkbox"
                  checked={agreedToTermsOfService}
                  onChange={(e) => setAgreedToTermsOfService(e.target.checked)}
                  className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mt-0.5"
                />
                <span className="ml-3 text-sm text-gray-700">
                  <span className="font-medium text-red-500">[필수]</span>{" "}
                  서비스 이용약관에 동의합니다.
                  <Link href="/contract/terms-of-service" legacyBehavior>
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-xs text-indigo-600 hover:text-indigo-500 underline"
                    >
                      내용 보기
                    </a>
                  </Link>
                </span>
              </label>
            </div>
            <div>
              <label htmlFor="marketingConsent" className="flex items-start">
                <input
                  id="marketingConsent"
                  type="checkbox"
                  checked={agreedToMarketing}
                  onChange={(e) => setAgreedToMarketing(e.target.checked)}
                  className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mt-0.5"
                />
                <span className="ml-3 text-sm text-gray-700">
                  <span className="font-medium text-gray-500">[선택]</span>{" "}
                  마케팅 정보 수신에 동의합니다. (이벤트, 프로모션 등)
                </span>
              </label>
              <p className="ml-8 text-xs text-gray-500 mt-1">
                동의하지 않으셔도 서비스 이용에 제한이 없으나, 유용한 정보 및
                혜택을 받지 못할 수 있습니다.
              </p>
            </div>
          </div>
          {/* 🔼 약관 동의 UI 종료 */}

          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-lg font-semibold mt-8" // 상단 여백 추가
          >
            정보 저장하고 할인견적 보기
          </button>
        </form>
      </div>
    </div>
  );
}
