import "@/css/Profile.css";
import SignoutButton from "@/components/SignoutButton";

export default function Profile() {
  return (
    <>
      <div className="profile">
        <h2>Profile</h2>
        <p>Welcome to the profile page</p>
        <SignoutButton />
      </div>
    </>
  );
}
