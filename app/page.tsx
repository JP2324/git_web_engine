import Navbar from "@/components/navbar";
import Hero from "@/components/hero";
import Features from "@/components/features";
import ExercisesPreview from "@/components/exercises-preview";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <ExercisesPreview />
      </main>
      <Footer />
    </div>
  );
}
