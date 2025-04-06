export default function HeaderSection({ data }: any) {
  return (
    <div className="w-full flex flex-col items-start justify-center">
      <div className="text-xl font-medium text-gray-500 mb-2">
        {data.locationType[0] + data.locationType[1]}
      </div>
      <div className="text-3xl font-bold mb-2">{data.name}</div>
      <div className="text-sm text-gray-500 mb-4">{data.description}</div>
      <div className=" w-full border-b border-gray-400 mb-4"></div>
    </div>
  );
}
