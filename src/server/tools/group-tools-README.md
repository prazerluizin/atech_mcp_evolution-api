# Group Controller MCP Tools

This module implements MCP (Model Context Protocol) tools for managing WhatsApp groups through the Evolution API v2. It provides comprehensive group management capabilities including creation, configuration, participant management, and information retrieval.

## Features

### Group Management
- **Create Group**: Create new WhatsApp groups with participants
- **Update Group Picture**: Change group profile pictures
- **Update Group Subject**: Modify group names
- **Update Group Description**: Set or update group descriptions
- **Leave Group**: Exit from groups

### Invite Management
- **Fetch Invite Code**: Get current group invite links
- **Revoke Invite Code**: Generate new invite codes (invalidates old ones)

### Participant Management
- **Add Participants**: Add new members to groups
- **Remove Participants**: Remove members from groups
- **Promote Participants**: Make members group admins
- **Demote Participants**: Remove admin privileges

### Information Retrieval
- **Fetch Group Info**: Get information about all groups the instance is part of

## Available Tools

### 1. evolution_create_group
Creates a new WhatsApp group with specified participants.

**Parameters:**
- `instance` (string): WhatsApp instance name
- `subject` (string): Group name (1-100 characters)
- `description` (string, optional): Group description (max 512 characters)
- `participants` (array): Phone numbers of initial participants

**Example:**
```json
{
  "instance": "my_whatsapp_bot",
  "subject": "My New Group",
  "description": "This is a test group",
  "participants": ["5511999999999", "5511888888888"]
}
```

### 2. evolution_update_group_picture
Updates the profile picture of a WhatsApp group.

**Parameters:**
- `instance` (string): WhatsApp instance name
- `groupJid` (string): Group JID (format: 120363123456789012@g.us)
- `image` (string): Image URL or base64 encoded image

**Example:**
```json
{
  "instance": "my_whatsapp_bot",
  "groupJid": "120363123456789012@g.us",
  "image": "https://example.com/group-picture.jpg"
}
```

### 3. evolution_update_group_subject
Updates the name/subject of a WhatsApp group.

**Parameters:**
- `instance` (string): WhatsApp instance name
- `groupJid` (string): Group JID (format: 120363123456789012@g.us)
- `subject` (string): New group name (1-100 characters)

**Example:**
```json
{
  "instance": "my_whatsapp_bot",
  "groupJid": "120363123456789012@g.us",
  "subject": "Updated Group Name"
}
```

### 4. evolution_update_group_description
Updates the description of a WhatsApp group.

**Parameters:**
- `instance` (string): WhatsApp instance name
- `groupJid` (string): Group JID (format: 120363123456789012@g.us)
- `description` (string): New description (max 512 characters, empty to remove)

**Example:**
```json
{
  "instance": "my_whatsapp_bot",
  "groupJid": "120363123456789012@g.us",
  "description": "Updated group description"
}
```

### 5. evolution_fetch_group_invite_code
Retrieves the invite code/link for a WhatsApp group.

**Parameters:**
- `instance` (string): WhatsApp instance name
- `groupJid` (string): Group JID (format: 120363123456789012@g.us)

**Example:**
```json
{
  "instance": "my_whatsapp_bot",
  "groupJid": "120363123456789012@g.us"
}
```

### 6. evolution_revoke_group_invite_code
Revokes the current invite code and generates a new one.

**Parameters:**
- `instance` (string): WhatsApp instance name
- `groupJid` (string): Group JID (format: 120363123456789012@g.us)

**Example:**
```json
{
  "instance": "my_whatsapp_bot",
  "groupJid": "120363123456789012@g.us"
}
```

### 7. evolution_update_group_participant
Manages group participants (add, remove, promote, demote).

**Parameters:**
- `instance` (string): WhatsApp instance name
- `groupJid` (string): Group JID (format: 120363123456789012@g.us)
- `action` (enum): Action to perform (`add`, `remove`, `promote`, `demote`)
- `participants` (array): Phone numbers of participants to manage

**Example:**
```json
{
  "instance": "my_whatsapp_bot",
  "groupJid": "120363123456789012@g.us",
  "action": "add",
  "participants": ["5511999999999", "5511888888888"]
}
```

### 8. evolution_leave_group
Leaves a WhatsApp group (the bot instance exits the group).

