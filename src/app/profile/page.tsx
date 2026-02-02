"use client";

import { useEffect, useState } from "react";
import { fetchUserAttributes, updateUserAttributes } from "aws-amplify/auth";
import SignoutButton from "@/components/SignoutButton";
import SteamLink from "@/components/SteamLink";
import { UserProfile } from "@/types/types";

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const attributes = await fetchUserAttributes();
      setProfile({
        name: attributes.name || attributes.given_name || "",
        email: attributes.email || "",
        sub: attributes.sub || "",
        steamId: attributes["custom:steamId"] || null,
      });
      setEditedName(attributes.name || attributes.given_name || "");
    } catch (err) {
      console.error("Error fetching user profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveName = async () => {
    if (!editedName.trim()) return;

    setIsSaving(true);
    try {
      await updateUserAttributes({
        userAttributes: {
          name: editedName.trim(),
        },
      });
      setProfile((prev) =>
        prev ? { ...prev, name: editedName.trim() } : null
      );
      setIsEditingName(false);
    } catch (err) {
      console.error("Error updating name:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedName(profile?.name || "");
    setIsEditingName(false);
  };

  const handleSteamLinkChange = (newSteamId: string | null) => {
    if (profile) {
      setProfile({ ...profile, steamId: newSteamId });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#171717] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-theme border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#171717] text-white p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Profile Header */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
          <div className="flex items-center gap-6">
            {/* Avatar Placeholder */}
            <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center text-3xl font-bold text-brand-theme">
              {(profile?.name || editedName)?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1">
              {isEditingName ? (
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xl font-bold text-white focus:outline-none focus:border-brand-theme"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveName();
                      if (e.key === "Escape") handleCancelEdit();
                    }}
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={isSaving || !editedName.trim()}
                    className="p-2 bg-brand-theme text-black rounded-lg hover:bg-brand-theme-hover disabled:opacity-50 transition-colors"
                  >
                    {isSaving ? (
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="p-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold">
                    {profile?.name || (
                      <span className="text-zinc-500 italic">
                        Set your name
                      </span>
                    )}
                  </h1>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                    title="Edit name"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                  </button>
                </div>
              )}
              <p className="text-zinc-400 mt-1">CSTrack Member</p>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Account Information</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-zinc-800">
              <div>
                <p className="text-sm text-zinc-400">Email</p>
                <p className="text-white">{profile?.email}</p>
              </div>
              <svg
                className="w-5 h-5 text-zinc-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div className="flex justify-between items-center py-3">
              <div>
                <p className="text-sm text-zinc-400">User ID</p>
                <p className="text-white font-mono text-sm">{profile?.sub}</p>
              </div>
              <svg
                className="w-5 h-5 text-zinc-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Steam Integration */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Steam Integration</h2>
          <p className="text-sm text-zinc-400 mb-4">
            Link your Steam account to import your CS2 inventory and track your
            skins.
          </p>
          <SteamLink onLinkChange={handleSteamLinkChange} />
        </div>

        {/* Sign Out */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Session</h2>
          <SignoutButton />
        </div>
      </div>
    </div>
  );
}
