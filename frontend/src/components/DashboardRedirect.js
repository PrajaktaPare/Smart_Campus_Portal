"use client"

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const DashboardRedirect = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return; // Wait for auth status to resolve

    if (isAuthenticated() && user) {
      redirectToDashboard(user.role);
    } else {
      navigate("/login");
    }
  }, [isAuthenticated, user, loading, navigate]);

  const redirectToDashboard = (role) => {
    console.log("Redirecting to dashboard for role:", role);
    switch (role) {
      case "admin":
        navigate("/admin/dashboard");
        break;
      case "faculty":
        navigate("/faculty/dashboard");
        break;
      case "student":
      default:
        navigate("/student/dashboard");
        break;
    }
  };

  return null;
};

export default DashboardRedirect;