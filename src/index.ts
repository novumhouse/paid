/**
 * Retell AI Webhook to Paid.ai Forwarder
 * 
 * This worker receives webhooks from Retell AI and forwards the data to paid.ai
 * using the @agentpaid/ap-node-client library.
 */

import { ApClient } from '@agentpaid/ap-node-client';

// Define our environment variables
export interface Env {
	PAID_API_KEY: string;
}

interface RetellEvent {
	event: 'call_started' | 'call_ended' | 'call_analyzed';
	call: {
		call_id: string;
		agent_id: string;
		from_number: string;
		to_number: string;
		direction: string;
		call_status: string;
		metadata?: Record<string, any>;
		retell_llm_dynamic_variables?: Record<string, any>;
		start_timestamp?: number;
		end_timestamp?: number;
		disconnection_reason?: string;
		transcript?: string;
		transcript_object?: any[];
		transcript_with_tool_calls?: any[];
	};
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		// Only accept POST requests
		if (request.method !== 'POST') {
			return new Response('Method not allowed', { status: 405 });
		}
		
		try {
			// Get the API key from environment variables
			const apiKey = env.PAID_API_KEY;
			
			if (!apiKey) {
				return new Response('API key not configured', { status: 500 });
			}
			
			// Initialize the Paid.ai client
			const client = new ApClient(apiKey);
			
			// Parse the webhook data
			const data = await request.json() as RetellEvent;
			
			// Extract relevant information
			const { event, call } = data;
			const { agent_id, call_id, transcript } = call;
			
			// Only process call_ended or call_analyzed events
			if (event === 'call_ended' || event === 'call_analyzed') {
				// Prepare usage data for Paid.ai
				const customerId = call.from_number || 'unknown';
				const signalName = `retell_${event}`;
				
				// Create additional data object
				const additionalData: Record<string, any> = {
					call_id,
					event_type: event,
					call_direction: call.direction || 'unknown',
				};
				
				// Add transcript info if available
				if (transcript) {
					additionalData.transcript_length = transcript.length;
				}
				
				// Add duration if available
				if (call.start_timestamp && call.end_timestamp) {
					additionalData.duration_seconds = 
						Math.floor((call.end_timestamp - call.start_timestamp) / 1000);
				}
				
				// Add any custom metadata if available
				if (call.metadata) {
					additionalData.metadata = call.metadata;
				}
				
				// Record the usage to Paid.ai
				await client.recordUsage(agent_id, customerId, signalName, additionalData);
				
				// Return success
				return new Response('Usage recorded successfully', { status: 200 });
			}
			
			// For call_started events, just acknowledge receipt
			return new Response('Event received but not processed', { status: 200 });
			
		} catch (error: unknown) {
			console.error('Error processing webhook:', error);
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			return new Response(`Error processing webhook: ${errorMessage}`, { status: 500 });
		}
	},
};
