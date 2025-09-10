/**
 * Webhook Management endpoint definitions
 */

import { z } from 'zod';
import { EndpointInfo } from '../types';

// Schemas for Webhook Management endpoints
export const setWebhookSchema = z.object({
  instance: z.string().describe('Nome da instância'),
  webhook: z.object({
    url: z.string().url().describe('URL do webhook'),
    enabled: z.boolean().optional().describe('Se o webhook está habilitado'),
    webhookByEvents: z.boolean().optional().describe('Webhook por eventos'),
    webhookBase64: z.boolean().optional().describe('Webhook em base64'),
    events: z.array(z.enum([
      'APPLICATION_STARTUP',
      'QRCODE_UPDATED',
      'CONNECTION_UPDATE',
      'MESSAGES_SET',
      'MESSAGES_UPSERT',
      'MESSAGES_UPDATE',
      'MESSAGES_DELETE',
      'SEND_MESSAGE',
      'CONTACTS_SET',
      'CONTACTS_UPSERT',
      'CONTACTS_UPDATE',
      'PRESENCE_UPDATE',
      'CHATS_SET',
      'CHATS_UPSERT',
      'CHATS_UPDATE',
      'CHATS_DELETE',
      'GROUPS_UPSERT',
      'GROUP_UPDATE',
      'GROUP_PARTICIPANTS_UPDATE',
      'NEW_JWT_TOKEN',
      'TYPEBOT_START',
      'TYPEBOT_CHANGE_STATUS'
    ])).optional().describe('Lista de eventos para o webhook')
  }).describe('Configuração do webhook')
});

export const getWebhookSchema = z.object({
  instance: z.string().describe('Nome da instância')
});

// Webhook Management endpoints
export const webhookEndpoints: EndpointInfo[] = [
  {
    name: 'set-webhook',
    path: '/webhook/set/{instance}',
    method: 'POST',
    description: 'Configurar webhook para a instância',
    controller: 'webhook',
    requiresInstance: true,
    schema: setWebhookSchema,
    parameters: [
      {
        name: 'instance',
        type: 'string',
        required: true,
        description: 'Nome da instância',
        location: 'path',
        example: 'minha-instancia'
      },
      {
        name: 'webhook',
        type: 'object',
        required: true,
        description: 'Configuração do webhook',
        location: 'body',
        example: {
          url: 'https://meusite.com/webhook',
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
      }
    ],
    examples: {
      request: {
        webhook: {
          url: 'https://meusite.com/webhook',
          enabled: true,
          webhookByEvents: true,
          events: ['MESSAGES_UPSERT', 'SEND_MESSAGE']
        }
      }
    }
  },
  {
    name: 'get-webhook',
    path: '/webhook/find/{instance}',
    method: 'GET',
    description: 'Obter configuração do webhook',
    controller: 'webhook',
    requiresInstance: true,
    schema: getWebhookSchema,
    parameters: [
      {
        name: 'instance',
        type: 'string',
        required: true,
        description: 'Nome da instância',
        location: 'path',
        example: 'minha-instancia'
      }
    ]
  }
];