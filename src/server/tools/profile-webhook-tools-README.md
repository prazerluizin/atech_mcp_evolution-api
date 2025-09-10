# Profile and Webhook Management Tools

This module provides comprehensive MCP tools for managing WhatsApp profiles, privacy settings, business profiles, and webhook configurations through the Evolution API v2.

## Overview

The `ProfileWebhookTools` class implements 11 different tools that cover:

- **Profile Management**: Update profile name, status, and picture
- **Privacy Settings**: Configure who can see your profile information
- **Business Profile**: Manage business account information
- **Webhook Management**: Configure event notifications
- **API Information**: Get Evolution API server status and information

## Available Tools

### Profile Management Tools

#### 1. `evolution_fetch_profile`
Fetch profile information for a WhatsApp instance.

**Parameters:**
- `instance` (string, required): Name of the WhatsApp instance
- `number` (string, optional): Phone number to fetch profile for (defaults to instance owner)

**Example:**
```typescript
const result = await tool.handler({
  instance: 'my_whatsapp_bot',
  number: '5511999999999' // optional
});
```

#### 2. `evolution_update_profile_name`
Update the profile display name.

**Parameters:**
- `instance` (string, required): Name of the WhatsApp instance
- `name` (string, required): New profile name (max 25 characters)

**Example:**
```typescript
const result = await tool.handler({
  instance: 'my_whatsapp_bot',
  name: 'My Business Bot'
});
```

#### 3. `evolution_update_profile_status`
Update the profile status message.

**Parameters:**
- `instance` (string, required): Name of the WhatsApp instance
- `status` (string, required): New status message (max 139 characters)

**Example:**
```typescript
const result = await tool.handler({
  instance: 'my_whatsapp_bot',
  status: 'Available for business inquiries 24/7'
});
```

#### 4. `evolution_update_profile_picture`
Update the profile picture.

**Parameters:**
- `instance` (string, required): Name of the WhatsApp instance
- `picture` (string, required): Picture URL or base64 encoded image

**Example:**
```typescript
const result = await tool.handler({
  instance: 'my_whatsapp_bot',
  picture: 'https://example.com/profile-picture.jpg'
});
```

### Privacy Settings Tools

#### 5. `evolution_fetch_privacy_settings`
Get current privacy settings for the instance.

**Parameters:**
- `instance` (string, required): Name of the WhatsApp instance

**Example:**
```typescript
const result = await tool.handler({
  instance: 'my_whatsapp_bot'
});
```

#### 6. `evolution_update_privacy_settings`
Update privacy settings for various profile elements.

**Parameters:**
- `instance` (string, required): Name of the WhatsApp instance
- `privacySettings` (object, required): Privacy configuration object

**Privacy Settings Options:**
- `readreceipts`: `'all'` | `'none'`
- `profile`: `'all'` | `'contacts'` | `'contact_blacklist'` | `'none'`
- `status`: `'all'` | `'contacts'` | `'contact_blacklist'` | `'none'`
- `online`: `'all'` | `'match_last_seen'`
- `last`: `'all'` | `'contacts'` | `'contact_blacklist'` | `'none'`
- `groupadd`: `'all'` | `'contacts'` | `'contact_blacklist'` | `'none'`

**Example:**
```typescript
const result = await tool.handler({
  instance: 'my_whatsapp_bot',
  privacySettings: {
    readreceipts: 'all',
    profile: 'contacts',
    status: 'contacts',
    online: 'all',
    last: 'contacts',
    groupadd: 'contacts'
  }
});
```

### Business Profile Tools

#### 7. `evolution_fetch_business_profile`
Get business profile information for WhatsApp Business accounts.

**Parameters:**
- `instance` (string, required): Name of the WhatsApp Business instance

**Example:**
```typescript
const result = await tool.handler({
  instance: 'my_business_bot'
});
```

#### 8. `evolution_update_business_profile`
Update business profile information.

**Parameters:**
- `instance` (string, required): Name of the WhatsApp Business instance
- `business` (object, required): Business profile data

**Business Profile Fields:**
- `description` (string, optional): Business description (max 512 characters)
- `category` (string, optional): Business category
- `email` (string, optional): Business email address
- `website` (array, optional): Business website URLs (max 2)
- `address` (string, optional): Business address (max 256 characters)

