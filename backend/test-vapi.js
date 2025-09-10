// Test script to check VAPI calls directly
import { getCall, listCalls } from './services/vapiClient.js';
import dotenv from 'dotenv';

dotenv.config();

async function testVapiCalls() {
  try {
    console.log("🔍 Testing VAPI calls...");
    
    // List all calls
    console.log("\n📋 Listing all VAPI calls:");
    const allCalls = await listCalls();
    console.log("Total calls found:", allCalls.length);
    
    if (allCalls.length > 0) {
      // Show details of the latest calls
      const recentCalls = allCalls.slice(0, 3);
      console.log("\n📞 Recent calls details:");
      
      for (const call of recentCalls) {
        console.log(`\n--- Call ID: ${call.id} ---`);
        console.log("Status:", call.status);
        console.log("Created:", call.createdAt);
        console.log("Phone:", call.customer?.number);
        console.log("Duration:", call.duration || 'N/A');
        console.log("Transcript:", call.transcript ? 'Present' : 'None');
        
        if (call.transcript) {
          console.log("Transcript preview:", call.transcript.substring(0, 100) + "...");
        }
      }
    }
    
  } catch (error) {
    console.error("❌ Error testing VAPI:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
  }
}

testVapiCalls();
