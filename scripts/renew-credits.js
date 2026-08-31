import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read auth .env manually to avoid external dependency issues
const envPath = path.join(__dirname, "../backend/services/auth/.env");
let mongoUri = "mongodb+srv://himeshnama2405_db_user:MeS3FzzlGfYiFKyS@cluster0.yc3lx1f.mongodb.net/auth";
let redisUrl = "redis://localhost:6379";

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  const mongoMatch = envContent.match(/MONGODB_URL=["']?([^"'\r\n]+)/);
  const redisMatch = envContent.match(/REDIS_URL=["']?([^"'\r\n]+)/);
  if (mongoMatch) mongoUri = mongoMatch[1];
  if (redisMatch) redisUrl = redisMatch[1];
}

const { default: mongoose } = await import("../backend/services/auth/node_modules/mongoose/index.js");
const { default: Redis } = await import("../backend/services/auth/node_modules/ioredis/built/index.js");

const targetCredits = process.argv[2] ? parseInt(process.argv[2], 10) : 1000;
const targetPlan = process.argv[3] || "pro";

async function renew() {
  console.log(`\n🔄 Connecting to database and Redis...`);
  await mongoose.connect(mongoUri);
  const redis = new Redis(redisUrl);

  const User = mongoose.model(
    "User",
    new mongoose.Schema(
      {
        firebaseUid: String,
        name: String,
        email: String,
        plan: String,
        credits: Number,
        totalCredits: Number,
        planExpiresAt: Date
      },
      { timestamps: true }
    )
  );

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
