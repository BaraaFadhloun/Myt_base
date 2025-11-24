"use client"

import type Plyr from "plyr"
import { useEffect, useRef, useImperativeHandle, forwardRef } from "react"
import "plyr/dist/plyr.css"
import "@/styles/plyr-purple-theme.css"
import "@/styles/plyr-top-controls.css"

interface PurpleVideoPlayerProps {
  onPlayStateChange?: (isPlaying: boolean) => void
}

export interface VideoPlayerRef {
  play: () => void
  pause: () => void
  toggle: () => void
  isPlaying: () => boolean
}

const PurpleVideoPlayer = forwardRef<VideoPlayerRef, PurpleVideoPlayerProps>(({ onPlayStateChange }, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<Plyr | null>(null)

  useImperativeHandle(ref, () => ({
    play: () => {
      playerRef.current?.play()
    },
    pause: () => {
      playerRef.current?.pause()
    },
    toggle: () => {
      if (!playerRef.current) return
      if (playerRef.current.playing) {
        playerRef.current.pause()
      } else {
        playerRef.current.play()
      }
    },
    isPlaying: () => {
      return playerRef.current ? playerRef.current.playing : false
    },
  }))

  useEffect(() => {
    if (!videoRef.current) return

    let isMounted = true

    const setupPlayer = async () => {
      const { default: PlyrModule } = await import("plyr")

      if (!isMounted || !videoRef.current) return

      const player = new PlyrModule(videoRef.current, {
        controls: ["play", "current-time", "progress", "duration", "mute", "volume", "settings", "fullscreen"],
        settings: ["captions", "quality", "speed"],
        resetOnEnd: false,
        displayDuration: true,
        hideControls: false,
        clickToPlay: true,
        disableContextMenu: false,
        keyboard: { focused: false, global: false },
      })

      playerRef.current = player

      player.on("play", () => onPlayStateChange?.(true))
      player.on("pause", () => onPlayStateChange?.(false))
    }

    void setupPlayer()

    return () => {
      isMounted = false
      if (playerRef.current) {
        playerRef.current.destroy()
        playerRef.current = null
      }
    }
  }, [onPlayStateChange])

  return (
    <div className="plyr-container">
      <video
        ref={videoRef}
        className="plyr-react plyr"
        playsInline
        controls
        style={{ width: "100%", height: "100%" }}
      >
        <source src="https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-576p.mp4" type="video/mp4" />
      </video>
    </div>
  )
})

PurpleVideoPlayer.displayName = "PurpleVideoPlayer"

export default PurpleVideoPlayer
