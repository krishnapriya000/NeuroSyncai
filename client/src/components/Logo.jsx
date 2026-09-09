import React from "react";
import { Link } from "react-router-dom";

function Logo({ className = "navbar-brand text-white fw-bold", to = "/" }) {
  return (
    <Link className={className} to={to}>
      <span>🧠 NeuroSync</span>
    </Link>
  );
}

export default Logo;
