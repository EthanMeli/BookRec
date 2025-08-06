import cron from 'cron';
import https from "https";

const job = new cron.CronJob("*/14 * * * *", function() {
  https
    .get(process.env.API_URL, (res) => {
      if (res.statusCode === 200) console.log("GET request sent successfully");
      else console.log("GET request failed", res.statusCode);
    })
    .on("error", (e) => console.error("Error while sending request", e));
});

export default job;

// CRONE JOB EXPLANATION:
// Cron jobs are schedules tasks that run periodically at fixed intervals
// we want to send 1 GET request for every 14 minutes

// How to define a "Schedule"?
// You define a schedule using a cron expression, which consists of five fields representing:

// MIN?UTE, HOUR, DAY OF MONTH, MONTH, DAY OF WEEK

// EXAMPLES && EXPLANATION
// 14 * * * * - Every 14 minutes
// 0 0 * * 0 - At midnight on every Sunday
// 30 3 15 * * - At 30:30 AM on the 15th of every month