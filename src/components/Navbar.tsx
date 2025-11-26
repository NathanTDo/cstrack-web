import Link from "next/link";
import "../css/Navbar.css";

export default function Navbar() {
  return (
    <nav className="navbar border-b border-zinc-700 backdrop-filter backdrop-blur-lg">
      <div className="navbar-left">
        <Link href="/" className="navbar-brand">
          CS Track
        </Link>
        <Link href="/portfolio" className="navbar-link">
          Portfolio
        </Link>
        <Link href="/" className="navbar-link">
          Social
        </Link>
        <Link href="/about" className="navbar-link">
          About
        </Link>
      </div>
      <div className="navbar-right">
        <Link href="/search" className="navbar-link">
          Search
        </Link>
        <Link href="/profile" className="navbar-link">
          Profile
        </Link>
      </div>
    </nav>
  );
}