**Parameters:**
- `instance` (string): WhatsApp instance name
- `groupJid` (string): Group JID (format: 120363123456789012@g.us)

**Example:**
```json
{
  "instance": "my_whatsapp_bot",
  "groupJid": "120363123456789012@g.us"
}
```

### 9. evolution_fetch_group_info
Fetches information about all groups the instance is part of.

**Parameters:**
- `instance` (string): WhatsApp instance name

**Example:**
```json
{
  "instance": "my_whatsapp_bot"
}
```

## Usage

### Basic Usage

```typescript
import { GroupTools } from './group-tools';
import { EvolutionHttpClient } from '../../clients/evolution-http-client';

// Initialize HTTP client
const httpClient = new EvolutionHttpClient(
  'https://your-evolution-api.com',
  'your-api-key'
);

// Initialize group tools
const groupTools = new GroupTools(httpClient);

// Get all available tools
const tools = groupTools.getAllTools();

// Use a specific tool
const createTool = groupTools.createCreateGroupTool();
const result = await createTool.handler({
  instance: 'my_instance',
  subject: 'My Group',
  participants: ['5511999999999']
});
```

### Error Handling

All tools return a standardized result format:

```typescript
interface ToolResult {
  success: boolean;
  data?: any;
  error?: {
    type: string;
    message: string;
    suggestion?: string;
    code?: string;
    details?: any;
  };
}
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "message": "Group created successfully",
    "groupJid": "120363123456789012@g.us",
    "participantCount": 2
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "type": "VALIDATION_ERROR",
    "message": "Invalid group JID format",
    "suggestion": "Group JID must end with @g.us",
    "code": "422"
  }
}
```

## Validation Rules

### Group JID Format
- Must end with `@g.us`
- Example: `120363123456789012@g.us`

### Phone Numbers
- Must contain only digits
- Minimum 10 digits
- Format: `5511999999999` (country code + area code + number)

### Group Names
- Minimum 1 character
- Maximum 100 characters

### Group Descriptions
- Maximum 512 characters
- Empty string removes description

### Participant Limits
- Minimum 1 participant for group creation
- Maximum 256 participants per operation
- Maximum 50 participants for update operations

### Participant Actions
- `add`: Add new members to the group
- `remove`: Remove members from the group
- `promote`: Make members group admins
- `demote`: Remove admin privileges from members

## Error Types

- `VALIDATION_ERROR`: Invalid parameters or data format
- `AUTHENTICATION_ERROR`: Invalid API key or permissions
- `NOT_FOUND_ERROR`: Instance or group not found
- `RATE_LIMIT_ERROR`: Too many requests
- `API_ERROR`: Evolution API server error
- `NETWORK_ERROR`: Connection or timeout issues
- `UNKNOWN_ERROR`: Unexpected errors

## Testing

### Unit Tests
```bash
npm test -- group-tools.test.ts
```

### Integration Tests
```bash
# Set environment variables
export EVOLUTION_URL="https://your-evolution-api.com"
export EVOLUTION_API_KEY="your-api-key"
export TEST_INSTANCE="test-instance"
export TEST_PHONE_NUMBER="5511999999999"
export TEST_PHONE_NUMBER_2="5511888888888"

# Run integration tests
npm test -- group-tools-integration.test.ts
```

### Demo
```bash
# Run the demo script
npm run demo:group-tools
```

## Requirements Mapping

This implementation satisfies the following requirements from the Evolution API MCP specification:

- **4.1**: HTTP requests to Evolution API v2 endpoints
- **4.5**: Proper parameter validation and error handling
- **4.6**: User-friendly error messages and suggestions
- **6.1**: Structured JSON responses
- **6.2**: Clear error messages with status codes
- **7.2**: Group-specific operations with groupJid parameter

## Dependencies

- `zod`: Schema validation
- `EvolutionHttpClient`: HTTP communication with Evolution API
- Evolution API v2 endpoints for group management

## Notes

1. **Permissions**: The instance must have appropriate permissions to perform group operations
2. **Group Admin**: Some operations (like adding/removing participants) require admin privileges
3. **Rate Limiting**: Be mindful of API rate limits when performing bulk operations
4. **Group JID**: Always use the correct format ending with `@g.us`
5. **Phone Numbers**: Use international format without special characters
6. **Invite Codes**: Revoking an invite code immediately invalidates the old link