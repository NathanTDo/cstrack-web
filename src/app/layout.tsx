import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../css/Globals.css";
import ConfigureAmplifyClientSide from "@/components/ConfigureAmplifyClientSide";
import AuthWrapper from "@/components/AuthWrapper";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CS Track",
  description: "Track your CS Skins",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="root-body">
        <ConfigureAmplifyClientSide />
        <AuthWrapper>
          <Navbar />
          <main className="main-content">{children}</main>
        </AuthWrapper>
      </body>
    </html>
  );
}
