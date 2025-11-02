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
        <h2>Home Page</h2>
        <p> Welcome to the CS Track!</p>
      </div>
    </>
  );
};

export default Home;
