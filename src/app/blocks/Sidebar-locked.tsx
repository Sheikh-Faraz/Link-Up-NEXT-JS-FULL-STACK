"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MessageCircle, User, Users, LogOut } from "lucide-react";

// Contexts
import { useAuth } from "@/context/auth.context";
import { useUser } from "@/context/user.context";
import { useGlobalLoading } from "@/context/loading.context";

import LinkUpLogo from "@/app/images/Linkup-logo.png";
import Image from "next/image";

export default function SidebarLocked() {
  const pathname = usePathname();

  const { logout } = useAuth();
  const { selectUser } = useUser();
  const { setIsLoading } = useGlobalLoading();

  const isActive = (path: string) => pathname === path;

  const iconStyle = (path: string) =>
    `p-2 rounded-xl cursor-pointer transition-colors duration-200 ${
      isActive(path)
        ? "bg-[#4CBBA3] text-white"
        : "text-gray-700 hover:bg-gray-100"
    }`;

  return (
    <TooltipProvider delayDuration={100}>
      <div className="flex flex-col items-center justify-between h-screen w-16 py-4 border-r bg-white">
        
        {/* Top */}
        <div className="flex flex-col items-center gap-6">

          {/* Logo */}
          <div className="p-2 rounded-xl bg-white text-black">
            <Image src={LinkUpLogo} alt="Logo" width={35} height={35} />
          </div>

          {/* Chats */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/"
                onClick={() => {
                  selectUser(null);
                  setIsLoading(true);
                }}
                className={iconStyle("/Home")}
              >
                <MessageCircle className="size-6" />
              </Link>   
            </TooltipTrigger>
            <TooltipContent side="right">
              Chats
            </TooltipContent>
          </Tooltip>

          {/* Profile */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/Profile"
                onClick={() => {
                  selectUser(null);
                  setIsLoading(true);
                }}
                className={iconStyle("/Profile")}
              >
                <User className="size-6" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">
              Profile
            </TooltipContent>
          </Tooltip>

          {/* Contacts */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/Restore-Contacts"
                onClick={() => {
                  selectUser(null);
                  setIsLoading(true);
                }}
                className={iconStyle("/Restore-Contacts")}
              >
                <Users className="size-6" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">
              Restore Contacts
            </TooltipContent>
          </Tooltip>

        </div>

        {/* Bottom */}
        <div className="flex flex-col items-center gap-6">

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={logout}
                className="p-2 rounded-xl cursor-pointer transition-colors duration-200 text-gray-700 hover:bg-gray-100"
              >
                <LogOut className="size-6" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              Logout
            </TooltipContent>
          </Tooltip>

        </div>
      </div>
    </TooltipProvider>
  );
}