"use client";

import { useAuthenticator } from "@aws-amplify/ui-react";
import { LoginPage } from "./LoginPage";
import { useEffect, useState } from "react";

export default function AuthWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { authStatus } = useAuthenticator((context) => [context.authStatus]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null; // Avoids SSR flash, can be a loader
  }

  if (authStatus === "authenticated") {
    return <>{children}</>;
  }

  return <LoginPage />;
}
