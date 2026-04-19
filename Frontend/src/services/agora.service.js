import axios from "axios";
import AgoraRTC from "agora-rtc-sdk-ng";

const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

let localTrack = null;

// 🔹 fetch token using POST
const fetchToken = async (channelName, uid) => {
  const response = await axios.post(
    "http://localhost:3000/call/api/agora/token",
    {
      channelName,
      uid,
    }
  );

  return response.data;
};

// 🔹 join call
export const joinCall = async (channelName, uid) => {
  try {
    const { token, appId } = await fetchToken(channelName, uid);

    await client.join(appId, channelName, token, uid);

    localTrack = await AgoraRTC.createMicrophoneAudioTrack();

    await client.publish([localTrack]);

    client.on("user-published", async (user, mediaType) => {
      await client.subscribe(user, mediaType);

      if (mediaType === "audio") {
        user.audioTrack.play();
      }
    });
 

    console.log("✅ Call started");
  } catch (err) {
    console.error("Call error:", err);
  }
};
// 🔹 Leave call
export const leaveCall = async () => {
  try {
    if (localTrack) {
      localTrack.stop();
      localTrack.close();
    }

    await client.leave();

    console.log("Left call");
  } catch (error) {
    console.error("Leave call error:", error);
  }
};