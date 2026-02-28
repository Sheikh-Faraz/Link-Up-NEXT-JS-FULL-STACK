import "./globals.css";
import { Toaster } from "react-hot-toast";

import { TooltipProvider } from "@/components/ui/tooltip";

// import { GoogleOAuthProvider } from "@react-oauth/google";
import  SidebarLocked  from "@/app/blocks/Sidebar-locked";

// Contexts
import { LoadingProvider } from "@/context/loading.context";
import { AuthProvider } from "@/context/auth.context";
import { UserProvider } from "@/context/user.context";
import { MessageProvider } from "@/context/messages.context";
import { UIProvider } from "@/context/ui.context";


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
      <body className="flex flex-col lg:flex-row max-lg:overflow-hidden">
      {/* <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}> */}
        
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

                          {/* Navigaiton sidebar */}
                        <div className="hidden lg:block">
                          <SidebarLocked />
                         </div>

                    {/* Childer, Tooltip & Toaster */}
                    <TooltipProvider>
                      <main className="flex-1">  
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
        
      {/* </GoogleOAuthProvider> */}
      </body>
    </html>
  );
}
