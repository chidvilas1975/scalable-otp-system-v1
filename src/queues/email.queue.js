import { Queue } from "bullmq";
import { bullConnection } from "../config/bullmq.js";


const emailQueue = new Queue(
    "email",
    {
        connection: bullConnection
    }
);

emailQueue.on("error", (error) => {
    console.log("Queue Error:", error.message);
});


export default emailQueue;