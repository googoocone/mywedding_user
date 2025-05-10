"use client";

import { useState, useEffect, FormEvent, useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const hallTypeOptions = ["컨벤션", "호텔", "가든", "스몰", "하우스", "야외"];
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

  const [weddingDate, setWeddingDate] = useState("");
  const [isWeddingDateUndecided, setIsWeddingDateUndecided] = useState(false);
  const [weddingRegion, setWeddingRegion] = useState("");
  const [weddingBudget, setWeddingBudget] = useState("");
  const [estimatedGuests, setEstimatedGuests] = useState("");
  const [preferredHallType, setPreferredHallType] = useState("");
  console.log("ninameError", nicknameError);
  // Load existing info
  useEffect(() => {
    async function fetchInfo() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/wedding-info`,
          { credentials: "include" }
        );
        if (res.ok) {
          const data = await res.json();
          setNickname(data.nickname);
          if (data.weddingDate) {
            setWeddingDate(data.weddingDate);
          } else {
            setIsWeddingDateUndecided(true);
          }
          setWeddingRegion(data.weddingRegion);
          setWeddingBudget(data.weddingBudget?.toString() || "");
          setEstimatedGuests(data.estimatedGuests?.toString() || "");
          setPreferredHallType(data.preferredHallType || "");
        }
      } catch (err) {
        console.error("Failed to load user info", err);
      } finally {
        setIsLoaded(true);
      }
    }
    fetchInfo();
  }, []);

  // Validation
  const validateNickname = (value: string) => {
    if (!value) {
      setNicknameError("닉네임을 입력해주세요.");
      return false;
    }
    if (value.length >= 10) {
      setNicknameError("닉네임은 10글자 미만으로 입력해주세요.");
      return false;
    }
    setNicknameError("");
    return true;
  };

  const handleNicknameCheck = async () => {
    if (!validateNickname(nickname)) return;
    setIsNicknameChecking(true);
    try {
      console.log("nickname", nickname);
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
    } finally {
      setIsNicknameChecking(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateNickname(nickname) || !nicknameAvailable) {
      alert("닉네임을 확인해주세요.");
      return;
    }
    if (!weddingRegion || (!isWeddingDateUndecided && !weddingDate)) {
      alert("필수 정보를 모두 입력해주세요.");
      return;
    }
    const payload = {
      nickname,
      weddingDate: isWeddingDateUndecided ? null : weddingDate,
      weddingRegion,
      weddingBudget: weddingBudget ? parseInt(weddingBudget, 10) : null,
      estimatedGuests: estimatedGuests ? parseInt(estimatedGuests, 10) : null,
      preferredHallType,
    };
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/wedding-info`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) throw new Error(await res.text());
      await fetchUser();
      router.push("/");
    } catch (err) {
      console.error("저장 실패", err);
      alert("정보 저장에 실패했습니다.");
    }
  };

  if (!isLoaded) return <div>로딩 중...</div>;

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 mt-30">
      <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-lg p-6 sm:p-10">
        <h1 className="text-2xl font-bold mb-6">내 정보 입력</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 닉네임 */}
          <div>
            <label className="block text-sm font-medium mb-1">닉네임 *</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                onBlur={() => validateNickname(nickname)}
                className={`flex-grow px-3 py-2 border rounded ${
                  nicknameError == "사용 가능한 닉네임입니다."
                    ? "border-green-500"
                    : "border-red-500"
                }`}
              />
              <button
                type="button"
                onClick={handleNicknameCheck}
                disabled={isNicknameChecking}
                className="px-4 py-2 bg-indigo-600 text-white rounded"
              >
                {isNicknameChecking ? "확인중..." : "중복확인"}
              </button>
            </div>
            {nicknameError && (
              <p
                className={`mt-1 text-sm ${
                  nicknameError == "사용 가능한 닉네임입니다."
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {nicknameError}
              </p>
            )}
          </div>
          {/* 웨딩 예정일 */}
          <div>
            <label className="block text-sm font-medium mb-1">
              웨딩 예정일 *
            </label>
            <div className="flex items-center gap-4">
              <input
                type="date"
                value={weddingDate}
                onChange={(e) => setWeddingDate(e.target.value)}
                disabled={isWeddingDateUndecided}
                className="px-3 py-2 border rounded border-gray-300"
              />
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isWeddingDateUndecided}
                  onChange={() => setIsWeddingDateUndecided((prev) => !prev)}
                />
                미정
              </label>
            </div>
          </div>
          {/* 웨딩 예정 지역 */}
          <div>
            <label
              htmlFor="weddingRegion"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              웨딩 예정 지역
            </label>
            <select
              id="weddingRegion"
              value={weddingRegion}
              onChange={(e) => setWeddingRegion(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">지역 선택</option>
              {regionOptions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>
          {/* 예산 및 인원 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                예산(만원)
              </label>
              <input
                type="text"
                value={weddingBudget}
                onChange={(e) => setWeddingBudget(e.target.value)}
                className="w-full px-3 py-2 border rounded border-gray-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                예상 참석 인원
              </label>
              <input
                type="number"
                value={estimatedGuests}
                onChange={(e) => setEstimatedGuests(e.target.value)}
                className="w-full px-3 py-2 border rounded border-gray-300"
              />
            </div>
          </div>
          {/* 선호 타입 */}
          <div>
            <label className="block text-sm font-medium mb-1">
              선호 웨딩홀 타입
            </label>
            <select
              value={preferredHallType}
              onChange={(e) => setPreferredHallType(e.target.value)}
              className="w-full px-3 py-2 border rounded border-gray-300"
            >
              <option value="">타입 선택</option>
              {hallTypeOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 text-white rounded"
          >
            정보 저장하기
          </button>
        </form>
      </div>
    </div>
  );
}
