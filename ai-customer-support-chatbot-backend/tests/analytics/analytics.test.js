require("dotenv").config({ path: __dirname + "/../../.env" });
const analyticsService = require("../../src/modules/analytics/analytics.service");
const prisma = require("../../src/config/prisma");

async function runTests() {
  console.log("=== ANALYTICS DASHBOARD API TESTS ===\n");
  
  try {
    const fromStr = "2020-01-01";
    const toStr = new Date().toISOString().split("T")[0];

    // 1. Overview Metrics
    console.log("--- 1. Testing Overview Metrics ---");
    const overview = await analyticsService.getOverview(fromStr, toStr);
    console.log(overview);
    if (overview.totalConversations >= 0 && overview.totalUsers >= 0) {
      console.log("✅ Passed");
    } else {
      console.log("❌ Failed");
    }

    // 2. Intent Distribution
    console.log("\n--- 2. Testing Intent Distribution ---");
    const intents = await analyticsService.getIntents(fromStr, toStr);
    console.log(intents);
    if (typeof intents === 'object') {
      console.log("✅ Passed");
    } else {
      console.log("❌ Failed");
    }

    // 3. Conversation Stats
    console.log("\n--- 3. Testing Conversation Stats ---");
    const convs = await analyticsService.getConversations(fromStr, toStr);
    console.log(convs);
    if (convs.active !== undefined && convs.closed !== undefined) {
      console.log("✅ Passed");
    } else {
      console.log("❌ Failed");
    }

    // 4. NLP Stats
    console.log("\n--- 4. Testing NLP Stats ---");
    const nlp = await analyticsService.getNlpStats(fromStr, toStr);
    console.log(nlp);
    if (nlp.avgConfidence >= 0) {
      console.log("✅ Passed");
    } else {
      console.log("❌ Failed");
    }

    // 5. CSV Export
    console.log("\n--- 5. Testing CSV Export Output ---");
    const csvData = await analyticsService.generateExport("csv", fromStr, toStr);
    console.log(csvData.split("\n").slice(0, 3).join("\n")); // preview
    if (csvData.includes("Metric,Value")) {
      console.log("✅ Passed");
    } else {
      console.log("❌ Failed");
    }

    console.log("\nAll Backend Aggregations processed cleanly without crashing!");

  } catch (error) {
    console.error("Test execution failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
