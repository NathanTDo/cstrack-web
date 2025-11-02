"use client";

import "../css/Home.css";
import { useEffect } from "react";
import { Amplify } from "aws-amplify";
import awsExports from "../aws-exports";
import Navbar from "@/components/Navbar";
import { signOut } from "aws-amplify/auth";

Amplify.configure(awsExports);

const Home = () => {
  return (
    <>
      <Navbar />
      <div className="home">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Welcome to CS Track
          </h1>
          <p className="text-xl text-gray-300">Track your CS skin portfolio</p>
        </div>
      </div>
    </>
  );
};

export default Home;
