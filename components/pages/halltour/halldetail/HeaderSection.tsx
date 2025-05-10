export default function HeaderSection({
  name,
  address,
}: {
  name: string;
  address: string;
}) {
  const new_address = address.split(" ");
  if (new_address[0] == "서울특별시") {
    new_address[0] = "서울";
  }

  return (
    <div className="w-full flex flex-col items-start justify-center mt-5 px-3 sm:px-0">
      <div className="sm:text-xl font-medium text-gray-500 mb-2">
        {new_address[0] + " " + new_address[1]}
      </div>
      <div className="text-2xl sm:text-3xl font-bold mb-2">{name}</div>
    </div>
  );
}
