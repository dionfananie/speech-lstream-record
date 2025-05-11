import { useEffect } from "react";
import useAudioRecorder from "./useAudioRecorder";
import useSocket from "./useSocket";

// IMPORTANT: To ensure proper functionality and microphone access, please follow these steps:
// 1. Access the site using 'localhost' instead of the local IP address.
// 2. When prompted, grant microphone permissions to the site to enable audio recording.
// Failure to do so may result in issues with audio capture and transcription.
// NOTE: Don't use createPortal()

function App() {
  const {
    initialize,
    sendData,
    stopStream,
    configureStream,
    transcriptText,
    setTranscriptText,
  } = useSocket();

  useEffect(() => {
    // Note: must connect to server on page load but don't start transcriber
    initialize();
  }, []);

  const { startRecording, stopRecording, isRecording } = useAudioRecorder({
    dataCb: (data) => {
      sendData(data);
    },
  });

  const onStartRecordingPress = async () => {
    const resp = await startRecording();
    configureStream(resp);

    // start recorder and transcriber (send configure-stream)
  };

  const onStopRecordingPress = async () => {
    await stopRecording();
    stopStream();
  };

  // ... add more functions
  return (
    <div>
      <h1>Speechify Voice Notes</h1>
      <textarea
        rows={10}
        cols="50"
        value={transcriptText}
        onChange={(v) => {
          setTranscriptText(v.target.value);
        }}
      ></textarea>
      <p>Record or type something in the textbox.</p>
      <div>
        <button
          onClick={isRecording ? onStopRecordingPress : onStartRecordingPress}
        >
          {isRecording ? "Stop" : "Start"} Recording
        </button>
        <button
          onClick={() => {
            navigator.clipboard.writeText(transcriptText);
          }}
        >
          Copy text
        </button>
        <button onClick={() => setTranscriptText("")}>Clear</button>
      </div>
    </div>
  );
}

export default App;
