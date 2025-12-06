import { QueueScheduler } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis();

new QueueScheduler("emailQueue", {
  connection,
});

console.log("⏳ Queue Scheduler running...");
