import { useState, useRef } from "react"

export function useBrowserRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null)

  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<BlobPart[]>([])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      })

      streamRef.current = stream
      chunksRef.current = []

      const recorder = new MediaRecorder(stream)

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" })
        const url = URL.createObjectURL(blob)

        setRecordedVideo(url)
        setIsRecording(false)

        streamRef.current?.getTracks().forEach(track => track.stop())
      }

      recorderRef.current = recorder
      recorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error("Error starting recording:", error)
    }
  }

  const stopRecording = () => {
    recorderRef.current?.stop()
  }

  return {
    isRecording,
    recordedVideo,
    startRecording,
    stopRecording,
    setRecordedVideo
  }
}
