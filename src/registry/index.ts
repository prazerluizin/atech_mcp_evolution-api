/**
 * Registry module exports
 */

export * from './types';
export * from './endpoint-registry';
export { evolutionEndpointRegistry } from './endpoint-registry';

// Export individual endpoint collections for direct access if needed
export { instanceEndpoints } from './endpoints/instance-endpoints';
export { messageEndpoints } from './endpoints/message-endpoints';
export { chatEndpoints } from './endpoints/chat-endpoints';
export { groupEndpoints } from './endpoints/group-endpoints';
export { profileEndpoints } from './endpoints/profile-endpoints';
export { webhookEndpoints } from './endpoints/webhook-endpoints';
export { informationEndpoints } from './endpoints/information-endpoints';