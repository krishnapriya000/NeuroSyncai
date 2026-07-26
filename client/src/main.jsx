import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";

import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";

import App from "./App.jsx";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "678228020475-09v8m25cgm0po8hrge1sjkumfe616t18.apps.googleusercontent.com";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>
);