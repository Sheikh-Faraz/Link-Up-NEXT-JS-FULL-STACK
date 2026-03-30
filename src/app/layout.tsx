import "./globals.css";

import { Toaster } from "react-hot-toast";

import { GoogleOAuthProvider } from "@react-oauth/google";

import  SidebarLocked  from "@/app/blocks/Sidebar-locked";
import { TooltipProvider } from "@/components/ui/tooltip";

// Contexts
import { LoadingProvider } from "@/context/loading.context";
import { AuthProvider } from "@/context/auth.context";
import { UserProvider } from "@/context/user.context";
import { MessageProvider } from "@/context/messages.context";
import { UIProvider } from "@/context/ui.context";

import SidebarWrapper from "./sidebarwrapper";


export const metadata = {
  title: "Link Up",
  description: "Chat with friends",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* <body className="flex"> */}
      {/* <body className="flex flex-col lg:flex-row max-lg:overflow-hidden"> */}
      <body className="flex flex-col-reverse lg:flex-row max-lg:overflow-hidden"> 

      <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
        
        {/* Loading Context */}
        <LoadingProvider>  

          {/* Auth Context */}
          <AuthProvider>

            {/* User Context */}
            <UserProvider>

              {/* UI Context */}
              <UIProvider>

                {/* Messages Context */}
                <MessageProvider>

                    {/* Used to show sidebar if the route is not login or signup */}
                      <SidebarWrapper />

                    {/* Childer, Tooltip & Toaster */}
                    <TooltipProvider>
                      {/* <main className="flex-1 ">   */}
                      <main className="w-full">  
                        {children}
                      </main>
                    </TooltipProvider>
                    <Toaster
                      position="top-center"
                      toastOptions={{
                        style: {
                          background: "#333",
                          color: "#fff",
                        },
                      }}
                      />

                </MessageProvider>
              </UIProvider>
            </UserProvider>
           </AuthProvider>
        </LoadingProvider>
        
      </GoogleOAuthProvider>

      </body>
    </html>
  );
}
