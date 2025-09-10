# Usage Examples and Common Workflows

This document provides practical examples and common workflows for using the Evolution API MCP Server with Claude Desktop.

## Table of Contents

- [Getting Started](#getting-started)
- [Instance Management](#instance-management)
- [Basic Messaging](#basic-messaging)
- [Advanced Messaging](#advanced-messaging)
- [Group Management](#group-management)
- [Business Workflows](#business-workflows)
- [Automation Examples](#automation-examples)
- [Integration Patterns](#integration-patterns)

## Getting Started

### First Time Setup

**Step 1: Create your first instance**
```
Create a new WhatsApp instance called 'my-first-bot' with QR code enabled
```

**Step 2: Connect to WhatsApp**
```
Connect the instance 'my-first-bot' and show me the QR code
```

**Step 3: Verify connection**
```
Check the status of instance 'my-first-bot'
```

**Step 4: Send a test message**
```
Send a text message "Hello from Claude!" to +5511999999999 using instance 'my-first-bot'
```

### Quick Health Check

```
What's the status of my Evolution API?
Show me all my WhatsApp instances
```

## Instance Management

### Creating Multiple Instances

**For different purposes:**
```
Create a WhatsApp instance called 'customer-support' for customer service
Create a WhatsApp instance called 'marketing-bot' for marketing campaigns
Create a WhatsApp instance called 'personal-assistant' for personal use
```

**With webhook configuration:**
```
Create a WhatsApp instance called 'webhook-bot' with webhook URL https://mysite.com/webhook and QR code enabled
```

### Managing Instance Lifecycle

**Restart a problematic instance:**
```
Restart the instance 'customer-support'
```

**Clean up unused instances:**
```
Delete the instance 'old-test-bot'
```

**Set presence status:**
```
Set the presence of instance 'customer-support' to 'available'
Set the presence of instance 'marketing-bot' to 'composing'
```

## Basic Messaging

### Text Messages

**Simple text message:**
```
Send "Welcome to our service!" to +5511999999999 using instance 'customer-support'
```

**Message with delay:**
```
Send "This message will be delayed" to +5511999999999 with a 5 second delay using instance 'my-bot'
```

**Bulk messaging:**
```
Send "Happy New Year!" to the following numbers using instance 'marketing-bot':
- +5511999999999
- +5511888888888
- +5511777777777
```

### Media Messages

**Send an image:**
```
Send the image from https://example.com/product.jpg with caption "Check out our new product!" to +5511999999999 using instance 'marketing-bot'
```

**Send a document:**
```
Send the PDF document from https://example.com/catalog.pdf with filename "Product Catalog 2024.pdf" to +5511999999999 using instance 'customer-support'
```

**Send audio message:**
```
Send the audio file from https://example.com/welcome.mp3 to +5511999999999 using instance 'customer-support'
```

### Location and Contact Sharing

**Share location:**
```
Send the location of São Paulo (latitude: -23.5505, longitude: -46.6333) with name "São Paulo City Center" to +5511999999999 using instance 'customer-support'
```

**Share contact:**
```
Send contact information for John Doe (+5511999999999) to +5511888888888 using instance 'customer-support'
```

## Advanced Messaging

### Interactive Messages

**Create a poll:**
```
Send a poll to +5511999999999 asking "What's your favorite pizza topping?" with options: Pepperoni, Mushrooms, Cheese, Vegetables. Allow 1 selection using instance 'restaurant-bot'
```

**Send interactive list:**
```
Send an interactive list to +5511999999999 with title "Our Services" and description "Choose a service you're interested in" with button text "Select Service". Include sections for:
- Consulting (Web Development, Mobile Apps, UI/UX Design)
- Support (Technical Support, Training, Maintenance)
Using instance 'business-bot'
```

**Send buttons:**
```
Send a button message to +5511999999999 with title "Order Confirmation" and description "Your order #12345 is ready!" Include buttons for "Confirm Pickup" and "Request Delivery" using instance 'restaurant-bot'
```

### Reactions and Responses

**React to a message:**
```
Send a thumbs up reaction (👍) to message ID "ABC123" using instance 'customer-support'
```

**Send sticker:**
```
Send a sticker from https://example.com/happy-sticker.webp to +5511999999999 using instance 'fun-bot'
```

## Group Management

### Creating and Setting Up Groups

**Create a project group:**
```
Create a WhatsApp group called "Project Alpha Team" with description "Collaboration space for Project Alpha" and add these participants:
- +5511999999999 (John - Project Manager)
- +5511888888888 (Sarah - Developer)
- +5511777777777 (Mike - Designer)
Using instance 'work-bot'
```

**Update group settings:**
```
Update the group "Project Alpha Team" picture with image from https://example.com/team-logo.jpg using instance 'work-bot'
Update the group "Project Alpha Team" description to "Project Alpha - Phase 2 Development" using instance 'work-bot'
```

### Managing Group Members

**Add new members:**
```
Add participants +5511666666666 and +5511555555555 to group "Project Alpha Team" using instance 'work-bot'
```

**Promote members to admin:**
```
Promote +5511888888888 to admin in group "Project Alpha Team" using instance 'work-bot'
```

**Remove inactive members:**
```
Remove participant +5511777777777 from group "Project Alpha Team" using instance 'work-bot'
```

### Group Invite Management

**Get invite link:**
```
Get the invite code for group "Project Alpha Team" using instance 'work-bot'
```

**Revoke and create new invite:**
```
Revoke the current invite code for group "Project Alpha Team" and generate a new one using instance 'work-bot'
```

## Business Workflows

### Customer Support Workflow

**Initial contact handling:**
```
1. Check if +5511999999999 is on WhatsApp using instance 'support-bot'
2. If yes, send welcome message: "Hello! Thank you for contacting our support. How can we help you today?"
3. Set presence to 'available' for instance 'support-bot'
```

**Escalation workflow:**
```
1. Send message to +5511999999999: "I'm transferring you to a specialist. Please wait a moment."
2. Add +5511999999999 to group "Support Escalation" using instance 'support-bot'
3. Send message to group: "New escalation case from +5511999999999"
```

### Marketing Campaign

**Product launch announcement:**
```
1. Send product image from https://example.com/new-product.jpg with caption "🚀 New Product Launch! Get 20% off with code LAUNCH20" to marketing list
2. Follow up after 1 hour with: "Limited time offer! Only 24 hours left for 20% discount"
3. Send final reminder: "Last chance! Offer expires in 2 hours"
```

**Event invitation workflow:**
```
1. Send event details: "You're invited to our exclusive webinar on Digital Marketing Trends 2024"
2. Send location details for hybrid event
3. Send calendar invite as document
4. Follow up with reminder 1 day before
```

### E-commerce Integration

**Order confirmation flow:**
```
1. Send order confirmation: "Order #12345 confirmed! Total: $99.99"
2. Send tracking information: "Your order is being prepared. Tracking: ABC123"
3. Send shipping notification with tracking link
4. Send delivery confirmation request
```

**Abandoned cart recovery:**
```
1. Send reminder: "You left something in your cart! Complete your purchase and get 10% off"
2. Send product images of abandoned items
3. Send final offer: "Last chance! Your cart expires in 2 hours"
```

## Automation Examples

### Scheduled Messages

**Daily reminders:**
```
Every day at 9 AM, send "Good morning! Don't forget about your appointment today" to appointment list using instance 'reminder-bot'
```

**Weekly reports:**
```
Every Monday at 10 AM, send weekly performance report document to management group using instance 'reports-bot'
```

### Event-Driven Responses

**Auto-reply setup:**
```
When someone sends "help" to instance 'support-bot':
1. Send: "Hello! I'm here to help. Please choose an option:"
2. Send interactive list with support categories
3. Set presence to 'composing' to show activity
```

**Webhook-based automation:**
```
When webhook receives new order event:
1. Send order confirmation to customer
2. Notify fulfillment team in group
3. Update customer with estimated delivery time
```

### Integration with External Systems

**CRM Integration:**
```
When new contact messages instance 'sales-bot':
1. Check if number exists in CRM
2. If new contact, create CRM entry
3. Send personalized welcome message
4. Add to appropriate marketing list
```

**Support Ticket Integration:**
```
When customer sends message to 'support-bot':
1. Create support ticket in system
2. Send ticket number to customer
3. Route to appropriate support agent
4. Send initial response with estimated resolution time
```

## Integration Patterns

### Multi-Instance Management

**Load balancing across instances:**
```
For high-volume messaging:
1. Create instances: 'sender-1', 'sender-2', 'sender-3'
2. Distribute contacts across instances
3. Monitor instance health and redistribute if needed
```

**Specialized instance roles:**
```
- 'inbound-bot': Handle incoming messages
- 'outbound-bot': Send marketing messages  
- 'support-bot': Customer support
- 'notifications-bot': System notifications
```

### Webhook Configuration

**Comprehensive webhook setup:**
```
Configure webhook for instance 'main-bot' with URL https://myapp.com/webhook and subscribe to these events:
- APPLICATION_STARTUP
- QRCODE_UPDATED  
- MESSAGES_UPSERT
- MESSAGES_UPDATE
- SEND_MESSAGE
- CONNECTION_UPDATE
```

**Event-specific handling:**
```
Set up different webhook URLs for different event types:
- Messages: https://myapp.com/webhook/messages
- Status: https://myapp.com/webhook/status
- Groups: https://myapp.com/webhook/groups
```

### Error Handling and Recovery

**Instance health monitoring:**
```
Every 5 minutes:
1. Check status of all instances
2. If instance is 'close', attempt restart
3. If restart fails, send alert to admin group
4. Create backup instance if needed
```

**Message delivery verification:**
```
After sending important messages:
1. Check message status
2. If not delivered, retry with different instance
3. Log failed deliveries for analysis
4. Send delivery report to admin
```

### Privacy and Compliance

**GDPR-compliant messaging:**
```
Before sending marketing messages:
1. Check consent status in database
2. Include unsubscribe option in message
3. Log all communications
4. Respect opt-out requests immediately
```

**Data retention management:**
```
Weekly cleanup process:
1. Archive messages older than 90 days
2. Remove personal data for deleted contacts
3. Update privacy settings as needed
4. Generate compliance report
```

## Advanced Use Cases

### AI-Powered Responses

**Intelligent customer service:**
```
When customer asks question:
1. Analyze message content with AI
2. Generate appropriate response
3. If confidence is high, send automated response
4. If confidence is low, escalate to human agent
5. Learn from human corrections
```

**Sentiment Analysis:**
```
For each incoming message:
1. Analyze sentiment (positive/negative/neutral)
2. Route negative sentiment to priority queue
3. Send empathetic responses for negative sentiment
4. Celebrate positive feedback
```

### Multi-Channel Integration

**Omnichannel support:**
```
Integrate WhatsApp with other channels:
1. Sync conversations across email, chat, WhatsApp
2. Maintain conversation history
3. Allow agents to switch channels seamlessly
4. Provide unified customer view
```

**Social media integration:**
```
When mentioned on social media:
1. Detect mention with monitoring tools
2. Reach out via WhatsApp if contact available
3. Provide personalized response
4. Track engagement across channels
```

### Analytics and Reporting

**Message analytics:**
```
Daily analytics report:
1. Messages sent/received per instance
2. Response times and delivery rates
3. Most active contacts and groups
4. Error rates and common issues
5. Performance trends
```

**Business intelligence:**
```
Weekly business report:
1. Customer engagement metrics
2. Conversion rates from WhatsApp campaigns
3. Support ticket resolution times
4. Customer satisfaction scores
5. ROI analysis
```

## Best Practices from Examples

### Message Timing
- Add delays between bulk messages (1-2 seconds minimum)
- Respect time zones for international messaging
- Avoid sending messages during late night hours

### Content Guidelines
- Keep messages concise and clear
- Use emojis appropriately for engagement
- Include clear call-to-action when needed
- Provide opt-out options for marketing messages

### Error Prevention
- Always validate phone numbers before messaging
- Check instance status before sending
- Implement retry logic for critical messages
- Monitor delivery rates and adjust strategies

### Performance Optimization
- Use appropriate instance for message volume
- Implement message queuing for high volume
- Monitor API rate limits
- Cache frequently used data

---

These examples should give you a solid foundation for implementing WhatsApp automation with the Evolution API MCP Server. Start with simple use cases and gradually build more complex workflows as you become familiar with the system.