# Chat Controller Tools

This module implements MCP tools for the Evolution API Chat Controller, providing comprehensive chat management functionality for WhatsApp instances.

## Overview

The Chat Controller tools enable you to:
- Search and retrieve messages, contacts, and chats
- Mark messages as read
- Archive/unarchive conversations
- Check if phone numbers have WhatsApp accounts
- Send presence indicators (typing, recording, etc.)

## Available Tools

### 1. Find Messages (`evolution_find_messages`)
Search for messages in chats with filtering and pagination options.

**Parameters:**
- `instance` (required): WhatsApp instance name
- `where` (optional): Search filters
  - `key.remoteJid`: Chat JID to search in
  - `key.fromMe`: Filter by sender (true/false)
  - `key.id`: Specific message ID
- `limit` (optional): Maximum results (1-1000, default: 50)

**Example:**
```json
{
  "instance": "my_whatsapp_bot",
  "where": {
    "key": {
      "remoteJid": "5511999999999@s.whatsapp.net"
    }
  },
  "limit": 50
}
```

### 2. Find Contacts (`evolution_find_contacts`)
Search for contacts with optional filtering by name or number.

**Parameters:**
- `instance` (required): WhatsApp instance name
- `where` (optional): Search filters
  - `name`: Filter by contact name (partial match)
  - `number`: Filter by phone number

**Example:**
```json
{
  "instance": "my_whatsapp_bot",
  "where": {
    "name": "John"
  }
}
```

### 3. Find Chats (`evolution_find_chats`)
Search for chats/conversations with optional filtering.

**Parameters:**
- `instance` (required): WhatsApp instance name
- `where` (optional): Search filters
  - `name`: Filter by contact/group name (partial match)
  - `jid`: Filter by specific chat JID

**Example:**
```json
{
  "instance": "my_whatsapp_bot",
  "where": {
    "name": "Support"
  }
}
```

### 4. Mark Messages as Read (`evolution_mark_messages_as_read`)
Mark specific messages as read.

**Parameters:**
- `instance` (required): WhatsApp instance name
- `readMessages` (required): Array of message identifiers
  - `remoteJid`: Chat JID where the message is located
  - `fromMe`: Whether the message was sent by this instance
  - `id`: Message ID

**Example:**
```json
{
  "instance": "my_whatsapp_bot",
  "readMessages": [
    {
      "remoteJid": "5511999999999@s.whatsapp.net",
      "fromMe": false,
      "id": "message_id_1"
    }
  ]
}
```

### 5. Archive Chat (`evolution_archive_chat`)
Archive or unarchive a chat conversation.

**Parameters:**
- `instance` (required): WhatsApp instance name
- `chat` (required): Chat JID to archive/unarchive
- `archive` (required): True to archive, false to unarchive

**Example:**
```json
{
  "instance": "my_whatsapp_bot",
  "chat": "5511999999999@s.whatsapp.net",
  "archive": true
}
```

### 6. Check WhatsApp Numbers (`evolution_check_is_whatsapp`)
Check if phone numbers have WhatsApp accounts.

**Parameters:**
- `instance` (required): WhatsApp instance name
- `numbers` (required): Array of phone numbers to check (1-50 numbers)

**Example:**
```json
{
  "instance": "my_whatsapp_bot",
  "numbers": ["5511999999999", "5511888888888"]
}
```

### 7. Send Presence (`evolution_send_presence`)
Send presence indicators like typing, recording, or paused to a chat.

**Parameters:**
- `instance` (required): WhatsApp instance name
- `number` (required): Phone number to send presence to
- `presence` (required): Type of presence
  - `composing`: Typing indicator
  - `recording`: Recording voice message
  - `paused`: Stopped typing
- `delay` (optional): Duration in milliseconds (1000-30000, default: 5000)

**Example:**
```json
{
  "instance": "my_whatsapp_bot",
  "number": "5511999999999",
  "presence": "composing",
  "delay": 5000
}
```

## Usage

### Basic Usage

```typescript
import { ChatTools } from './chat-tools';
import { EvolutionHttpClient } from '../../clients/evolution-http-client';

// Initialize HTTP client
const httpClient = new EvolutionHttpClient({
  baseURL: 'https://your-evolution-api.com',
  apiKey: 'your-api-key'
});

// Initialize Chat Tools
const chatTools = new ChatTools(httpClient);

// Get all tools
const tools = chatTools.getAllTools();

// Use individual tools
const findMessagesTool = chatTools.createFindMessagesTool();
const result = await findMessagesTool.handler({
  instance: 'my_instance',
  limit: 10
});
```

### MCP Server Integration

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { ChatTools } from './chat-tools';

const server = new Server(/* config */);
const chatTools = new ChatTools(httpClient);

// Register all chat tools
const tools = chatTools.getAllTools();
tools.forEach(tool => {
  server.tool(tool.name, tool.schema, tool.handler);
});
```

## Error Handling

All tools provide comprehensive error handling with specific error types:

- `AUTHENTICATION_ERROR`: Invalid API key or authentication failure
- `VALIDATION_ERROR`: Invalid parameters or data format
- `NOT_FOUND_ERROR`: Instance or resource not found
- `RATE_LIMIT_ERROR`: Too many requests
- `API_ERROR`: Server-side errors
- `NETWORK_ERROR`: Connection or timeout issues
- `UNKNOWN_ERROR`: Unexpected errors

## Phone Number Format

Phone numbers should be provided in international format without special characters:
- ✅ Correct: `5511999999999`
- ❌ Incorrect: `+55 11 99999-9999`, `(11) 99999-9999`

## JID Format

WhatsApp JIDs (Jabber IDs) follow this format:
- Individual chats: `5511999999999@s.whatsapp.net`
- Group chats: `120363123456789012@g.us`

## Testing

The module includes comprehensive unit tests and integration tests:

```bash
# Run unit tests
npm test -- tests/server/chat-tools.test.ts

# Run integration tests
npm test -- tests/server/chat-tools-integration.test.ts

# Run demo
npx tsx src/server/tools/chat-tools-demo.ts
```

## Requirements Covered

This implementation covers the following requirements from the specification:

- **4.1**: HTTP requests to Evolution API v2 endpoints
- **4.4**: Chat Controller operations (find messages, contacts, chats)
- **4.5**: Request parameter validation and error handling
- **4.6**: User-friendly error messages and suggestions
- **6.1**: Structured JSON responses
- **6.2**: Clear error messages with status codes
- **7.1**: Instance parameter support for all operations

## API Endpoints Used

- `POST /chat/findMessages/{instance}` - Find messages
- `POST /chat/findContacts/{instance}` - Find contacts
- `POST /chat/findChats/{instance}` - Find chats
- `POST /chat/markMessageAsRead/{instance}` - Mark messages as read
- `POST /chat/archiveChat/{instance}` - Archive/unarchive chats
- `POST /chat/whatsappNumbers/{instance}` - Check WhatsApp numbers
- `POST /chat/sendPresence/{instance}` - Send presence indicators