# Setup Guide

## Environment Variables Setup

**Important:** For security, NocoDB credentials are configured server-side only.

Create a `.env.local` file in your project root:

\`\`\`env
# NocoDB Configuration (Server-side - secure)
NOCODB_BASE_URL=https://your-nocodb-instance.com
NOCODB_TOKEN=your-api-token
NOCODB_READINGS_TABLE_ID=your-readings-table-id
NOCODB_BILLS_TABLE_ID=your-bills-table-id
\`\`\`

**Security Note:** These variables do NOT use the `NEXT_PUBLIC_` prefix, ensuring they remain server-side only and are never exposed to the client browser.

### Getting NocoDB Credentials

1. **Base URL**: Your NocoDB instance URL (e.g., `https://app.nocodb.com`)
2. **API Token**: 
   - Go to your NocoDB dashboard
   - Click on your profile → Account Settings
   - Generate a new API token
3. **Table IDs** (NocoDB v2):
   - Navigate to your **Readings** table in NocoDB
   - Click **Details** → **API Snippets**
   - Copy the Table ID from the URL: `https://app.nocodb.com/api/v2/tables/{TABLE_ID}/records`
   - Repeat for your **Bills** table

**Alternative method to find Table IDs:**
- Open any table in NocoDB
- Look at the browser URL: `https://app.nocodb.com/dashboard/#/nc/{workspace}/{base}/{table_id}`
- The last segment is your Table ID

## Sync Configuration

Once server environment variables are set:

1. Restart your development server
2. The app will automatically detect NocoDB configuration
3. Click the sync icon in the app header
4. Configure sync settings:
   - **Auto Sync**: Enable/disable automatic synchronization
   - **Sync Interval**: How often to sync (1-60 minutes)
5. Click "Save Configuration"

## Database Schema

Create these tables in your NocoDB project:

### Readings Table
- `id` (SingleLineText, Primary)
- `date` (Date)
- `ground_floor` (Number)
- `first_floor` (Number)
- `total_consumption` (Number)
- `created_at` (DateTime)

### Bills Table
- `id` (SingleLineText, Primary)
- `bill_number` (SingleLineText)
- `billing_period` (SingleLineText)
- `due_date` (Date)
- `amount` (Decimal)
- `units_consumed` (Number)
- `tariff_rate` (Decimal)
- `created_at` (DateTime)

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard:
   - Go to Project Settings → Environment Variables
   - Add: `NOCODB_BASE_URL`, `NOCODB_TOKEN`, `NOCODB_READINGS_TABLE_ID`, `NOCODB_BILLS_TABLE_ID`
4. Deploy

### Other Platforms

Ensure your deployment platform supports:
- Node.js 18+
- Server-side environment variables
- API routes
- Static file serving

## Security Best Practices

### Environment Variables
- Never use `NEXT_PUBLIC_` prefix for sensitive data
- Store API tokens server-side only
- Use different tokens for development and production
- Regularly rotate API tokens

### NocoDB Setup
- Use strong API tokens
- Limit token permissions to required tables only
- Enable IP restrictions if possible
- Monitor API usage for unusual activity

## Troubleshooting

### Common Issues

**"Sync not working"**
- Check server environment variables are set correctly
- Restart development server after adding variables
- Verify NocoDB credentials are valid
- Ensure both readings and bills tables exist with correct schema
- Verify both table IDs are correct

**"NocoDB not configured"**
- Verify environment variables don't have `NEXT_PUBLIC_` prefix
- Check variable names match exactly: `NOCODB_BASE_URL`, `NOCODB_TOKEN`, `NOCODB_READINGS_TABLE_ID`, `NOCODB_BILLS_TABLE_ID`
- Restart server after adding variables

**"API errors"**
- Check browser network tab for API call failures
- Verify NocoDB instance is accessible
- Check API token permissions
- Ensure table IDs are correct
