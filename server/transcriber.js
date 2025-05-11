import { createClient, LiveTranscriptionEvents } from "@deepgram/sdk";
import EventEmitter from "events";

class Transcriber extends EventEmitter {
  constructor(apiKey) {
    super();
    this.deepgram = createClient(apiKey);
    this.apiKey = apiKey;
    this.liveClient = null;
    this.transcript = null;
    this.isFinal = false;
    this.keepAlive = null;
  }
  clearTranscript() {
    this.transcript = null;
  }
  // sampleRate: number
  startTranscriptionStream(sampleRate) {
    // example deepgram configuration

    const live = this.deepgram.listen.live({
      model: "nova-3",
      punctuate: true,
      language: "en",
      interim_results: true,
      diarize: false,
      smart_format: true,
      endpointing: 0,
      encoding: "linear16",
      sample_rate: sampleRate,
    });

    if (this.keepAlive) clearInterval(keepAlive);
    this.keepAlive = setInterval(() => {
      console.log("deepgram: keepalive");
      live.keepAlive();
    }, 10 * 1000);

    if (live) {
      this.liveClient = live;
      console.log("ws: deepgram transcriber client is live!");
      live.on(LiveTranscriptionEvents.Open, async () => {
        console.log("deepgram: connected");

        live.on(LiveTranscriptionEvents.Transcript, (data) => {
          // console.log("deepgram: transcript received");
          // console.log("ws: transcript sent to client");

          const { channel, is_final } = data || {};
          const { alternatives } = channel;
          const text = alternatives[0].transcript;
          // console.log("data", JSON.stringify(data));

          if (text !== "") {
            this.transcript = text;
          }
          this.isFinal = is_final;
        });

        live.on(LiveTranscriptionEvents.Error, async (error) => {
          console.log("deepgram: error received");
          console.error(error);
        });

        live.on(LiveTranscriptionEvents.Warning, async (warning) => {
          console.log("deepgram: warning received");
          console.warn(warning);
        });
      });
    }
    /*
    {
      model: "nova-2",
      punctuate: true,
      language: "en",
      interim_results: true,
      diarize: false,
      smart_format: true,
      endpointing: 0,
      encoding: "linear16",
      sample_rate: sampleRate,
    }
      */
  }

  endTranscriptionStream() {
    this.liveClient = null;
    this.isFinal = false;
    this.keepAlive = null;
    this.transcript = null;
    // close deepgram connection here
  }

  // NOTE: deepgram must be ready before sending audio payload or it will close the connection
  send(payload) {
    try {
      if (this.liveClient.getReadyState() === 1) {
        this.liveClient.send(payload);
        console.log("ws: live send data to deepgram server");
      }
    } catch (error) {
      console.log("ws: no transcriber live client", error);
    }
  }

  // ... feel free to add more functions
}

export default Transcriber;