**Example:**
```typescript
const result = await tool.handler({
  instance: 'my_business_bot',
  business: {
    description: 'We provide excellent customer service',
    category: 'Technology',
    email: 'contact@mybusiness.com',
    website: ['https://mybusiness.com'],
    address: '123 Business Street, City, State'
  }
});
```

### Webhook Management Tools

#### 9. `evolution_set_webhook`
Configure webhook settings for receiving WhatsApp events.

**Parameters:**
- `instance` (string, required): Name of the WhatsApp instance
- `webhook` (object, required): Webhook configuration

**Webhook Configuration:**
- `url` (string, required): Webhook URL (must be valid HTTPS/HTTP URL)
- `enabled` (boolean, optional): Whether webhook is enabled (default: true)
- `webhookByEvents` (boolean, optional): Send webhook by events (default: true)
- `webhookBase64` (boolean, optional): Send media in base64 (default: false)
- `events` (array, optional): List of events to send to webhook

**Available Events:**
- `APPLICATION_STARTUP`
- `QRCODE_UPDATED`
- `CONNECTION_UPDATE`
- `MESSAGES_SET`
- `MESSAGES_UPSERT`
- `MESSAGES_UPDATE`
- `MESSAGES_DELETE`
- `SEND_MESSAGE`
- `CONTACTS_SET`
- `CONTACTS_UPSERT`
- `CONTACTS_UPDATE`
- `PRESENCE_UPDATE`
- `CHATS_SET`
- `CHATS_UPSERT`
- `CHATS_UPDATE`
- `CHATS_DELETE`
- `GROUPS_UPSERT`
- `GROUP_UPDATE`
- `GROUP_PARTICIPANTS_UPDATE`
- `NEW_JWT_TOKEN`
- `TYPEBOT_START`
- `TYPEBOT_CHANGE_STATUS`

**Example:**
```typescript
const result = await tool.handler({
  instance: 'my_whatsapp_bot',
  webhook: {
    url: 'https://myserver.com/webhook',
    enabled: true,
    webhookByEvents: true,
    webhookBase64: false,
    events: [
      'APPLICATION_STARTUP',
      'QRCODE_UPDATED',
      'CONNECTION_UPDATE',
      'MESSAGES_UPSERT',
      'SEND_MESSAGE'
    ]
  }
});
```

#### 10. `evolution_get_webhook`
Get current webhook configuration for an instance.

**Parameters:**
- `instance` (string, required): Name of the WhatsApp instance

**Example:**
```typescript
const result = await tool.handler({
  instance: 'my_whatsapp_bot'
});
```

### API Information Tool

#### 11. `evolution_get_information`
Get Evolution API server information, version, and status.

**Parameters:** None required

**Example:**
```typescript
const result = await tool.handler({});
```

## Usage

### Basic Setup

```typescript
import { ProfileWebhookTools } from './profile-webhook-tools';
import { EvolutionHttpClient } from '../../clients/evolution-http-client';

// Create HTTP client
const httpClient = new EvolutionHttpClient(
  'https://your-evolution-api.com',
  'your-api-key'
);

// Create tools instance
const profileWebhookTools = new ProfileWebhookTools(httpClient);

// Get all available tools
const tools = profileWebhookTools.getAllTools();
```

### Complete Profile Setup Example

```typescript
async function setupBusinessProfile(instanceName: string) {
  // 1. Update profile basics
  await profileWebhookTools.createUpdateProfileNameTool()
    .handler({ 
      instance: instanceName, 
      name: 'TechCorp Support' 
    });

  await profileWebhookTools.createUpdateProfileStatusTool()
    .handler({ 
      instance: instanceName, 
      status: 'Available 24/7 for support' 
    });

  // 2. Configure business profile
  await profileWebhookTools.createUpdateBusinessProfileTool()
    .handler({ 
      instance: instanceName, 
      business: {
        description: 'Technology solutions provider',
        category: 'Technology',
        email: 'support@techcorp.com',
        website: ['https://techcorp.com']
      }
    });

  // 3. Set privacy settings
  await profileWebhookTools.createUpdatePrivacySettingsTool()
    .handler({ 
      instance: instanceName, 
      privacySettings: {
        profile: 'all',
        status: 'all',
        last: 'contacts'
      }
    });

  // 4. Configure webhook
  await profileWebhookTools.createSetWebhookTool()
    .handler({ 
      instance: instanceName, 
      webhook: {
        url: 'https://techcorp.com/whatsapp-webhook',
        enabled: true,
        events: ['MESSAGES_UPSERT', 'SEND_MESSAGE']
      }
    });
}
```

