// Script to sync VAPI calls with our database
import { getCall, listCalls } from './services/vapiClient.js';
import { Call } from './models/index.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function syncVapiCalls() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, { dbName: "vapi_demo" });
    console.log("✅ Connected to MongoDB");

    console.log("🔄 Syncing VAPI calls with database...");
    
    // Get all calls from our database
    const dbCalls = await Call.find({});
    console.log(`📂 Found ${dbCalls.length} calls in database`);

    // Get all calls from VAPI
    const vapiCalls = await listCalls();
    console.log(`📞 Found ${vapiCalls.length} calls in VAPI`);

    let updated = 0;
    let errors = 0;

    // Update each database call with VAPI data
    for (const dbCall of dbCalls) {
      if (!dbCall.vapiCallId) {
        console.log(`⚠️ Skipping call ${dbCall._id} - no VAPI ID`);
        continue;
      }

      try {
        // Find corresponding VAPI call
        const vapiCall = vapiCalls.find(vc => vc.id === dbCall.vapiCallId);
        
        if (vapiCall) {
          // Update database call with VAPI data
          const updateData = {};
          
          if (vapiCall.status && vapiCall.status !== dbCall.status) {
            updateData.status = vapiCall.status;
          }
          
          if (vapiCall.transcript && vapiCall.transcript !== dbCall.transcript) {
            updateData.transcript = vapiCall.transcript;
          }
          
          if (vapiCall.duration && vapiCall.duration !== dbCall.duration) {
            updateData.duration = vapiCall.duration;
          }

          if (Object.keys(updateData).length > 0) {
            await Call.findByIdAndUpdate(dbCall._id, updateData);
            console.log(`✅ Updated call ${dbCall.vapiCallId}:`, Object.keys(updateData));
            updated++;
          } else {
            console.log(`✓ Call ${dbCall.vapiCallId} already up to date`);
          }
        } else {
          console.log(`⚠️ VAPI call ${dbCall.vapiCallId} not found in VAPI response`);
        }
      } catch (error) {
        console.error(`❌ Error updating call ${dbCall.vapiCallId}:`, error.message);
        errors++;
      }
    }

    console.log(`\n📊 Sync Summary:`);
    console.log(`✅ Updated: ${updated} calls`);
    console.log(`❌ Errors: ${errors} calls`);
    console.log(`✓ Total processed: ${dbCalls.length} calls`);

  } catch (error) {
    console.error("❌ Sync error:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("📀 Disconnected from MongoDB");
  }
}

syncVapiCalls();
