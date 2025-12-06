import { Worker } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis({
  host: "127.0.0.1",
  port: 6379,
  maxRetriesPerRequest: null,
});

const worker = new Worker(
  "emailQueue",
  async (job) => {
    // simulate failure
    if (Math.random() > 0.7) {
      throw new Error("Email provider failed");
    }

    console.log("Received job : ", job.id);
    console.log("send Email to : ", job.data.to);

    await new Promise((resolve) => {
      setTimeout(resolve, 5000);
    });

    console.log("Email sent to : ", job.data.to);
  },
  {
    connection,
    //  CONCURRENCY → parallel processing
    concurrency: 5,

    //  TIMEOUT → kill job if it takes too long (ms)
    // job must finish within 5 seconds
    timeout: 5000,
  }
);

worker.on("completed", async (job) => {
  console.log("Job completed : ", job.id);
});

worker.on("failed", async (job, err) => {
  console.log(`❌ Job failed permanently: ${job.id}`, err.message);

  // push job to DLQ
  await dlq.add("failed-email", {
    originalJobId: job.id,
    data: job.data,
    failedReason: err.message,
    attemptsMade: job.attemptsMade,
  });
});
