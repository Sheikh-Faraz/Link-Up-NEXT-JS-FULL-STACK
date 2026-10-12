
"use client";

import Pusher from "pusher-js";

let pusherClient: Pusher | null = null;

export function getPusherClient() {
  if (!pusherClient) {
    pusherClient = new Pusher(
      process.env.NEXT_PUBLIC_PUSHER_KEY!,
      {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
        channelAuthorization: {
            endpoint: "/api/pusher/auth",
            transport: "ajax"                           // Added this new property fix
        },
      }
    );
  }

  return pusherClient;
}