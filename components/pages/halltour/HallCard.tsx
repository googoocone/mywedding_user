"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function HallCard({ data }: any) {
  const router = useRouter();

  const handleClick = () => {
    // data 객체에 selected_hall이 있고, 그selected_hall에 id가 있는지 확인

    const companyId = data.halls[0].wedding_company_id; // ✅ selected_hall의 id를 가져옵니다.
    const targetUrl = `/halltour/${companyId}`; // ✅ 이동할 페이지 URL을 hallId를 포함하여 만듭니다.
    console.log(`Navigating to: ${targetUrl}`); // 디버그용 출력
    router.push(targetUrl); // ✅ 해당 URL로 페이지 이동을 시작합니다.
  };

  console.log(data);
  let address = data.address.split(" ");
  return (
    <div
      onClick={handleClick}
      className="sm:max-w-[350px] w-full h-[515px] px-4 sm:p-0 cursor-pointer"
    >
      <div className="w-full h-[350px] relative rounded-xl my-1 bg-gray-100 overflow-hidden ">
        <Image
          fill
          src={data.halls[0].hall_photos[0].url}
          alt={data.name}
          style={{ objectFit: "cover" }}
          className="rounded-xl hover:transition-all hover:scale-105 duration-500"
        ></Image>
      </div>
      <div className="text-lg text-gray-500">
        {address[0] + " " + address[1]}
      </div>
      <div className="text-2xl font-semibold my-1">{data.name}</div>
      <div className="flex items-center justify-start gap-1 text-sm text-gray-500">
        {data.halls.map((hall: any) => (
          <div>#{hall.name}</div>
        ))}
      </div>
      <div className="flex gap-2 items-center justify-end">
        <button className="px-2 py-1.5">상세견적서 보기</button>
      </div>
    </div>
  );
}
