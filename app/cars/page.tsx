export const dynamic = "force-dynamic";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { supabaseClient } from "@/lib/supabase";
import { CarsCatalog } from "@/components/cars/CarsCatalog";

async function getCars() {
  const supabase = supabaseClient();
  const { data } = await supabase
    .from("cars")
    .select("id, name, brand, category, price, is_free, image_url, stats")
    .eq("is_published", true)
    .order("created_at", { ascending: false });
  return data ?? [];
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
