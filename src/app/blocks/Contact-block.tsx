import Image from "next/image";
import avatar from '@/app/images/avatarpic.png'
// import { useChat } from "@/app/store/Chatinfo";

interface ContactProps {
  name: string;
  profilePic: string;
  id: string;
  onClick?: () => void;
}

export default function ContactBlock({
  name,
  profilePic,
  id,
  onClick,
}: ContactProps) {

//   const { onlineUsers } = useChat();  

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  const imageUrl = profilePic?.startsWith("http")
  ? profilePic
  : `${BASE_URL}${profilePic}`;

  return (
    <div className="flex items-center justify-between p-3 hover:bg-gray-100 rounded-lg cursor-pointer"
      onClick={onClick}
    >
      {/* Left section: avatar + info */}
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="relative">
          <Image
            src={profilePic === "" ? avatar.src : imageUrl}
            alt={name}
            width={40}
            height={40}
            className="rounded-full w-10 h-10 object-cover"
            style={{ objectPosition: "center" }}
          />
          {/* Online dot */}
          {/* <span className={`absolute bottom-0 right-0 block w-3 h-3 ${onlineUsers.includes(id || "") ? "bg-green-500" : "bg-red-500"} border-2 border-white rounded-full`}></span> */}
        </div>

        {/* Name + Message */}
        <div className="flex flex-col">
          <span className="font-medium">{name}</span>
          {/* <div className="flex items-center gap-1 text-sm text-gray-500">
          <span className={`text-sm ${onlineUsers.includes(id || "") ? "text-green-500" : "text-red-500"}`}>
            {onlineUsers.includes(id || "") ? "Online" : "Offline"}
          </span>
          </div> */}
        </div>
      </div>

      <div>
      </div>
    </div>
  );
}
