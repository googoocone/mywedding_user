// types.ts (예시 파일명)
export interface Photo {
  id: number | string;
  url: string;
  caption?: string;
  order_num?: number;
  is_visible?: boolean;
  hall_id?: number;
  width?: number; // 이미지 모달용
  height?: number; // 이미지 모달용
  blurDataURL?: string; // 이미지 모달용
}

export interface MealPrice {
  id: number;
  meal_type: string;
  price: number;
  category: string; // "대인", "소인" 등
  estimate_id: number;
  extra?: string;
}

export interface EstimateOption {
  name: string;
  estimate_id: number;
  is_required: boolean;
  reference_url?: string;
  price: number;
  id: number;
  description?: string;
}

export interface EtcItem {
  // estimate 내의 etc
  id: number;
  estimate_id: number;
  content: string;
}

export interface WeddingPackageItem {
  // ... package item 필드 정의 ...
  name: string;
  price: number;
  type: string; // 예: "스튜디오", "드레스" 등
}

export interface WeddingPackage {
  id: number;
  type: string; // "스드메", "개별"
  name: string;
  is_total_price: boolean;
  total_price: number;
  estimate_id: number;
  wedding_package_items: WeddingPackageItem[];
}

export interface Estimate {
  hall_id: number;
  hall_price: number;
  date: string; // "YYYY-MM-DD"
  penalty_amount?: number;
  created_by_user_id?: string;
  id: number;
  type: "standard" | "admin"; // 견적서 종류
  time: string; // "HH:MM:SS"
  penalty_detail?: string;
  meal_prices: MealPrice[];
  estimate_options: EstimateOption[];
  etcs: EtcItem[];
  wedding_packages: WeddingPackage[];
}

export interface HallInclude {
  id: number;
  subcategory: string;
  hall_id: number;
  category: string;
}

export interface Hall {
  id: number;
  interval_minutes: number;
  parking: number;
  mood: string;
  wedding_company_id: number;
  name: string; // 홀 이름 (필터 기준)
  guarantees: number;
  type: string; // 홀 타입 (예: "컨벤션")
  hall_includes: HallInclude[];
  estimates: Estimate[];
  hall_photos: Photo[];
}

export interface WeddingCompany {
  id: number;
  phone: string;
  accessibility: string;
  lng: number; // 또는 string, 실제 데이터 타입 확인 필요
  address: string;
  name: string; // 업체명
  homepage?: string;
  lat: number; // 또는 string
  ceremony_times?: string;
  halls: Hall[];
}
