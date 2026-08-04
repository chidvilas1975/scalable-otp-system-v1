import { Worker } from "bullmq";

import { bullConnection } from "../config/bullmq.js";

import transporter from "../config/mailer.js";

import { otpEmailTemplate } from "../emails/otp.email.js";
import env from "../config/env.js";
import logger from "../config/logger.js";

const worker = new Worker(
  "email",

  async (job) => {
    console.log("Processing job:", job.id);

    const { email, otp } = job.data;

    await transporter.sendMail({
      from: env.EMAIL_USER,

      to: email,

      subject: "Your OTP Login Code",

      html: otpEmailTemplate(otp),
    });

    console.log("Email sent to:", email);
  },

  {
    connection: bullConnection,

    concurrency: 50,

    lockDuration: 60000,

    lockRenewTime: 30000,
  },
);

worker.on(
    "completed",
    (job)=>{

        logger.info(
            {
                jobId: job.id
            },
            "Email job completed"
        );

    }
);


worker.on("failed", (job, error) => {
  logger.error(
    {
      jobId: job?.id,
      error: error.message,
    },
    "Email job failed",
  );
});

console.log("Email worker started");
