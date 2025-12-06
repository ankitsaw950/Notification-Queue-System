import { Queue } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis({
  host: "127.0.0.1",
  port: 6379,
});

const emailQueue = new Queue("emailQueue", {
  connection,
});


const dlq = new Queue("emailQueue:dlq", { connection });

async function run() {
  console.log("Adding Job to queue ...");

  await emailQueue.add(
    "sendEmail",
    {
      to: "ankit@ankit.com",
      subject: "Welcome Ankit",
    },
    {
      // ⭐ Auto retries
      attempts: 5,

      // ⭐ Exponential Backoff
      backoff: {
        type: "exponential",
        delay: 3000, // first retry after 3 sec
      },

      // ⭐ Job timeout (alternative way)
      timeout: 5000,
    }
  );

  console.log("Job added ...");
}

run();
