# API Reference

This document provides a comprehensive reference for all available tools in the Evolution API MCP Server.

## Table of Contents

- [Instance Management](#instance-management)
- [Message Operations](#message-operations)
- [Chat Management](#chat-management)
- [Group Operations](#group-operations)
- [Profile & Settings](#profile--settings)
- [Webhook Management](#webhook-management)
- [Information & Status](#information--status)

## Instance Management

### create-instance

Create a new WhatsApp instance.

**Parameters:**
- `instanceName` (string, required): Unique name for the instance
- `token` (string, optional): Authentication token
- `qrcode` (boolean, optional): Whether to generate QR code (default: true)
- `webhook` (string, optional): Webhook URL for events
- `webhookByEvents` (boolean, optional): Enable webhook by events
- `webhookBase64` (boolean, optional): Send webhook data in base64
- `events` (array, optional): List of events to subscribe to

**Example:**
```json
{
  "instanceName": "my-whatsapp-bot",
  "qrcode": true,
  "webhook": "https://mysite.com/webhook"
}
```

**Response:**
```json
{
  "instance": {
    "instanceName": "my-whatsapp-bot",
    "status": "created"
  }
}
```

### fetch-instances

List all WhatsApp instances.

**Parameters:** None

**Example Response:**
```json
[
  {
    "instanceName": "my-whatsapp-bot",
    "status": "open",
    "serverUrl": "https://api.example.com",
    "apikey": "instance-api-key"
  }
]
```

### connect-instance

Connect an instance and get QR code for WhatsApp pairing.

**Parameters:**
- `instance` (string, required): Instance name

**Example:**
```json
{
  "instance": "my-whatsapp-bot"
}
```

**Response:**
```json
{
  "qrcode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "code": "2@abc123def456..."
}
```

### restart-instance

Restart a WhatsApp instance.

**Parameters:**
- `instance` (string, required): Instance name

### delete-instance

Delete a WhatsApp instance permanently.

**Parameters:**
- `instance` (string, required): Instance name

### set-presence

Set the presence status for an instance.

**Parameters:**
- `instance` (string, required): Instance name
- `presence` (string, required): Presence status
  - `available`: Online
  - `unavailable`: Offline
  - `composing`: Typing
  - `recording`: Recording audio
  - `paused`: Paused

## Message Operations

### send-text-message

Send a text message to a contact or group.

**Parameters:**
- `instance` (string, required): Instance name
- `number` (string, required): Recipient number (format: 5511999999999)
- `text` (string, required): Message text
- `delay` (number, optional): Delay in milliseconds before sending

**Example:**
```json
{
  "instance": "my-whatsapp-bot",
  "number": "5511999999999",
  "text": "Hello! This is a test message.",
  "delay": 1000
}
```

### send-media-message

Send media files (images, videos, documents, audio).

**Parameters:**
- `instance` (string, required): Instance name
- `number` (string, required): Recipient number
- `media` (string, required): Media URL or base64 data
- `caption` (string, optional): Media caption
- `fileName` (string, optional): File name for documents
- `delay` (number, optional): Delay before sending

**Example:**
```json
{
  "instance": "my-whatsapp-bot",
  "number": "5511999999999",
  "media": "https://example.com/image.jpg",
  "caption": "Check out this image!"
}
```

### send-audio-message

Send audio messages or voice notes.

**Parameters:**
- `instance` (string, required): Instance name
- `number` (string, required): Recipient number
- `audio` (string, required): Audio URL or base64 data
- `delay` (number, optional): Delay before sending

### send-sticker

Send sticker messages.

**Parameters:**
- `instance` (string, required): Instance name
- `number` (string, required): Recipient number
- `sticker` (string, required): Sticker URL or base64 data

### send-location

Send location coordinates.

**Parameters:**
- `instance` (string, required): Instance name
- `number` (string, required): Recipient number
- `latitude` (number, required): Latitude coordinate
- `longitude` (number, required): Longitude coordinate
- `name` (string, optional): Location name
- `address` (string, optional): Location address

**Example:**
```json
{
  "instance": "my-whatsapp-bot",
  "number": "5511999999999",
  "latitude": -23.5505,
  "longitude": -46.6333,
  "name": "São Paulo",
  "address": "São Paulo, SP, Brazil"
}
```

### send-contact

Send contact information.

**Parameters:**
- `instance` (string, required): Instance name
- `number` (string, required): Recipient number
- `contact` (object, required): Contact information
  - `fullName` (string): Contact's full name
  - `wuid` (string): WhatsApp user ID
  - `phoneNumber` (string): Phone number

### send-reaction

Send reaction to a message.

**Parameters:**
- `instance` (string, required): Instance name
- `messageId` (string, required): Message ID to react to
- `reaction` (string, required): Emoji reaction

### send-poll

Send poll messages with multiple options.

**Parameters:**
- `instance` (string, required): Instance name
- `number` (string, required): Recipient number
- `name` (string, required): Poll question
- `selectableCount` (number, required): Number of selectable options
- `values` (array, required): Poll options

**Example:**
```json
{
  "instance": "my-whatsapp-bot",
  "number": "5511999999999",
  "name": "What's your favorite color?",
  "selectableCount": 1,
  "values": ["Red", "Blue", "Green", "Yellow"]
}
```

### send-list

Send interactive list messages.

**Parameters:**
- `instance` (string, required): Instance name
- `number` (string, required): Recipient number
- `title` (string, required): List title
- `description` (string, required): List description
- `buttonText` (string, required): Button text
- `sections` (array, required): List sections with rows

### send-button

Send interactive button messages.

**Parameters:**
- `instance` (string, required): Instance name
- `number` (string, required): Recipient number
- `title` (string, required): Message title
- `description` (string, required): Message description
- `footer` (string, optional): Message footer
- `buttons` (array, required): Button definitions

## Chat Management

### find-messages

Search and retrieve messages from chats.

**Parameters:**
- `instance` (string, required): Instance name
- `where` (object, optional): Search filters
  - `key.remoteJid` (string): Chat/contact ID
  - `key.fromMe` (boolean): Messages from me
  - `messageType` (string): Message type filter
- `limit` (number, optional): Maximum results (default: 100)

**Example:**
```json
{
  "instance": "my-whatsapp-bot",
  "where": {
    "key": {
      "remoteJid": "5511999999999@s.whatsapp.net"
    }
  },
  "limit": 50
}
```

### find-contacts

Retrieve contact list.

**Parameters:**
- `instance` (string, required): Instance name

### find-chats

Retrieve chat list.

**Parameters:**
- `instance` (string, required): Instance name

### mark-as-read

Mark messages as read.

**Parameters:**
- `instance` (string, required): Instance name
- `remoteJid` (string, required): Chat ID
- `messageId` (string, optional): Specific message ID

### mark-as-unread

Mark messages as unread.

**Parameters:**
- `instance` (string, required): Instance name
- `remoteJid` (string, required): Chat ID

### archive-chat

Archive a chat.

**Parameters:**
- `instance` (string, required): Instance name
- `remoteJid` (string, required): Chat ID
- `archive` (boolean, required): Archive (true) or unarchive (false)

### check-is-whatsapp

Check if a number is registered on WhatsApp.

**Parameters:**
- `instance` (string, required): Instance name
- `numbers` (array, required): Array of phone numbers to check

**Example:**
```json
{
  "instance": "my-whatsapp-bot",
  "numbers": ["5511999999999", "5511888888888"]
}
```

**Response:**
```json
[
  {
    "number": "5511999999999",
    "exists": true,
    "jid": "5511999999999@s.whatsapp.net"
  },
  {
    "number": "5511888888888",
    "exists": false
  }
]
```

### send-presence

Send typing or recording indicators.

**Parameters:**
- `instance` (string, required): Instance name
- `number` (string, required): Recipient number
- `presence` (string, required): Presence type
  - `composing`: Typing indicator
  - `recording`: Recording audio indicator
  - `paused`: Stop indicators

## Group Operations

### create-group

Create a new WhatsApp group.

**Parameters:**
- `instance` (string, required): Instance name
- `subject` (string, required): Group name
- `description` (string, optional): Group description
- `participants` (array, required): Array of participant numbers

**Example:**
```json
{
  "instance": "my-whatsapp-bot",
  "subject": "My Awesome Group",
  "description": "A group for awesome people",
  "participants": ["5511999999999", "5511888888888"]
}
```

### update-group-picture

Update group profile picture.

**Parameters:**
- `instance` (string, required): Instance name
- `groupJid` (string, required): Group ID
- `image` (string, required): Image URL or base64 data

### update-group-subject

Update group name/subject.

**Parameters:**
- `instance` (string, required): Instance name
- `groupJid` (string, required): Group ID
- `subject` (string, required): New group name

### update-group-description

Update group description.

**Parameters:**
- `instance` (string, required): Instance name
- `groupJid` (string, required): Group ID
- `description` (string, required): New group description

### fetch-invite-code

Get group invite code.

**Parameters:**
- `instance` (string, required): Instance name
- `groupJid` (string, required): Group ID

**Response:**
```json
{
  "inviteCode": "ABC123DEF456",
  "inviteUrl": "https://chat.whatsapp.com/ABC123DEF456"
}
```

### revoke-invite-code

Revoke and generate new group invite code.

**Parameters:**
- `instance` (string, required): Instance name
- `groupJid` (string, required): Group ID

### update-participant

Manage group participants (add, remove, promote, demote).

**Parameters:**
- `instance` (string, required): Instance name
- `groupJid` (string, required): Group ID
- `action` (string, required): Action to perform
  - `add`: Add participants
  - `remove`: Remove participants
  - `promote`: Promote to admin
  - `demote`: Demote from admin
- `participants` (array, required): Array of participant numbers

**Example:**
```json
{
  "instance": "my-whatsapp-bot",
  "groupJid": "120363123456789012@g.us",
  "action": "add",
  "participants": ["5511999999999"]
}
```

### leave-group

Leave a group.

**Parameters:**
- `instance` (string, required): Instance name
- `groupJid` (string, required): Group ID

## Profile & Settings

### fetch-profile

Get profile information.

**Parameters:**
- `instance` (string, required): Instance name
- `number` (string, optional): Target number (default: own profile)

### update-profile-name

Update profile display name.

**Parameters:**
- `instance` (string, required): Instance name
- `name` (string, required): New display name

### update-profile-status

Update profile status/about.

**Parameters:**
- `instance` (string, required): Instance name
- `status` (string, required): New status message

### update-profile-picture

Update profile picture.

**Parameters:**
- `instance` (string, required): Instance name
- `picture` (string, required): Image URL or base64 data

### fetch-privacy-settings

Get current privacy settings.

**Parameters:**
- `instance` (string, required): Instance name

### update-privacy-settings

Update privacy settings.

**Parameters:**
- `instance` (string, required): Instance name
- `privacySettings` (object, required): Privacy configuration
  - `readreceipts` (string): "all" or "none"
  - `profile` (string): "all", "contacts", or "none"
  - `status` (string): "all", "contacts", or "none"
  - `online` (string): "all" or "none"
  - `last` (string): "all", "contacts", or "none"
  - `groupadd` (string): "all", "contacts", or "none"

## Webhook Management

### set-webhook

Configure webhook settings for an instance.

**Parameters:**
- `instance` (string, required): Instance name
- `enabled` (boolean, required): Enable/disable webhook
- `url` (string, required if enabled): Webhook URL
- `events` (array, optional): Events to subscribe to
- `webhookByEvents` (boolean, optional): Enable event-based webhooks
- `webhookBase64` (boolean, optional): Send data in base64

**Example:**
```json
{
  "instance": "my-whatsapp-bot",
  "enabled": true,
  "url": "https://mysite.com/webhook",
  "events": [
    "APPLICATION_STARTUP",
    "QRCODE_UPDATED",
    "MESSAGES_UPSERT",
    "MESSAGES_UPDATE",
    "SEND_MESSAGE"
  ]
}
```

### get-webhook

Get current webhook configuration.

**Parameters:**
- `instance` (string, required): Instance name

**Response:**
```json
{
  "enabled": true,
  "url": "https://mysite.com/webhook",
  "events": ["APPLICATION_STARTUP", "MESSAGES_UPSERT"],
  "webhookByEvents": true
}
```

## Information & Status

### get-information

Get Evolution API information and status.

**Parameters:** None

**Response:**
```json
{
  "version": "2.0.0",
  "status": "online",
  "instances": {
    "total": 5,
    "connected": 3,
    "disconnected": 2
  },
  "uptime": "2 days, 14 hours, 30 minutes"
}
```

## Error Handling

All tools return standardized error responses when something goes wrong:

```json
{
  "success": false,
  "error": {
    "type": "AUTHENTICATION_ERROR",
    "message": "Invalid API key",
    "code": "AUTH_001",
    "suggestions": [
      "Check your EVOLUTION_API_KEY environment variable",
      "Verify the API key has the necessary permissions"
    ]
  }
}
```

### Common Error Types

- `CONFIGURATION_ERROR`: Invalid configuration
- `AUTHENTICATION_ERROR`: Authentication failed
- `API_ERROR`: Evolution API returned an error
- `NETWORK_ERROR`: Network connectivity issues
- `VALIDATION_ERROR`: Invalid parameters
- `TIMEOUT_ERROR`: Request timeout

## Rate Limits

The Evolution API may have rate limits. The MCP server includes automatic retry logic with exponential backoff for failed requests.

## Data Formats

### Phone Numbers
Always use international format without '+' symbol:
- ✅ Correct: `5511999999999`
- ❌ Incorrect: `+55 11 99999-9999`

### Group IDs
Group IDs end with `@g.us`:
- Example: `120363123456789012@g.us`

### Contact IDs
Contact IDs end with `@s.whatsapp.net`:
- Example: `5511999999999@s.whatsapp.net`

### Media URLs
Media can be provided as:
- HTTP/HTTPS URLs: `https://example.com/image.jpg`
- Base64 data: `data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...`

## Best Practices

1. **Always check if numbers exist** before sending messages using `check-is-whatsapp`
2. **Use delays** when sending multiple messages to avoid rate limits
3. **Handle errors gracefully** and implement retry logic for critical operations
4. **Validate phone numbers** before using them in API calls
5. **Use webhooks** for real-time event handling instead of polling
6. **Keep instance names unique** and descriptive
7. **Regularly check instance status** to ensure connectivity

---

For more examples and use cases, see [EXAMPLES.md](./EXAMPLES.md).