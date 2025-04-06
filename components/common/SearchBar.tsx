import Image from "next/image";

export default function SearchBar() {
  return (
    <div className="w-full sm:w-[640px] h-[50px] flex rounded-full overflow-hidden border border-gray-300 relative">
      <input
        type="text"
        placeholder="검색하고 싶은 웨딩홀을 입력해주세요"
        className="w-full h-full pl-6 pr-2 focus:outline-none placeholder:text-sm sm:placeholder:text-base md:placeholder:text-lg"
      />
      <button className="w-[60px] h-full flex items-center justify-center bg-primary text-white rounded-r-full focus:outline-none cursor-pointer ">
        <Image src="/search.svg" width={32} height={32} alt="검색 버튼"></Image>
      </button>
    </div>
  );
}
