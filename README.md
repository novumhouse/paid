# Retell AI to Paid.ai Webhook Forwarder

This Cloudflare Worker receives webhooks from Retell AI's call events and forwards usage data to paid.ai's tracking system.

## Features

- Receives webhook events from Retell AI (`call_started`, `call_ended`, `call_analyzed`)
- Processes call data and formats it for paid.ai tracking
- Forwards usage data to paid.ai via the `@agentpaid/ap-node-client` library
- Handles error cases gracefully

## Setup

### Prerequisites

- Node.js and npm installed
- Cloudflare account
- Wrangler CLI installed (`npm install -g wrangler`)
- API key from paid.ai

### Installation

1. Clone this repository
2. Install dependencies:

```bash
npm install
```

3. Set up your paid.ai API key as a secret:

```bash
wrangler secret put PAID_API_KEY
```

When prompted, enter your actual API key from paid.ai. This securely stores the API key as a secret in Cloudflare rather than in your configuration files.

#### API Key Configuration Options

There are three ways to configure your PAID_API_KEY:

1. **As a Cloudflare secret (RECOMMENDED)**: Use `wrangler secret put PAID_API_KEY` to securely store your key.

2. **Using environment variables in development**: When running locally, you can set the environment variable before running:
   ```bash
   export PAID_API_KEY=your_api_key  # For macOS/Linux
   $env:PAID_API_KEY="your_api_key"  # For PowerShell
   set PAID_API_KEY=your_api_key     # For Windows CMD
   ```

3. **In the wrangler.jsonc file (NOT RECOMMENDED)**: The file contains a placeholder, but for security reasons, you should use one of the methods above instead of putting the real API key in this file.

### Development

Run the worker locally:

```bash
npm run dev
```

### Testing

You can use the included test script to send a sample webhook to your deployed worker:

```bash
node test-webhook.js
```

Make sure to update the `WORKER_URL` in the script to match your deployed worker URL.

### Deployment

Deploy the worker to Cloudflare:

```bash
npm run deploy
```

## Configuring Retell AI Webhooks

1. In your Retell AI dashboard, go to the webhook settings
2. Add a new webhook and enter your Cloudflare Worker URL (e.g., `https://purple-field-f4ac.worker.dev`)
3. Select the events you want to forward: `call_started`, `call_ended`, and `call_analyzed`
4. Save your webhook configuration

## Usage

The worker will automatically process incoming webhooks from Retell AI and forward the data to paid.ai.

### Data Mapping

The worker maps Retell AI event data to paid.ai usage events as follows:

- `agent_id` from Retell AI is used as the agent ID in paid.ai
- The caller's phone number (`from_number`) is used as the customer ID
- Event type is prefixed with `retell_` (e.g., `retell_call_ended`)
- Additional data includes call direction, duration, transcript length, and any custom metadata

## Troubleshooting

- **API Key Issues**: If you receive a "API key not configured" error, check that your PAID_API_KEY secret is properly set using `wrangler secret put PAID_API_KEY`.
- **Webhook Not Working**: Verify the webhook URL in your Retell AI dashboard and check the Cloudflare Worker logs.
- **Worker Deployment Issues**: Check for any errors in your deployment logs with `wrangler tail`.

For more detailed logs, check the Cloudflare Worker logs in your Cloudflare dashboard.

## License

MIT 