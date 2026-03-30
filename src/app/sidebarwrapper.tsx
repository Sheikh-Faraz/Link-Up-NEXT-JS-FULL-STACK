"use client";

import { usePathname } from "next/navigation";
import SidebarLocked from "@/app/blocks/Sidebar-locked";
import HorizontalSidebar from "@/app/blocks/Horizontal-lock-sidebar";

// This component is used to conditionally render the sidebar based on the current route. If the user is on the login or signup page, the sidebar will be hidden. For all other routes, the sidebar will be displayed.

export default function SidebarWrapper() {
  const pathname = usePathname();

  const hideSidebarRoutes = ["/login", "/signup"];

  const shouldHideSidebar = hideSidebarRoutes.includes(pathname);

  if (shouldHideSidebar) return null;

  return (
    // <div className="border border-red-600">
    // <div className="">
    <>
    <div className="hidden lg:block">
    {/* <div className="hidden md:block"> */}
      <SidebarLocked />
    </div>
    {/* <div className="block md:hidden"> */}
    <div className="block lg:hidden">
      <HorizontalSidebar />
    </div>
    </>
  );
}