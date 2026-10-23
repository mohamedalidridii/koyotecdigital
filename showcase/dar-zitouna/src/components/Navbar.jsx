import Link from "next/link";

const NavBar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <div className="navbar-item">
          <Link href="/">Dar Zitouna</Link>
        </div>
      </div>
      <div className="navbar-items">
        <div className="navbar-item">
          <Link href="/">Patio</Link>
        </div>
        <div className="navbar-item">
          <Link href="/chambres">Chambres</Link>
        </div>
        <div className="navbar-item">
          <Link href="/terrasse">Terrasse</Link>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