## Error Handling

All tools provide comprehensive error handling with specific error types and helpful suggestions:

### Error Types

- **VALIDATION_ERROR**: Invalid parameters or data format
- **AUTHENTICATION_ERROR**: API key issues or authentication failures
- **API_ERROR**: Evolution API server errors or instance not found
- **NETWORK_ERROR**: Connection or timeout issues

### Example Error Response

```typescript
{
  success: false,
  error: {
    type: 'AUTHENTICATION_ERROR',
    message: 'Authentication failed for update profile name',
    suggestions: [
      'Check that EVOLUTION_API_KEY is correct',
      'Verify the API key has proper permissions',
      'Ensure the API key is not expired'
    ]
  }
}
```

## Validation

### Profile Name Validation
- Required: minimum 1 character
- Maximum: 25 characters

### Profile Status Validation
- Required: minimum 1 character
- Maximum: 139 characters

### Business Profile Validation
- Description: maximum 512 characters
- Email: must be valid email format
- Website: must be valid URLs, maximum 2 websites
- Address: maximum 256 characters

### Webhook URL Validation
- Must be valid HTTP/HTTPS URL
- Validated before making API calls
- Provides specific error messages for invalid formats

### Privacy Settings Validation
- All values must be from predefined enums
- Invalid values are rejected with clear error messages

## Testing

### Unit Tests
Run unit tests to verify tool functionality:

```bash
npm test -- profile-webhook-tools.test.ts
```

### Integration Tests
Run integration tests with mocked HTTP client:

```bash
npm test -- profile-webhook-tools-integration.test.ts
```

### Demo Script
Run the interactive demo to see all tools in action:

```bash
EVOLUTION_URL=https://your-api.com EVOLUTION_API_KEY=your-key npm run demo:profile-webhook
```

## API Endpoints Used

| Tool | Method | Endpoint |
|------|--------|----------|
| Fetch Profile | POST | `/chat/fetchProfile/{instance}` |
| Update Profile Name | PUT | `/chat/updateProfileName/{instance}` |
| Update Profile Status | PUT | `/chat/updateProfileStatus/{instance}` |
| Update Profile Picture | PUT | `/chat/updateProfilePicture/{instance}` |
| Fetch Privacy Settings | GET | `/chat/fetchPrivacySettings/{instance}` |
| Update Privacy Settings | PUT | `/chat/updatePrivacySettings/{instance}` |
| Fetch Business Profile | GET | `/chat/fetchBusinessProfile/{instance}` |
| Update Business Profile | PUT | `/chat/updateBusinessProfile/{instance}` |
| Set Webhook | POST | `/webhook/set/{instance}` |
| Get Webhook | GET | `/webhook/find/{instance}` |
| Get Information | GET | `/get-information` |

## Requirements Satisfied

This implementation satisfies the following requirements from the specification:

- **4.1**: HTTP requests to Evolution API v2 endpoints
- **4.5**: Proper parameter validation and error handling
- **4.6**: User-friendly error messages and suggestions
- **6.1**: Structured JSON responses for successful operations
- **6.2**: Clear error messages with actionable suggestions
- **7.3**: Profile management and privacy settings support
- **7.4**: Webhook configuration and management support

## Best Practices

1. **Always validate parameters** before making API calls
2. **Handle errors gracefully** with helpful suggestions
3. **Use proper HTTP methods** (GET, POST, PUT) as specified by the API
4. **Validate webhook URLs** before configuration
5. **Provide clear success messages** with relevant operation details
6. **Test thoroughly** with both unit and integration tests
7. **Follow consistent naming** conventions for tool names and descriptions