import Transcriber from "./transcriber.js";

/**
 * Events to subscribe to:
 * - connection: Triggered when a client connects to the server.
 * - configure-stream: Requires an object with a 'sampleRate' property.
 * - incoming-audio: Requires audio data as the parameter.
 * - stop-stream: Triggered when the client requests to stop the transcription stream.
 * - disconnect: Triggered when a client disconnects from the server.
 *
 *
 * Events to emit:
 * - transcriber-ready: Emitted when the transcriber is ready.
 * - final: Emits the final transcription result (string).
 * - partial: Emits the partial transcription result (string).
 * - error: Emitted when an error occurs.
 */

const initializeWebSocket = (io) => {
  const transcriber = new Transcriber(process.env.DEEPGRAM_API_KEY);
  io.on("connection", (socket) => {
    console.log(`connection made (${socket.id})`);
    if (transcriber) {
      socket.emit("transcriber-ready", true);
    }

    socket.on("configure-stream", (data) => {
      transcriber.startTranscriptionStream(data);
      console.log("ws: received stream configuration from client: ", data);
    });

    socket.on("stop-stream", () => {
      transcriber.endTranscriptionStream();
    });

    socket.on("incoming-audio", (data) => {
      try {
        console.log("ws: received data audio from client: ");
        transcriber.send(data);
        if (transcriber.transcript) {
          const keyEmit = transcriber.isFinal ? "final" : "partial";
          socket.emit(keyEmit, transcriber.transcript);
        }
      } catch (error) {
        console.log("ws: error send transcript");
      }
    });

    // ... add needed event handlers and logic
  });

  return io;
};

export default initializeWebSocket;
