import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";


function App() {

  return (

    <BrowserRouter>

      <Routes>

        <Route 
          path="/" 
          element={<Home />} 
        />

        <Route 
          path="/login" 
          element={<Login />} 
        />

        <Route 
          path="/register" 
          element={<Register />} 
        />

        <Route 
          path="/reset-password" 
          element={<ResetPassword />} 
        />

        <Route 
          path="/admin" 
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />

      </Routes>

    </BrowserRouter>

  );

}


export default App;