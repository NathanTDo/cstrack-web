"use client";

import { signOut } from "aws-amplify/auth";
import "@/css/SignoutButton.css";

export default function SignoutButton() {
  return (
    <div className="sign-out-button-container">
      <button
        className="sign-out-button"
        onClick={() => {
          signOut();
        }}
      >
        Sign Out
      </button>
    </div>
  );
}
