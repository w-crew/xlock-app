import Banner from "../components/main-components/Banner";
import Header from "../components/main-components/Header";
import Footer from "../components/main-components/Footer";
import "../assets/styles";

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-grow w-full h-full items-center">
        <Banner />
      </div>
      <Footer />
    </div>
  );
};

export default LandingPage;
