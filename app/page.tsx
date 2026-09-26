
import Hero from "@/components/Hero";
import PropertyCategories from "@/components/PropertyCategories";
import ExclusiveProperties from "@/components/ExclusiveProperties";
import Advantages from "@/components/Advantages";
import Services from "@/components/Services";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Hero />

      <Advantages />

      <PropertyCategories />

      <ExclusiveProperties />

      <Services />

      <Footer />
    </>
  );
}