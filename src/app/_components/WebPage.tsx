"use client";

import { type FC } from "react";
import { Header } from "./landing/Header";
import { Features } from "./landing/Features";
import { AIInfo } from "./landing/AIInfo";
import { Footer } from "./landing/Footer";

export const WebPage: FC = () => {
  return (
    <div className="bg-white">
      <Header />
    </div>
  );
};