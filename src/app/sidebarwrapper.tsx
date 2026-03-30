"use client";

import { usePathname } from "next/navigation";
import SidebarLocked from "@/app/blocks/Sidebar-locked";
import HorizontalSidebar from "@/app/blocks/Horizontal-lock-sidebar";

// Context
import { useUI } from "@/context/ui.context";

// This component is used to conditionally render the sidebar based on the current route. If the user is on the login or signup page, the sidebar will be hidden. For all other routes, the sidebar will be displayed.

export default function SidebarWrapper() {

  const { isChatOpen } = useUI();

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
    {/* <div className="block lg:hidden border border-red-600 sticky bottom-0 z-50"> */}
    <div className={`block lg:hidden ${isChatOpen ? "hidden lg:block" : "block"}`}>
      <HorizontalSidebar />
    </div>
    </>
  );
}