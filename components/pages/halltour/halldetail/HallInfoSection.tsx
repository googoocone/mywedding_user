// HallInfoSection.tsx

import { useEffect } from "react"; // useEffect 훅 사용을 위해 import

// 네이버 지도 API의 전역 객체를 사용하기 위해 window 객체 확장 (TypeScript 사용 시 필요)
declare global {
  interface Window {
    naver: any;
  }
}

export default function HallInfoSection({
  address,
  phone,
  homepage,
  accessibility,
  lat, // 위도 prop 추가
  lng, // 경도 prop 추가
}: {
  address: string; // 주소
  phone: string; // 전화번호
  homepage: string; // 홈페이지 URL
  accessibility: string; // 접근성 정보
  lat: number; // 위도
  lng: number; // 경도
}) {
  const standardLat = lat / 10000000;
  const standardLng = lng / 10000000;

  // 컴포넌트가 마운트된 후 지도 API 스크립트를 로드하고 지도를 초기화합니다.
  useEffect(() => {
    // 네이버 지도 API 클라이언트 ID 가져오기
    const clientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;

    // 클라이언트 ID가 없으면 에러 로그 출력 후 종료
    if (!clientId) {
      console.error(
        "Naver Maps Client ID is not defined in environment variables (NEXT_PUBLIC_NAVER_MAPS_CLIENT_ID)."
      );
      // 사용자에게 지도를 표시할 수 없다는 메시지를 보여줄 수 있습니다.
      const mapDiv = document.getElementById("naver-map");
      if (mapDiv) {
        mapDiv.innerHTML =
          '<p style="color: red; text-align: center; padding: 20px;">지도 클라이언트 ID가 설정되지 않았습니다.</p>';
      }
      return;
    }

    // 네이버 지도 API 스크립트 로드 함수
    const loadNaverMapsScript = () => {
      return new Promise<void>((resolve, reject) => {
        const scriptId = "naver-maps-script";
        // 이미 스크립트가 로드되었는지 확인
        if (document.getElementById(scriptId)) {
          // 스크립트는 있지만 API 객체가 준비 안됐을 경우 대비 (드물지만)
          if (window.naver && window.naver.maps) {
            resolve(); // 이미 로드 완료
          } else {
            // 스크립트는 있으나 아직 로딩 중일 경우를 대비
            const existingScript = document.getElementById(
              scriptId
            ) as HTMLScriptElement;
            existingScript.addEventListener("load", () => {
              if (window.naver && window.naver.maps) resolve();
              else
                reject(
                  new Error(
                    "Naver Maps API object not found after existing script load."
                  )
                );
            });
            existingScript.addEventListener("error", () =>
              reject(new Error("Existing Naver Maps script failed to load."))
            );
          }
          return;
        }

        // 새로운 스크립트 요소 생성
        const script = document.createElement("script");
        script.id = scriptId;
        // API 스크립트 소스 URL에 클라이언트 ID 포함
        script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}`;
        script.async = true; // 비동기 로드
        script.defer = true; // 문서 파싱 후 로드

        // 스크립트 로드 완료 시 Promise resolve
        script.addEventListener("load", () => {
          // 스크립트는 로드되었지만 naver.maps 객체가 없을 수도 있으므로 확인
          if (window.naver && window.naver.maps) {
            resolve();
          } else {
            reject(
              new Error(
                "Naver Maps script loaded, but naver.maps object is not available."
              )
            );
          }
        });
        // 스크립트 로드 실패 시 Promise reject
        script.addEventListener("error", () =>
          reject(new Error("Naver Maps script failed to load."))
        );

        // 스크립트를 문서의 body에 추가
        document.body.appendChild(script);
      });
    };

    // 지도 초기화 함수
    const initMap = () => {
      // 지도를 표시할 div 요소 가져오기
      const mapDiv = document.getElementById("naver-map");

      // div 요소가 없으면 에러 로그 출력 후 종료
      if (!mapDiv) {
        console.error("Naver map container div with ID 'naver-map' not found.");
        return;
      }

      // 위도(lat)와 경도(lng) 값이 유효한 숫자인지 확인
      if (typeof lat !== "number" || typeof lng !== "number") {
        console.error(
          "Invalid latitude or longitude provided for map initialization."
        );
        mapDiv.innerHTML =
          '<p style="color: red; text-align: center; padding: 20px;">유효한 위치 정보가 없습니다.</p>';
        return;
      }

      // 지도 초기화
      const map = new window.naver.maps.Map("naver-map", {
        center: new window.naver.maps.LatLng(standardLng, standardLat), // 위도, 경도를 지도의 중심으로 설정
        zoom: 17, // 초기 줌 레벨 설정 (17은 비교적 상세한 레벨)
        // 다양한 옵션 추가 가능 (예: minZoom, maxZoom, mapTypeControl 등)
      });

      // 지도 중심에 마커 추가 (선택 사항)
      const marker = new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(standardLng, standardLat),
        map: map,
      });

      // 필요하다면 map이나 marker 객체를 컴포넌트 상태나 ref에 저장하여 추후 제어 가능
    };

    // 스크립트 로드 후 지도 초기화 실행
    loadNaverMapsScript()
      .then(() => {
        console.log("Naver Maps script loaded successfully.");
        initMap(); // 스크립트 로드 성공 시 지도 초기화
      })
      .catch((error) => {
        console.error("Failed to load Naver Maps script:", error);
        // 지도 로드 실패 시 사용자에게 메시지 표시
        const mapDiv = document.getElementById("naver-map");
        if (mapDiv) {
          mapDiv.innerHTML = `<p style="color: red; text-align: center; padding: 20px;">지도를 불러오는데 실패했습니다.<br/>${error.message}</p>`;
        }
      });

    return () => {
      const mapDiv = document.getElementById("naver-map");
      if (mapDiv) {
        // 지도 인스턴스를 명시적으로 제거하는 API는 없지만,
        // 컨테이너 요소를 비우거나 제거하여 DOM에서 지도를 분리할 수 있습니다.
        mapDiv.innerHTML = ""; // div 내용 비우기
      }
    };
  }, [lat, lng]); // lat 또는 lng prop이 변경될 때마다 effect 재실행

  return (
    <div className="w-full flex flex-col items-start justify-center px-3 sm:px-0">
      <div className="text-2xl font-[600] mb-4">식장 정보</div>
      <div className="w-full flex items-center justify-center">
        {/* 이 부분이 기본정보의 요소들이 들어가는 부분 */}
        {/* max-w를 1250px 등으로 제한하는 상위 컨테이너 안에 있어야 합니다. */}
        <div className="w-full flex flex-col items-start gap-4">
          {/* 주소 정보 */}
          <div className="w-full flex items-center justify-between">
            <div className="w-[120px] sm:w-[180px] flex-shrink-0 text-gray-500 self-start">
              주소
            </div>
            {/* 주소 내용 (간략 주소로 표시할 수도 있습니다) */}
            {/* 예: getShortAddress(address) 또는 getSeoulOrProvinceAddress(address) 사용 */}
            <div className="w-[650px] pl-[20px] flex flex-wrap items-center justify-start gap-2 text-gray-700">
              {address || "정보 없음"}
            </div>
          </div>

          {/* 전화번호 정보 */}
          <div className="w-full flex items-center justify-between">
            <div className="w-[120px] sm:w-[180px] flex-shrink-0 text-gray-500 self-start">
              전화번호
            </div>
            <div className="w-[650px] pl-[20px] flex flex-wrap items-center justify-start gap-2 text-gray-700">
              {" "}
              {/* 텍스트 색상 추가 */}
              {phone || "정보 없음"}
            </div>
          </div>

          {/* 홈페이지 정보 */}
          <div className="w-full flex items-center justify-between">
            {/* text-[justify]는 Flexbox 항목에서는 일반적으로 효과가 없으므로 제거 권장 */}
            <div className="w-[120px] sm:w-[180px] flex-shrink-0 text-gray-500 self-start">
              홈페이지
            </div>
            {/* 홈페이지 URL */}
            <div className="w-[650px] pl-[20px] flex flex-wrap items-center justify-start gap-2 text-gray-700">
              {" "}
              {/* 텍스트 색상 추가 */}
              {homepage ? (
                // URL이 있으면 링크로 표시
                <a
                  href={homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-all"
                >
                  {homepage}
                </a>
              ) : (
                // URL이 없으면 '정보 없음' 표시
                "정보 없음"
              )}
            </div>
          </div>

          {/* 접근성 정보 */}
          <div className="w-full flex items-center justify-between">
            {/* text-[justify]는 Flexbox 항목에서는 일반적으로 효과가 없으므로 제거 권장 */}
            <div className="w-[120px] sm:w-[180px] flex-shrink-0 text-gray-500 self-start">
              접근성
            </div>
            <div className="w-[650px] pl-[20px] flex flex-wrap items-center justify-start gap-2 text-gray-700">
              {" "}
              {/* 텍스트 색상 추가 */}
              {accessibility || "정보 없음"}
            </div>
          </div>

          {/* 네이버 지도가 표시될 영역 */}
          {/* id는 loadNaverMapsScript 및 initMap 함수에서 참조됩니다. */}
          {/* height 값을 지정해야 지도가 보입니다. */}
          {/* border 및 rounded-md로 테두리 스타일 적용 */}
          <div
            id="naver-map"
            style={{ width: "100%", height: "400px" }} // 지도 표시 영역 크기 (필수)
            className="mt-4 border border-gray-300 rounded-md overflow-hidden" // 테두리 및 여백 스타일, overflow-hidden 추가
          >
            {/* 지도가 로딩되는 동안이나 실패 시 메시지를 표시할 수 있습니다. */}
            {/* 스크립트 로딩 실패 시 innerHTML로 메시지를 넣는 로직이 useEffect에 있습니다. */}
          </div>
        </div>
      </div>
      {/* 하단 구분선 */}
      <div className="w-full border border-gray-300 my-4"></div>
    </div>
  );
}
