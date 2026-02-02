"use client";

import React, { useState, useEffect } from "react";
import { fetchUserAttributes, fetchAuthSession } from "aws-amplify/auth";
import { get, post } from "aws-amplify/api";

const API_NAME = "cstrackApiProxy";
const API_BASE_URL =
  "https://sew3ob16e9.execute-api.us-west-1.amazonaws.com/dev";

interface SteamLinkProps {
  onLinkChange?: (steamId: string | null) => void;
}

export default function SteamLink({ onLinkChange }: SteamLinkProps) {
  const [steamId, setSteamId] = useState<string | null>(null);
  const [steamProfile, setSteamProfile] = useState<{
    name: string;
    avatar: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLinking, setIsLinking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkSteamLink();
  }, []);

  const checkSteamLink = async () => {
    try {
      const attributes = await fetchUserAttributes();
      const linkedSteamId = attributes["custom:steamId"];

      if (linkedSteamId) {
        setSteamId(linkedSteamId);
        onLinkChange?.(linkedSteamId);
        // Optionally fetch Steam profile info here
      }
    } catch (err) {
      console.error("Error checking Steam link:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkSteam = async () => {
    setIsLinking(true);
    setError(null);

    try {
      // Get the Steam auth URL from our Lambda
      const returnTo = `${window.location.origin}/steam/callback`;
      const response = await fetch(
        `${API_BASE_URL}/steam/auth?returnTo=${encodeURIComponent(returnTo)}`
      );

      if (!response.ok) {
        throw new Error("Failed to get Steam auth URL");
      }

      const data = await response.json();

      // Redirect to Steam login
      window.location.href = data.authUrl;
    } catch (err: any) {
      console.error("Error initiating Steam link:", err);
      setError(err.message || "Failed to initiate Steam login");
      setIsLinking(false);
    }
  };

  const handleUnlinkSteam = async () => {
    // For now, just clear local state
    // In production, you'd call an endpoint to clear the Cognito attribute
    setSteamId(null);
    setSteamProfile(null);
    onLinkChange?.(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-zinc-400">
        <div className="w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm">Checking Steam link...</span>
      </div>
    );
  }

  if (steamId) {
    return (
      <div className="flex items-center gap-3 bg-zinc-800/50 rounded-lg px-4 py-2">
        <svg
          className="w-6 h-6 text-[#1b2838]"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.08 3.16 9.42 7.62 11.17l3.37-4.83c-.02-.01-.03-.01-.05-.02-1.39-.54-2.31-1.87-2.31-3.41 0-2.03 1.64-3.67 3.67-3.67.34 0 .67.05.98.14l2.44-3.49C14.65 6.71 13.36 6 12 6c-3.31 0-6 2.69-6 6 0 2.39 1.4 4.44 3.42 5.41l-2.84 4.07C2.73 19.81 0 16.22 0 12 0 5.37 5.37 0 12 0zm0 8c2.21 0 4 1.79 4 4s-1.79 4-4 4-4-1.79-4-4 1.79-4 4-4z" />
        </svg>
        <div className="flex flex-col">
          <span className="text-sm text-zinc-300">Steam Linked</span>
          <span className="text-xs text-zinc-500">ID: {steamId}</span>
        </div>
        <button
          onClick={handleUnlinkSteam}
          className="ml-auto text-xs text-zinc-500 hover:text-red-400 transition-colors border border-zinc-700 rounded-lg px-2 py-1"
        >
          Unlink
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleLinkSteam}
        disabled={isLinking}
        className="flex items-center justify-center gap-2 bg-[#1b2838] hover:bg-[#2a475e] text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLinking ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Connecting...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.08 3.16 9.42 7.62 11.17l3.37-4.83c-.02-.01-.03-.01-.05-.02-1.39-.54-2.31-1.87-2.31-3.41 0-2.03 1.64-3.67 3.67-3.67.34 0 .67.05.98.14l2.44-3.49C14.65 6.71 13.36 6 12 6c-3.31 0-6 2.69-6 6 0 2.39 1.4 4.44 3.42 5.41l-2.84 4.07C2.73 19.81 0 16.22 0 12 0 5.37 5.37 0 12 0zm0 8c2.21 0 4 1.79 4 4s-1.79 4-4 4-4-1.79-4-4 1.79-4 4-4z" />
            </svg>
            <span>Link Steam Account</span>
          </>
        )}
      </button>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}

// Export a hook for other components to use
export function useSteamId() {
  const [steamId, setSteamId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSteamLink = async () => {
      try {
        const attributes = await fetchUserAttributes();
        setSteamId(attributes["custom:steamId"] || null);
      } catch (err) {
        console.error("Error checking Steam link:", err);
      } finally {
        setIsLoading(false);
      }
    };
    checkSteamLink();
  }, []);

  return { steamId, isLoading };
}
