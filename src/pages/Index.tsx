import { useState } from "react";
import { Login } from "@/components/Login";
import { Dashboard } from "@/components/Dashboard";

const Index = () => {
  // Temporary state to simulate login - will be replaced with Supabase auth
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (!isLoggedIn) {
    return <Login />;
  }

  return <Dashboard />;
};

export default Index;
