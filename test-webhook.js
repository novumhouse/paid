// Test script to send a sample webhook to the worker
const fetch = require('node-fetch');

// Replace with your worker URL
const WORKER_URL = 'https://purple-field-f4ac.noho.workers.dev';

// Sample Retell AI webhook data
const sampleData = {
  event: 'call_ended',
  call: {
    call_type: 'phone_call',
    from_number: '+12137771234',
    to_number: '+12137771235',
    direction: 'inbound',
    call_id: 'test-call-id-123',
    agent_id: 'test-agent-id-456',
    call_status: 'completed',
    metadata: {
      customer_name: 'Test Customer',
      test_mode: true
    },
    retell_llm_dynamic_variables: {
      customer_name: 'Test Customer'
    },
    start_timestamp: Date.now() - 60000, // 1 minute ago
    end_timestamp: Date.now(),
    disconnection_reason: 'user_hangup',
    transcript: 'This is a test transcript for the webhook test.'
  }
};

async function testWebhook() {
  try {
    console.log('Sending test webhook data to worker...');
    const response = await fetch(WORKER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sampleData),
    });

    const responseText = await response.text();
    console.log(`Response status: ${response.status}`);
    console.log(`Response body: ${responseText}`);
  } catch (error) {
    console.error('Error sending test webhook:', error);
  }
}

testWebhook(); 