"use client";

import { usePathname } from "next/navigation";
import SidebarLocked from "@/app/blocks/Sidebar-locked";

// This component is used to conditionally render the sidebar based on the current route. If the user is on the login or signup page, the sidebar will be hidden. For all other routes, the sidebar will be displayed.

export default function SidebarWrapper() {
  const pathname = usePathname();

  const hideSidebarRoutes = ["/login", "/signup"];

  const shouldHideSidebar = hideSidebarRoutes.includes(pathname);

  if (shouldHideSidebar) return null;

  return (
    <div className="hidden lg:block">
      <SidebarLocked />
    </div>
  );
}