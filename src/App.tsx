import { useState, useEffect } from 'react';
import { initScrollTracking } from './analytics';
import Header from './components/Header';
import Hero from './components/Hero';
import Problems from './components/Problems';
import Services from './components/Services';
import WildlifeServices from './components/WildlifeServices';
import Transformation from './components/Transformation';
import Process from './components/Process';
import VideoShowcase from './components/VideoShowcase';
import WhyChooseUs from './components/WhyChooseUs';
import Reviews from './components/Reviews';
import ServiceAreas from './components/ServiceAreas';
import FAQ from './components/FAQ';
import FinalCTA from './components/FinalCTA';
import Contact from './components/Contact';
import Footer from './components/Footer';
import LoadingScreen from './components/LoadingScreen';

function App() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    window.scrollTo(0, 0);
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  // Lock scroll while loading screen is visible or animating out.
  // Exit animation: 280ms delay + 550ms travel = 830ms total.
  // The class is also added immediately in index.html before React loads.
  useEffect(() => {
    if (loading) {
      document.documentElement.classList.add('scroll-locked');
      return;
    }
    const unlock = setTimeout(() => {
      document.documentElement.classList.remove('scroll-locked');
    }, 850);
    return () => clearTimeout(unlock);
  }, [loading]);

  useEffect(() => {
    const cleanup = initScrollTracking();
    return cleanup;
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <LoadingScreen visible={loading} />
      <Header />
      <main>
        <Hero />
        <Problems />
        <Services />
        <WildlifeServices />
        <Transformation />
        <Process />
        <VideoShowcase />
        <WhyChooseUs />
        <Reviews />
        <ServiceAreas />
        <FAQ />
        <FinalCTA />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

export default App;
