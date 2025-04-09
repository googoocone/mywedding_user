import Image from "next/image";

export default function HallCard({ data }: any) {
  return (
    <div className="sm:max-w-[350px] w-full h-[515px] px-4 sm:p-0">
      <div className="w-full h-[350px] relative rounded-xl my-1 bg-gray-100">
        {/* <Image
          fill
          src={data.images[0]}
          alt={data.name}
          style={{ objectFit: "cover" }}
          className="rounded-xl"
        ></Image> */}
      </div>
      <div className="text-lg text-gray-500">
        {data.locationType[0] + " " + data.locationType[1]}
      </div>
      <div className="text-2xl font-semibold my-1">{data.name}</div>
      <div className="line-clamp-3 text-sm text-gray-500">
        {data.description}
      </div>
      <div className="flex gap-2 items-center justify-start my-1 text-gray-400">
        {data.tags.map((tag: string) => (
          <div key={tag}>#{tag}</div>
        ))}
      </div>
    </div>
  );
}
