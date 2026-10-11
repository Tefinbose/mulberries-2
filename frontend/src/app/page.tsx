import CompleteTheLook from "@/components/CompleteTheLook";
import HeroSection from "@/components/HeroSection";
import NewArrivals from "@/components/NewArrivals";
import OurStory from "@/components/OurStory";
import ShopByCategory, { TimelessStyles } from "@/components/ShopByCategories";
import ShopByOccasion from "@/components/ShopByOccasion";
import Testimonials from "@/components/Testimonials";

export const revalidate = 60;

export default function Home() {
  return (
    <main>
      <HeroSection />
      <ShopByCategory />
      <TimelessStyles />
      <NewArrivals />
      <ShopByOccasion />
      <CompleteTheLook />
      <OurStory />
      <Testimonials />
    </main>
  );
}
