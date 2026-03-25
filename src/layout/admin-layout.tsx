import { Outlet, useNavigate } from "react-router-dom";
import { LogOut, LayoutDashboard, Sticker, Users } from "lucide-react";

import { Button } from "@/components/ui/button";

export function AdminLayout() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("admin_token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-muted/30">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-background p-4 flex flex-col">
        <div className="text-xl font-semibold mb-6">Stidget CMS</div>

        <nav className="flex flex-col gap-2 flex-1">
          <SidebarItem
            icon={<LayoutDashboard size={18} />}
            label="Dashboard"
            to="/"
          />
          <SidebarItem
            icon={<Sticker size={18} />}
            label="Stickers"
            to="/stickers"
          />
          {/* <SidebarItem icon={<Shield size={18} />} label="Admins" /> */}
          <SidebarItem icon={<Users />} label="Users" to="/users" />
        </nav>

        <Button
          variant="ghost"
          className="justify-start gap-2 mt-auto"
          onClick={logout}
        >
          <LogOut size={16} />
          Logout
        </Button>
      </aside>

      {/* Content */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}

function SidebarItem({ icon, label, to }: any) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(to)}
      className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted"
    >
      {icon}
      <span className="text-sm">{label}</span>
    </button>
  );
}
