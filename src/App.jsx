import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import About from "../components/About";
import Products from "../components/Products";
import Process from "../components/Process";
import GlobalReach from "../components/GlobalReach";
import Footer from "../components/Footer";

export default function App() {
  return (
    <div className="relative min-h-full w-full max-w-full overflow-x-hidden flex flex-col bg-black text-white">
      <Navbar />
      <Hero />
      <About />
      <Products />
      <Process />
      <GlobalReach />
      <Footer />
    </div>
  );
}
