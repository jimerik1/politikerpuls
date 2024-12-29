"use client";

import { type FC } from "react";
import { Header } from "./landing/Header";
import { Hero } from "./landing/Hero";
import { Features } from "./landing/Features";
import { Pricing } from "./landing/Pricing";
import { AIInfo } from "./landing/AIInfo";
import { Footer } from "./landing/Footer";

export const WebPage: FC = () => {
  return (
    <div className="bg-white">
      <Header />
      <Features />
      <AIInfo />
      <Footer />
    </div>
  );
};