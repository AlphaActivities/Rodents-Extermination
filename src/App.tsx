import { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Problems from './components/Problems';
import Services from './components/Services';
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
    const timer = setTimeout(() => setLoading(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <LoadingScreen visible={loading} />
      <Header />
      <main>
        <Hero />
        <Problems />
        <Services />
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
