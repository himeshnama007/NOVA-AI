import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });
import mongoose from "mongoose";
import redis from "../../shared/redis/redis.js";
import User from "./models/user.model.js";

const targetCredits = process.argv[2] ? parseInt(process.argv[2], 10) : 1000;
const targetPlan = process.argv[3] || "pro";

async function renew() {
  console.log(`\n🔄 Connecting to MongoDB and Redis...`);
  await mongoose.connect(process.env.MONGODB_URL);

  const users = await User.find({});
  if (!users || users.length === 0) {
    console.log("⚠️ No users found in database.");
    process.exit(0);
  }

  console.log(`\n📋 Found ${users.length} user(s):`);
  for (const user of users) {
    const oldCredits = user.credits;
    user.credits = targetCredits;
    user.totalCredits = targetCredits;
    user.plan = targetPlan;
    user.planExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await user.save();

    console.log(` ✅ ${user.name || user.email} (${user.email}) -> ${oldCredits} ➔ ${targetCredits} credits [Plan: ${targetPlan}]`);

    // Update active Redis session if one exists
    const sessionId = await redis.get(`user-session:${user._id}`);
    if (sessionId) {
      const sessionData = await redis.get(`session:${sessionId}`);
      if (sessionData) {
        const parsed = JSON.parse(sessionData);
        parsed.credits = targetCredits;
        parsed.totalCredits = targetCredits;
        parsed.plan = targetPlan;
        await redis.set(`session:${sessionId}`, JSON.stringify(parsed), "EX", 60 * 60 * 24 * 7);
        console.log(`    ⚡ Updated live Redis session for: ${user.email}`);
      }
    }
  }

  console.log(`\n✨ Successfully renewed credits to ${targetCredits} (${targetPlan}) for all users!\n`);
  redis.disconnect();
  await mongoose.disconnect();
  process.exit(0);
}

renew().catch((err) => {
  console.error("❌ Credit renewal failed:", err);
  process.exit(1);
});
