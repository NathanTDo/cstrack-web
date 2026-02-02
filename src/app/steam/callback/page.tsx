"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchUserAttributes } from "aws-amplify/auth";

const API_BASE_URL = "https://sew3ob16e9.execute-api.us-west-1.amazonaws.com/dev";

function SteamCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const hasVerified = useRef(false); // Prevent double verification

  useEffect(() => {
    // Only run once
    if (hasVerified.current) return;
    hasVerified.current = true;
    verifySteamLogin();
  }, []);

  const verifySteamLogin = async () => {
    try {
      // 1. Collect all OpenID parameters from the URL
      //    Steam sends back params like: openid.ns, openid.mode, openid.claimed_id, etc.
      const openIdParams: Record<string, string> = {};
      
      // Use window.location.search as a fallback for more reliable param parsing
      const urlParams = new URLSearchParams(window.location.search);
      urlParams.forEach((value, key) => {
        if (key.startsWith("openid.")) {
          openIdParams[key] = value;
        }
      });

      console.log("Collected OpenID params:", openIdParams);
      console.log("Number of params:", Object.keys(openIdParams).length);

      // Check if we got the required params
      if (!openIdParams["openid.claimed_id"]) {
        throw new Error("Missing Steam authentication data. Make sure you completed the Steam login.");
      }

      // 2. Get the current user's username from Cognito
      const attributes = await fetchUserAttributes();
      const username = attributes.sub; // Cognito user ID

      if (!username) {
        throw new Error("User not authenticated");
      }

      // 3. Send to our Lambda to verify and link the account
      const response = await fetch(`${API_BASE_URL}/steam/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          openIdParams,
          username,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Show more details for debugging
        console.error("Verification response:", data);
        throw new Error(data.details || data.error || "Verification failed");
      }

      // 4. Success! Show success message then redirect
      setStatus("success");
      
      // Wait 2 seconds so user can see the success message
      setTimeout(() => {
        router.push("/portfolio");
      }, 2000);

    } catch (error: any) {
      console.error("Steam verification error:", error);
      setStatus("error");
      setErrorMessage(error.message || "Failed to link Steam account");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 max-w-md w-full mx-4 text-center">
        {status === "verifying" && (
          <>
            <div className="w-12 h-12 border-4 border-brand-theme border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Linking Steam Account</h2>
            <p className="text-zinc-400">Verifying your Steam login...</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Steam Account Linked!</h2>
            <p className="text-zinc-400">Redirecting to your portfolio...</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Link Failed</h2>
            <p className="text-red-400 mb-4">{errorMessage}</p>
            <button
              onClick={() => router.push("/portfolio")}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
            >
              Back to Portfolio
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// Wrap in Suspense for useSearchParams
export default function SteamCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="w-12 h-12 border-4 border-zinc-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SteamCallbackContent />
    </Suspense>
  );
}
