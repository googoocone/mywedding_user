export interface WeddingCompanyData {
  id: number;
  name: string;
  address: string;
}

export interface HallPhotoData {
  id: number;
  url: string;
  hall_id: number;
  order_num?: number | null;
}

export interface HallData {
  id: number;
  wedding_company_id: number;
  name: string;
  type?: string;
  mood?: string;
  guarantees: number;
  interval_minutes?: number;
  parking?: number;
  wedding_company: WeddingCompanyData;
  hall_photos: HallPhotoData[];
}
