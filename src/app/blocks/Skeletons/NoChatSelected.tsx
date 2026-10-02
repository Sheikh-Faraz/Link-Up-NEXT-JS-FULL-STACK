import defaultChatBg from "@/app/images/Empty-state-img.png";
import Image from "next/image";

import { MessageSquare, UsersRound } from "lucide-react";

export default function NoChatSelected() {
  return (
    <div className="flex h-full w-full items-center justify-center px-6">
      <div className="flex max-w-md flex-col items-center text-center">
        {/* Illustration */}
        <Image
          src={defaultChatBg}
          alt="No conversation selected"
          width={400}
          height={300}
          priority
          className="mb-6 w-70 sm:w-[320px] md:w-90 object-contain"
        />

        {/* Heading */}
        <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
          No conversation selected
        </h2>

        {/* Description */}
        <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground sm:text-base">
          Choose a chat from the list to see its messages here, or start a new
          conversation.
        </p>

        {/* Buttons */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {/* New Chat */}
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:opacity-90"
          >
            <MessageSquare className="size-4" />
            New chat
          </button>

          {/* Create Group */}
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <UsersRound className="size-4" />
            Create group
          </button>
        </div>
      </div>
    </div>
  );
}