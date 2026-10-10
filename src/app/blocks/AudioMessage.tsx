"use client";

import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import {
  Download,
  Loader2,
  Pause,
  Play,
  Volume2,
  VolumeX,
} from "lucide-react";

interface AudioMessageProps {
  src: string;
}

// Keeps track of the currently playing audio.
// This makes sure only ONE audio message plays at a time.
let activeWaveSurfer: WaveSurfer | null = null;

export default function AudioMessage({ src }: AudioMessageProps) {
  const waveformRef = useRef<HTMLDivElement | null>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (!waveformRef.current) return;

    const wavesurfer = WaveSurfer.create({
      container: waveformRef.current,

      // Compact chat-friendly height
      height: 38,

      // Unplayed waveform
      waveColor: "#9CA3AF",

      // Played waveform
      progressColor: "#6FD5AA",

      // No vertical cursor
      cursorWidth: 0,

      // Waveform appearance
      barWidth: 2,
      barGap: 2,
      barRadius: 3,

      // Makes quiet audio easier to see
      normalize: true,

      url: src,
    });

    wavesurferRef.current = wavesurfer;

    // -----------------------------
    // Loading
    // -----------------------------

    wavesurfer.on("loading", (percent) => {
      setIsLoading(percent < 100);
    });

    // -----------------------------
    // Ready
    // -----------------------------

    wavesurfer.on("ready", () => {
      setIsLoading(false);
      setDuration(wavesurfer.getDuration());
    });

    // -----------------------------
    // Play
    // -----------------------------

    wavesurfer.on("play", () => {
      // Stop any other currently playing audio
      if (
        activeWaveSurfer &&
        activeWaveSurfer !== wavesurfer
      ) {
        activeWaveSurfer.pause();
      }

      activeWaveSurfer = wavesurfer;
      setIsPlaying(true);
    });

    // -----------------------------
    // Pause
    // -----------------------------

    wavesurfer.on("pause", () => {
      setIsPlaying(false);

      if (activeWaveSurfer === wavesurfer) {
        activeWaveSurfer = null;
      }
    });

    // -----------------------------
    // Time update
    // -----------------------------

    wavesurfer.on("timeupdate", (time) => {
      setCurrentTime(time);
    });

    // -----------------------------
    // Finished
    // -----------------------------

    wavesurfer.on("finish", () => {
      setIsPlaying(false);
      setCurrentTime(0);

      wavesurfer.seekTo(0);

      if (activeWaveSurfer === wavesurfer) {
        activeWaveSurfer = null;
      }
    });

    // -----------------------------
    // Error
    // -----------------------------

    wavesurfer.on("error", (error) => {
      console.error("Audio playback error:", error);
      setIsLoading(false);
    });

    // -----------------------------
    // Cleanup
    // -----------------------------

    return () => {
      if (activeWaveSurfer === wavesurfer) {
        activeWaveSurfer = null;
      }

      wavesurfer.destroy();
      wavesurferRef.current = null;
    };
  }, [src]);

  // -----------------------------
  // Play / Pause
  // -----------------------------

  const togglePlay = () => {
    if (!wavesurferRef.current || isLoading) return;

    wavesurferRef.current.playPause();
  };

  // -----------------------------
  // Mute / Unmute
  // -----------------------------

  const toggleMute = () => {
    if (!wavesurferRef.current) return;

    const nextMuted = !isMuted;

    wavesurferRef.current.setMuted(nextMuted);
    setIsMuted(nextMuted);
  };

  // -----------------------------
  // Download
  // -----------------------------

  const handleDownload = () => {
    try {
      // Cloudinary supports fl_attachment which tells
      // the browser to download the file instead of opening it.
      const downloadUrl = src.replace(
        "/upload/",
        "/upload/fl_attachment/",
      );

      const link = document.createElement("a");

      link.href = downloadUrl;
      link.download = "audio";
      link.target = "_blank";
      link.rel = "noopener noreferrer";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Audio download failed:", error);
    }
  };

  // -----------------------------
  // Format time
  // -----------------------------

  const formatTime = (time: number) => {
    if (!Number.isFinite(time)) {
      return "0:00";
    }

    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);

    return `${minutes}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="flex w-80 items-center gap-2.5">
      {/* -------------------------------- */}
      {/* Play Button */}
      {/* -------------------------------- */}

      <button
        type="button"
        onClick={togglePlay}
        disabled={isLoading}
        aria-label={
          isPlaying ? "Pause audio" : "Play audio"
        }
        className="
          flex
          h-10
          w-10
          shrink-0
          items-center
          justify-center
          rounded-full
          bg-[#6FD5AA]
          text-black
          shadow-sm
          transition-all
          duration-200
          hover:scale-105
          hover:shadow-md
          active:scale-95
          disabled:cursor-default
          disabled:opacity-80
        "
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isPlaying ? (
          <Pause className="h-4 w-4 fill-current" />
        ) : (
          <Play className="ml-0.5 h-4 w-4 fill-current" />
        )}
      </button>

      {/* -------------------------------- */}
      {/* Waveform + Time */}
      {/* -------------------------------- */}

      <div className="min-w-0 flex-1">
        <div
          ref={waveformRef}
          className="
            w-full
            cursor-pointer
            overflow-hidden
          "
        />

        <div className="mt-0.5 flex items-center justify-between">
          <span className="text-[11px] tabular-nums text-muted-foreground">
            {formatTime(currentTime)}
          </span>

          <span className="text-[11px] tabular-nums text-muted-foreground">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* -------------------------------- */}
      {/* Mute Button */}
      {/* -------------------------------- */}

      <button
        type="button"
        onClick={toggleMute}
        disabled={isLoading}
        aria-label={
          isMuted ? "Unmute audio" : "Mute audio"
        }
        className="
          flex
          h-8
          w-8
          shrink-0
          items-center
          justify-center
          rounded-full
          text-muted-foreground
          transition-all
          duration-200
          hover:bg-muted
          hover:text-foreground
          active:scale-95
          disabled:pointer-events-none
        "
      >
        {isMuted ? (
          <VolumeX className="h-4 w-4" />
        ) : (
          <Volume2 className="h-4 w-4" />
        )}
      </button>

      {/* -------------------------------- */}
      {/* Download Button */}
      {/* -------------------------------- */}

      <button
        type="button"
        onClick={handleDownload}
        aria-label="Download audio"
        title="Download audio"
        className="
          flex
          h-8
          w-8
          shrink-0
          items-center
          justify-center
          rounded-full
          text-muted-foreground
          transition-all
          duration-200
          hover:bg-muted
          hover:text-foreground
          active:scale-95
        "
      >
        <Download className="h-4 w-4" />
      </button>
    </div>
  );
}




// "use client";

// import { useEffect, useRef, useState } from "react";
// import WaveSurfer from "wavesurfer.js";
// import {
//     Download,
//     Loader2,
//     Pause,
//     Play,
//     Volume2,
//     VolumeX,
// } from "lucide-react";

// interface AudioMessageProps {
//   src: string;
// }

// // Keeps track of the currently playing audio.
// // This makes sure only ONE audio message plays at a time.
// let activeWaveSurfer: WaveSurfer | null = null;

// export default function AudioMessage({ src }: AudioMessageProps) {
//   const waveformRef = useRef<HTMLDivElement | null>(null);
//   const wavesurferRef = useRef<WaveSurfer | null>(null);

//   const [isPlaying, setIsPlaying] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);
//   const [currentTime, setCurrentTime] = useState(0);
//   const [duration, setDuration] = useState(0);
//   const [isMuted, setIsMuted] = useState(false);

//   useEffect(() => {
//     if (!waveformRef.current) return;

//     const wavesurfer = WaveSurfer.create({
//       container: waveformRef.current,

//       // Compact chat-friendly height
//       height: 38,

//       // Unplayed waveform
//       waveColor: "#9CA3AF",

//       // Played waveform
//       progressColor: "#6FD5AA",

//       // No vertical cursor
//       cursorWidth: 0,

//       // Waveform appearance
//       barWidth: 2,
//       barGap: 2,
//       barRadius: 3,

//       // Makes quiet audio easier to see
//       normalize: true,

//       url: src,
//     });

//     wavesurferRef.current = wavesurfer;

//     // -----------------------------
//     // Loading
//     // -----------------------------

//     wavesurfer.on("loading", (percent) => {
//       setIsLoading(percent < 100);
//     });

//     // -----------------------------
//     // Ready
//     // -----------------------------

//     wavesurfer.on("ready", () => {
//       setIsLoading(false);
//       setDuration(wavesurfer.getDuration());
//     });

//     // -----------------------------
//     // Play
//     // -----------------------------

//     wavesurfer.on("play", () => {
//       // Stop any other currently playing audio
//       if (
//         activeWaveSurfer &&
//         activeWaveSurfer !== wavesurfer
//       ) {
//         activeWaveSurfer.pause();
//       }

//       activeWaveSurfer = wavesurfer;
//       setIsPlaying(true);
//     });

//     // -----------------------------
//     // Pause
//     // -----------------------------

//     wavesurfer.on("pause", () => {
//       setIsPlaying(false);

//       if (activeWaveSurfer === wavesurfer) {
//         activeWaveSurfer = null;
//       }
//     });

//     // -----------------------------
//     // Time update
//     // -----------------------------

//     wavesurfer.on("timeupdate", (time) => {
//       setCurrentTime(time);
//     });

//     // -----------------------------
//     // Finished
//     // -----------------------------

//     wavesurfer.on("finish", () => {
//       setIsPlaying(false);
//       setCurrentTime(0);

//       wavesurfer.seekTo(0);

//       if (activeWaveSurfer === wavesurfer) {
//         activeWaveSurfer = null;
//       }
//     });

//     // -----------------------------
//     // Error
//     // -----------------------------

//     wavesurfer.on("error", (error) => {
//       console.error("Audio playback error:", error);
//       setIsLoading(false);
//     });

//     // -----------------------------
//     // Cleanup
//     // -----------------------------

//     return () => {
//       if (activeWaveSurfer === wavesurfer) {
//         activeWaveSurfer = null;
//       }

//       wavesurfer.destroy();
//       wavesurferRef.current = null;
//     };
//   }, [src]);

//   // -----------------------------
//   // Play / Pause
//   // -----------------------------

//   const togglePlay = () => {
//     if (!wavesurferRef.current || isLoading) return;

//     wavesurferRef.current.playPause();
//   };

//   // -----------------------------
//   // Mute / Unmute
//   // -----------------------------

//   const toggleMute = () => {
//     if (!wavesurferRef.current) return;

//     const nextMuted = !isMuted;

//     wavesurferRef.current.setMuted(nextMuted);
//     setIsMuted(nextMuted);
//   };


//   // -----------------------------
//   // Download Voice Note
//   // -----------------------------

//     const handleDownload = () => {
//         const link = document.createElement("a");

//         link.href = src;
//         link.download = `audio-${Date.now()}`;
//         link.target = "_blank";
//         link.rel = "noopener noreferrer";

//         document.body.appendChild(link);
//         link.click();
//         document.body.removeChild(link);
//     };


//   // -----------------------------
//   // Format time
//   // -----------------------------

//   const formatTime = (time: number) => {
//     if (!Number.isFinite(time)) {
//       return "0:00";
//     }

//     const minutes = Math.floor(time / 60);
//     const seconds = Math.floor(time % 60);

//     return `${minutes}:${seconds
//       .toString()
//       .padStart(2, "0")}`;
//   };

//   return (
//     // <div className="flex w-full max-w-90 items-center gap-2.5">
//     <div className="flex w-80 items-center gap-2.5">
//       {/* -------------------------------- */}
//       {/* Play Button */}
//       {/* -------------------------------- */}

//       <button
//         type="button"
//         onClick={togglePlay}
//         disabled={isLoading}
//         aria-label={
//           isPlaying ? "Pause audio" : "Play audio"
//         }
//         className="
//           flex
//           h-10
//           w-10
//           shrink-0
//           items-center
//           justify-center
//           rounded-full
//           bg-[#6FD5AA]
//           text-black
//           shadow-sm
//           transition-all
//           duration-200
//           hover:scale-105
//           hover:shadow-md
//           active:scale-95
//           disabled:cursor-default
//           disabled:opacity-80
//         "
//       >
//         {isLoading ? (
//           <Loader2 className="h-4 w-4 animate-spin" />
//         ) : isPlaying ? (
//           <Pause className="h-4 w-4 fill-current" />
//         ) : (
//           <Play className="ml-0.5 h-4 w-4 fill-current" />
//         )}
//       </button>

//       {/* -------------------------------- */}
//       {/* Waveform + Time */}
//       {/* -------------------------------- */}

//       <div className="min-w-0 flex-1">
//         <div
//           ref={waveformRef}
//           className="
//             w-full
//             cursor-pointer
//             overflow-hidden
//           "
//         />

//         <div className="mt-0.5 flex items-center justify-between">
//           <span className="text-[11px] tabular-nums text-muted-foreground">
//             {formatTime(currentTime)}
//           </span>

//           <span className="text-[11px] tabular-nums text-muted-foreground">
//             {formatTime(duration)}
//           </span>
//         </div>
//       </div>

//       {/* -------------------------------- */}
//       {/* Mute Button */}
//       {/* -------------------------------- */}

//       <button
//         type="button"
//         onClick={toggleMute}
//         disabled={isLoading}
//         aria-label={isMuted ? "Unmute audio" : "Mute audio"}
//         className=" 
//           flex
//           h-8
//           w-8
//           shrink-0
//           items-center
//           justify-center
//           rounded-full
//           text-muted-foreground
//           transition-all
//           duration-200
//           hover:bg-muted
//           hover:text-foreground
//           active:scale-95
//           disabled:pointer-events-none
//         "
//       >
//         {isMuted ? (
//           <VolumeX className="h-4 w-4" />
//         ) : (
//           <Volume2 className="h-4 w-4" />
//         )}
//       </button>
//     </div>
//   );
// }