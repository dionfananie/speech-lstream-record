import { useState } from "react";
import io from "socket.io-client";

const serverURL = "http://localhost:8080";

// const subscriptions = ["final", "partial", "transcriber-ready", "error"];

// feel free to pass in any props
const useSocket = () => {
  // ... free to add any state or variables
  const socket = io(serverURL);
  const [transcriptText, setTranscriptText] = useState("");

  const initialize = () => {
    socket.on("connect", () => {
      console.log("socket id: ", socket.id);
    });
    socket.on("transcriber-ready", () => {
      console.log("ws from server: transcriber ready! ");
    });

    socket.on("final", (transcript) => {
      setTranscriptText(transcript);
      console.log("ws from server: final transcript received", transcript);
    });

    socket.on("partial", (transcript) => {
      setTranscriptText(transcript);

      console.log("ws from server: partial transcript received", transcript);
    });
  };

  const disconnect = () => {
    socket.on("disconnect", () => {
      console.log(socket.id); // undefined
    });
  };

  const configureStream = (rate) => {
    socket.emit("configure-stream", rate);
  };

  const stopStream = () => {
    socket.emit("stop-stream", true);
  };
  const sendData = (data) => {
    socket.emit("incoming-audio", data);
  };

  // ... free to add more functions
  return {
    initialize,
    disconnect,
    sendData,
    stopStream,
    configureStream,
    transcriptText,
    setTranscriptText,
  };
};

export default useSocket;
