import { useState } from "react";
import { AdminPanel } from "@/components/AdminPanel";

const Admin = () => {
  const [isOpen] = useState(true);

  return (
    <div className="min-h-screen bg-background">
      <AdminPanel 
        isOpen={isOpen} 
        onClose={() => window.location.href = '/'} 
      />
    </div>
  );
};

export default Admin;
