import { CiCalculator1 } from "react-icons/ci";

export default function Calculator() {
  return (
    <div className="w-[400px] h-[500px] rounded-xl border border-gray-400 mt-4 p-5">
      <div className="w-full flex items-center justify-between text-2xl mb-2">
        <div className="font-semibold">할인 견적서</div>
        <CiCalculator1 className="text-2xl" />
      </div>
      <div className="text-sm text-gray-500 mb-2">
        ❤️다른 분들이 받은 할인 견적
      </div>
      <div className="w-full border border-gray-200"></div>
      <div></div>
      <div></div>
    </div>
  );
}
