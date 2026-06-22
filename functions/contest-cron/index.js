const https = require("https");

/*
  This script can be deployed as an Appwrite Function or run via a standard cron job.
  It triggers the contest-calculate endpoint at midnight to calculate and distribute points.
*/

module.exports = async function(context) {
  const url = process.env.APP_URL || "http://localhost:3000";
  const cronSecret = process.env.CRON_SECRET || "secret";

  try {
    const res = await fetch(`${url}/api/cron/contest-calculate`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${cronSecret}`
      }
    });

    const data = await res.json();
    
    if (context && context.log) {
      context.log("Contest Calculation Triggered Successfully");
      context.log(JSON.stringify(data));
      return context.res.json(data);
    } else {
      console.log("Contest Calculation Triggered Successfully");
      console.log(data);
    }
  } catch (error) {
    if (context && context.error) {
      context.error("Failed to trigger contest calculation");
      context.error(error.message);
      return context.res.json({ error: error.message }, 500);
    } else {
      console.error("Failed to trigger contest calculation", error);
    }
  }
};

// Auto-run if executed directly via Node
if (require.main === module) {
  module.exports(null);
}
