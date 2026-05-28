const Outbox = require("../models/outbox.model");
const { connectRabbitMQ, publishToQueue } = require("../services/rabbit");

let isRunning = false;

const processOutbox = async () => {
  if (isRunning) return;
  isRunning = true;

  try {
    // We lock the event by changing its status to PROCESSING atomically
    // This prevents multiple worker instances from processing the same event.
    while (true) {
      const event = await Outbox.findOneAndUpdate(
        { status: "PENDING" },
        { $set: { status: "PROCESSING" } },
        { returnDocument: "after" },
      );

      // If no events are pending, break the loop
      if (!event) {
        break;
      }

      try {
        // Use the eventType (e.g., USER_CREATED) as the routing queue
        console.log(" Event type:", event.eventType);
        const response = await publishToQueue(event.eventType, event.payload);
        console.log(" Response:", response);
        // if(response && response.message == ){
          
        // }
        console.log("is response valid",response);
        if (response && response.success === false) {
          throw new Error(response.error || "Consumer returned success: false");
        }

        event.status = "SENT";
        event.sentAt = new Date();
        await event.save();

        console.log(" Event sent successfully:", event.eventType);
      } catch (err) {
        event.retryCount += 1;
        event.lastError = err.message;

        if (event.retryCount >= 5) {
          event.status = "FAILED";
          console.error(
            `🚨 CRITICAL: Event ${event._id} (type: ${event.eventType}) completely FAILED after 5 retries. Sent to DLQ. Admin intervention required.`,
          );
        } else {
          event.status = "PENDING";
        }

        await event.save();
      }
    }
  } catch (err) {
    console.error("Worker Error:", err.message);
  } finally {
    isRunning = false;
  }
};

module.exports.startOutboxWorker = () => {
  console.log("Outbox Worker Poller initialized by server...");
  setInterval(processOutbox, 5000);
};
