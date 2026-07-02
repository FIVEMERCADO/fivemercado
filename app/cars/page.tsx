export const dynamic = "force-dynamic";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CarsCatalog } from "@/components/cars/CarsCatalog";

async function getCars() {
  const url  = process.env.SUPABASE_URL ?? "";
  const key  = process.env.SUPABASE_SERVICE_KEY ?? "";

  const res = await fetch(
    `${url}/rest/v1/cars?select=id,name,brand,category,price,is_free,image_url,stats,photos,is_animated,description,handling_name&is_published=eq.true&order=created_at.desc`,
    {
      headers: {
        "Authorization": `Bearer ${key}`,
        "apikey": key,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    console.error("[cars] fetch error:", res.status, await res.text());
    return [];
  }
  const data = await res.json();
  console.log("[cars] fetched:", data?.length);
  return Array.isArray(data) ? data : [];
}

export default async function CarsPage() {
  const cars = await getCars();

  return (
    <div className="min-h-screen bg-dark">
      <Navbar />
      <CarsCatalog cars={cars} />
      <Footer />
    </div>
  );
}
