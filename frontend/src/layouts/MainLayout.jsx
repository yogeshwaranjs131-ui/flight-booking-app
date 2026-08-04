import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar"; // ஒரு ஃபோல்டர் பின்னோக்கி சென்று components-ஐ எடுப்பது
import Footer from "../components/Footer";

function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar />
      <main className="grow">
        <div className="container mx-auto p-4 md:p-6">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default MainLayout;