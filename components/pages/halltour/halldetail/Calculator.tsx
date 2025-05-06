import { CiCalculator1 } from "react-icons/ci";

export default function Calculator() {
  return (
    <div className="w-[400px] h-[500px] rounded-xl border border-gray-400 mt-4 p-5">
      <div className="w-full flex items-center justify-between text-2xl mb-2">
        <div className="font-semibold">견적서 계산기</div>
        <CiCalculator1 className="text-2xl" />
      </div>
      <div className="text-sm text-gray-500 mb-2">❤️나의 웨딩 견적은 얼마?</div>
      <div className="w-full border border-gray-200"></div>
      <div></div>
      <div></div>
    </div>
  );
}
