/**
 * Chat Controller endpoint definitions
 */

import { z } from 'zod';
import { EndpointInfo } from '../types';

// Schemas for Chat Controller endpoints
export const findMessagesSchema = z.object({
  instance: z.string().describe('Nome da instância'),
  where: z.object({
    key: z.object({
      remoteJid: z.string().optional(),
      fromMe: z.boolean().optional(),
      id: z.string().optional()
    }).optional()
  }).optional().describe('Filtros de busca'),
  limit: z.number().optional().describe('Limite de resultados')
});

export const findContactsSchema = z.object({
  instance: z.string().describe('Nome da instância'),
  where: z.object({
    name: z.string().optional(),
    number: z.string().optional()
  }).optional().describe('Filtros de busca')
});

export const findChatsSchema = z.object({
  instance: z.string().describe('Nome da instância'),
  where: z.object({
    name: z.string().optional(),
    jid: z.string().optional()
  }).optional().describe('Filtros de busca')
});

export const markAsReadSchema = z.object({
  instance: z.string().describe('Nome da instância'),
  readMessages: z.array(z.object({
    remoteJid: z.string(),
    fromMe: z.boolean(),
    id: z.string()
  })).describe('Mensagens para marcar como lidas')
});

export const archiveChatSchema = z.object({
  instance: z.string().describe('Nome da instância'),
  chat: z.string().describe('JID do chat'),
  archive: z.boolean().describe('Arquivar (true) ou desarquivar (false)')
});

export const checkIsWhatsappSchema = z.object({
  instance: z.string().describe('Nome da instância'),
  numbers: z.array(z.string()).describe('Números para verificar')
});

export const sendPresenceSchema = z.object({
  instance: z.string().describe('Nome da instância'),
  number: z.string().describe('Número do contato'),
  presence: z.enum(['composing', 'recording', 'paused']).describe('Tipo de presença'),
  delay: z.number().optional().describe('Duração da presença em milissegundos')
});

// Chat Controller endpoints
export const chatEndpoints: EndpointInfo[] = [
  {
    name: 'find-messages',
    path: '/chat/findMessages/{instance}',
    method: 'POST',
    description: 'Buscar mensagens com filtros',
    controller: 'chat',
    requiresInstance: true,
    schema: findMessagesSchema,
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
        name: 'where',
        type: 'object',
        required: false,
        description: 'Filtros de busca',
        location: 'body',
        example: {
          key: {
            remoteJid: '5511999999999@s.whatsapp.net'
          }
        }
      },
      {
        name: 'limit',
        type: 'number',
        required: false,
        description: 'Limite de resultados',
        location: 'body',
        example: 50
      }
    ]
  },
  {
    name: 'find-contacts',
    path: '/chat/findContacts/{instance}',
    method: 'POST',
    description: 'Buscar contatos',
    controller: 'chat',
    requiresInstance: true,
    schema: findContactsSchema,
    parameters: [
      {
        name: 'instance',
        type: 'string',
        required: true,
        description: 'Nome da instância',
        location: 'path'
      },
      {
        name: 'where',
        type: 'object',
        required: false,
        description: 'Filtros de busca',
        location: 'body'
      }
    ]
  },
  {
    name: 'find-chats',
    path: '/chat/findChats/{instance}',
    method: 'POST',
    description: 'Buscar conversas',
    controller: 'chat',
    requiresInstance: true,
    schema: findChatsSchema,
    parameters: [
      {
        name: 'instance',
        type: 'string',
        required: true,
        description: 'Nome da instância',
        location: 'path'
      },
      {
        name: 'where',
        type: 'object',
        required: false,
        description: 'Filtros de busca',
        location: 'body'
      }
    ]
  },
  {
    name: 'mark-as-read',
    path: '/chat/markMessageAsRead/{instance}',
    method: 'POST',
    description: 'Marcar mensagens como lidas',
    controller: 'chat',
    requiresInstance: true,
    schema: markAsReadSchema,
    parameters: [
      {
        name: 'instance',
        type: 'string',
        required: true,
        description: 'Nome da instância',
        location: 'path'
      },
      {
        name: 'readMessages',
        type: 'array',
        required: true,
        description: 'Array de mensagens para marcar como lidas',
        location: 'body'
      }
    ]
  },
  {
    name: 'archive-chat',
    path: '/chat/archiveChat/{instance}',
    method: 'POST',
    description: 'Arquivar ou desarquivar conversa',
    controller: 'chat',
    requiresInstance: true,
    schema: archiveChatSchema,
    parameters: [
      {
        name: 'instance',
        type: 'string',
        required: true,
        description: 'Nome da instância',
        location: 'path'
      },
      {
        name: 'chat',
        type: 'string',
        required: true,
        description: 'JID do chat',
        location: 'body'
      },
      {
        name: 'archive',
        type: 'boolean',
        required: true,
        description: 'Arquivar (true) ou desarquivar (false)',
        location: 'body'
      }
    ]
  },
  {
    name: 'check-is-whatsapp',
    path: '/chat/whatsappNumbers/{instance}',
    method: 'POST',
    description: 'Verificar se números têm WhatsApp',
    controller: 'chat',
    requiresInstance: true,
    schema: checkIsWhatsappSchema,
    parameters: [
      {
        name: 'instance',
        type: 'string',
        required: true,
        description: 'Nome da instância',
        location: 'path'
      },
      {
        name: 'numbers',
        type: 'array',
        required: true,
        description: 'Array de números para verificar',
        location: 'body',
        example: ['5511999999999', '5511888888888']
      }
    ]
  },
  {
    name: 'send-presence',
    path: '/chat/sendPresence/{instance}',
    method: 'POST',
    description: 'Enviar indicador de presença (digitando, gravando)',
    controller: 'chat',
    requiresInstance: true,
    schema: sendPresenceSchema,
    parameters: [
      {
        name: 'instance',
        type: 'string',
        required: true,
        description: 'Nome da instância',
        location: 'path'
      },
      {
        name: 'number',
        type: 'string',
        required: true,
        description: 'Número do contato',
        location: 'body'
      },
      {
        name: 'presence',
        type: 'string',
        required: true,
        description: 'Tipo de presença (composing, recording, paused)',
        location: 'body',
        example: 'composing'
      },
      {
        name: 'delay',
        type: 'number',
        required: false,
        description: 'Duração da presença em milissegundos',
        location: 'body',
        example: 5000
      }
    ]
  }
];