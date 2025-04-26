"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function HallDetailPage() {
  const params = useParams();
  const companyId = params.companyId;

  const [hall, setHall] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태 유지
  const [error, setError] = useState<string | null>(null); // 에러 상태 유지

  useEffect(() => {
    const fetchDetailWeddingHall = async () => {
      try {
        const apiEndpoint = `${process.env.NEXT_PUBLIC_BACKEND_URL}/hall/get_detail_wedding_hall/${companyId}`;

        const response = await fetch(apiEndpoint, {
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!response.ok) {
          const errorBody = await response.json();
          throw new Error(
            `Failed to fetch halls: ${response.status} ${
              response.statusText
            } - ${errorBody.detail || ""}`
          );
        }

        const data = await response.json();
        console.log("data", data);
        setHall(data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch detail wedding halls.");
        console.error("Error fetching wedding halls:", err);
      }
    };

    fetchDetailWeddingHall();
  }, []);

  console.log("hall", hall);

  return <div>hello </div>;
}
