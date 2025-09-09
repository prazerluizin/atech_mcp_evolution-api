/**
 * Instance Controller endpoint definitions
 */

import { z } from 'zod';
import { EndpointInfo } from '../types';

// Schemas for Instance Controller endpoints
export const createInstanceSchema = z.object({
  instanceName: z.string().describe('Nome da instância'),
  token: z.string().optional().describe('Token de autenticação opcional'),
  qrcode: z.boolean().optional().describe('Se deve gerar QR code'),
  webhook: z.string().url().optional().describe('URL do webhook'),
  webhookByEvents: z.boolean().optional().describe('Webhook por eventos'),
  webhookBase64: z.boolean().optional().describe('Webhook em base64'),
  events: z.array(z.string()).optional().describe('Lista de eventos do webhook')
});

export const connectInstanceSchema = z.object({
  instance: z.string().describe('Nome da instância')
});

export const restartInstanceSchema = z.object({
  instance: z.string().describe('Nome da instância')
});

export const deleteInstanceSchema = z.object({
  instance: z.string().describe('Nome da instância')
});

export const setPresenceSchema = z.object({
  instance: z.string().describe('Nome da instância'),
  presence: z.enum(['available', 'unavailable', 'composing', 'recording', 'paused']).describe('Status de presença')
});

export const fetchInstancesSchema = z.object({});

// Instance Controller endpoints
export const instanceEndpoints: EndpointInfo[] = [
  {
    name: 'create-instance',
    path: '/instance/create',
    method: 'POST',
    description: 'Criar uma nova instância do WhatsApp',
    controller: 'instance',
    requiresInstance: false,
    schema: createInstanceSchema,
    parameters: [
      {
        name: 'instanceName',
        type: 'string',
        required: true,
        description: 'Nome único para a instância',
        location: 'body',
        example: 'minha-instancia'
      },
      {
        name: 'token',
        type: 'string',
        required: false,
        description: 'Token de autenticação opcional',
        location: 'body'
      },
      {
        name: 'qrcode',
        type: 'boolean',
        required: false,
        description: 'Se deve gerar QR code para conexão',
        location: 'body',
        example: true
      },
      {
        name: 'webhook',
        type: 'string',
        required: false,
        description: 'URL do webhook para receber eventos',
        location: 'body',
        example: 'https://meusite.com/webhook'
      }
    ],
    examples: {
      request: {
        instanceName: 'minha-instancia',
        qrcode: true,
        webhook: 'https://meusite.com/webhook'
      }
    }
  },
  {
    name: 'fetch-instances',
    path: '/instance/fetchInstances',
    method: 'GET',
    description: 'Listar todas as instâncias',
    controller: 'instance',
    requiresInstance: false,
    schema: fetchInstancesSchema,
    parameters: []
  },
  {
    name: 'connect-instance',
    path: '/instance/connect/{instance}',
    method: 'GET',
    description: 'Conectar uma instância e obter QR code',
    controller: 'instance',
    requiresInstance: true,
    schema: connectInstanceSchema,
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
  },
  {
    name: 'restart-instance',
    path: '/instance/restart/{instance}',
    method: 'PUT',
    description: 'Reiniciar uma instância',
    controller: 'instance',
    requiresInstance: true,
    schema: restartInstanceSchema,
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
  },
  {
    name: 'delete-instance',
    path: '/instance/delete/{instance}',
    method: 'DELETE',
    description: 'Deletar uma instância',
    controller: 'instance',
    requiresInstance: true,
    schema: deleteInstanceSchema,
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
  },
  {
    name: 'set-presence',
    path: '/chat/presence/{instance}',
    method: 'POST',
    description: 'Definir status de presença da instância',
    controller: 'instance',
    requiresInstance: true,
    schema: setPresenceSchema,
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
        name: 'presence',
        type: 'string',
        required: true,
        description: 'Status de presença (available, unavailable, composing, recording, paused)',
        location: 'body',
        example: 'available'
      }
    ]
  }
];