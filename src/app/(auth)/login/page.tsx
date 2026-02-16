import { LoginForm } from "@/components/login-form"
import LinkUpLogo from "../../images/Linkup-logo.png"
import LoginImg from "../../images/Login-Side-img-white.png"
import Image from "next/image";

export default function LogInPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10 bg-muted">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="text-primary-foreground flex items-center justify-center rounded-md">
              <Image 
                              src={LinkUpLogo.src} 
                              alt={"Logo"}
                              width={35}
                              height={35}
                             />
            </div>
            Link-Up.
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
            {/* <p>There was a login form here </p> */}
          </div>
        </div>
      </div>
      <div className="relative hidden lg:block m-auto">
        <Image
          src={LoginImg.src}
          alt="Image"
          height={0}
          width={500}
        />
      </div>
    </div>
  )
}
