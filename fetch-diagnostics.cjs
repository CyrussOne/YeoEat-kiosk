#!/usr/bin/env node

/**
 * Fetch diagnostic logs from Supabase
 */

const https = require('https');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://tnqdlzbsbbyituoexhku.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_KEY) {
  console.error('❌ VITE_SUPABASE_PUBLISHABLE_KEY not found in environment');
  console.log('Please set it in .env file');
  process.exit(1);
}

const options = {
  hostname: 'tnqdlzbsbbyituoexhku.supabase.co',
  path: '/rest/v1/diagnostic_logs?select=*&order=created_at.desc&limit=5',
  method: 'GET',
  headers: {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json'
  }
};

console.log('🔍 Fetching diagnostic logs from Supabase...\n');

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const logs = JSON.parse(data);

      if (res.statusCode !== 200) {
        console.error('❌ Error:', data);
        return;
      }

      if (logs.length === 0) {
        console.log('📭 No diagnostic logs found');
        return;
      }

      console.log(`📊 Found ${logs.length} diagnostic log(s):\n`);

      logs.forEach((log, index) => {
        console.log(`${'='.repeat(80)}`);
        console.log(`LOG #${index + 1}`);
        console.log(`${'='.repeat(80)}`);
        console.log(`ID: ${log.id}`);
        console.log(`Platform: ${log.platform} ${log.is_native ? '📱 Native' : '🌐 Web'}`);
        console.log(`Device ID: ${log.device_id?.substring(0, 50)}...`);
        console.log(`Printer Status: ${log.printer_status || 'unknown'}`);
        console.log(`Supabase Connected: ${log.supabase_connected ? '✅' : '❌'}`);
        console.log(`Error Count: ${log.error_count || 0}`);
        console.log(`Created: ${new Date(log.created_at).toLocaleString()}`);
        console.log(`\n--- FULL LOG ---\n`);
        console.log(log.log_text);
        console.log(`\n`);
      });

      console.log(`${'='.repeat(80)}`);
      console.log('✅ Done!');
    } catch (error) {
      console.error('❌ Error parsing response:', error);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error);
});

req.end();
