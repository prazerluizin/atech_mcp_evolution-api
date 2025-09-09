/**
 * Message Controller endpoint definitions
 */

import { z } from 'zod';
import { EndpointInfo } from '../types';

// Schemas for Message Controller endpoints
export const sendTextSchema = z.object({
  instance: z.string().describe('Nome da instância'),
  number: z.string().describe('Número do destinatário'),
  text: z.string().describe('Texto da mensagem'),
  delay: z.number().optional().describe('Delay em milissegundos'),
  quoted: z.object({
    key: z.object({
      remoteJid: z.string(),
      fromMe: z.boolean(),
      id: z.string()
    }),
    message: z.any()
  }).optional().describe('Mensagem citada')
});

export const sendMediaSchema = z.object({
  instance: z.string().describe('Nome da instância'),
  number: z.string().describe('Número do destinatário'),
  media: z.string().describe('URL ou base64 da mídia'),
  caption: z.string().optional().describe('Legenda da mídia'),
  fileName: z.string().optional().describe('Nome do arquivo'),
  delay: z.number().optional().describe('Delay em milissegundos')
});

export const sendAudioSchema = z.object({
  instance: z.string().describe('Nome da instância'),
  number: z.string().describe('Número do destinatário'),
  audio: z.string().describe('URL ou base64 do áudio'),
  delay: z.number().optional().describe('Delay em milissegundos')
});

export const sendStickerSchema = z.object({
  instance: z.string().describe('Nome da instância'),
  number: z.string().describe('Número do destinatário'),
  sticker: z.string().describe('URL ou base64 do sticker'),
  delay: z.number().optional().describe('Delay em milissegundos')
});

export const sendLocationSchema = z.object({
  instance: z.string().describe('Nome da instância'),
  number: z.string().describe('Número do destinatário'),
  latitude: z.number().describe('Latitude'),
  longitude: z.number().describe('Longitude'),
  name: z.string().optional().describe('Nome do local'),
  address: z.string().optional().describe('Endereço'),
  delay: z.number().optional().describe('Delay em milissegundos')
});

export const sendContactSchema = z.object({
  instance: z.string().describe('Nome da instância'),
  number: z.string().describe('Número do destinatário'),
  contact: z.object({
    fullName: z.string(),
    wuid: z.string(),
    phoneNumber: z.string()
  }).describe('Dados do contato'),
  delay: z.number().optional().describe('Delay em milissegundos')
});

export const sendReactionSchema = z.object({
  instance: z.string().describe('Nome da instância'),
  key: z.object({
    remoteJid: z.string(),
    fromMe: z.boolean(),
    id: z.string()
  }).describe('Chave da mensagem'),
  reaction: z.string().describe('Emoji da reação')
});

export const sendPollSchema = z.object({
  instance: z.string().describe('Nome da instância'),
  number: z.string().describe('Número do destinatário'),
  name: z.string().describe('Pergunta da enquete'),
  selectableCount: z.number().describe('Número de opções selecionáveis'),
  values: z.array(z.string()).describe('Opções da enquete'),
  delay: z.number().optional().describe('Delay em milissegundos')
});

export const sendListSchema = z.object({
  instance: z.string().describe('Nome da instância'),
  number: z.string().describe('Número do destinatário'),
  title: z.string().describe('Título da lista'),
  description: z.string().describe('Descrição da lista'),
  buttonText: z.string().describe('Texto do botão'),
  footerText: z.string().optional().describe('Texto do rodapé'),
  sections: z.array(z.object({
    title: z.string(),
    rows: z.array(z.object({
      title: z.string(),
      description: z.string().optional(),
      rowId: z.string()
    }))
  })).describe('Seções da lista'),
  delay: z.number().optional().describe('Delay em milissegundos')
});

export const sendButtonSchema = z.object({
  instance: z.string().describe('Nome da instância'),
  number: z.string().describe('Número do destinatário'),
  title: z.string().describe('Título da mensagem'),
  description: z.string().describe('Descrição da mensagem'),
  footer: z.string().optional().describe('Rodapé da mensagem'),
  buttons: z.array(z.object({
    type: z.literal('replyButton'),
    reply: z.object({
      displayText: z.string(),
      id: z.string()
    })
  })).describe('Botões da mensagem'),
  delay: z.number().optional().describe('Delay em milissegundos')
});

// Message Controller endpoints
export const messageEndpoints: EndpointInfo[] = [
  {
    name: 'send-text',
    path: '/message/sendText/{instance}',
    method: 'POST',
    description: 'Enviar mensagem de texto',
    controller: 'message',
    requiresInstance: true,
    schema: sendTextSchema,
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
        name: 'number',
        type: 'string',
        required: true,
        description: 'Número do destinatário (formato: 5511999999999)',
        location: 'body',
        example: '5511999999999'
      },
      {
        name: 'text',
        type: 'string',
        required: true,
        description: 'Texto da mensagem',
        location: 'body',
        example: 'Olá, como você está?'
      },
      {
        name: 'delay',
        type: 'number',
        required: false,
        description: 'Delay em milissegundos antes de enviar',
        location: 'body',
        example: 1000
      }
    ]
  },
  {
    name: 'send-media',
    path: '/message/sendMedia/{instance}',
    method: 'POST',
    description: 'Enviar mídia (imagem, vídeo, documento)',
    controller: 'message',
    requiresInstance: true,
    schema: sendMediaSchema,
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
        description: 'Número do destinatário',
        location: 'body'
      },
      {
        name: 'media',
        type: 'string',
        required: true,
        description: 'URL ou base64 da mídia',
        location: 'body'
      },
      {
        name: 'caption',
        type: 'string',
        required: false,
        description: 'Legenda da mídia',
        location: 'body'
      }
    ]
  },
  {
    name: 'send-audio',
    path: '/message/sendWhatsAppAudio/{instance}',
    method: 'POST',
    description: 'Enviar áudio/voz',
    controller: 'message',
    requiresInstance: true,
    schema: sendAudioSchema,
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
        description: 'Número do destinatário',
        location: 'body'
      },
      {
        name: 'audio',
        type: 'string',
        required: true,
        description: 'URL ou base64 do áudio',
        location: 'body'
      }
    ]
  },
  {
    name: 'send-sticker',
    path: '/message/sendSticker/{instance}',
    method: 'POST',
    description: 'Enviar sticker',
    controller: 'message',
    requiresInstance: true,
    schema: sendStickerSchema,
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
        description: 'Número do destinatário',
        location: 'body'
      },
      {
        name: 'sticker',
        type: 'string',
        required: true,
        description: 'URL ou base64 do sticker',
        location: 'body'
      }
    ]
  },
  {
    name: 'send-location',
    path: '/message/sendLocation/{instance}',
    method: 'POST',
    description: 'Enviar localização',
    controller: 'message',
    requiresInstance: true,
    schema: sendLocationSchema,
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
        description: 'Número do destinatário',
        location: 'body'
      },
      {
        name: 'latitude',
        type: 'number',
        required: true,
        description: 'Latitude da localização',
        location: 'body'
      },
      {
        name: 'longitude',
        type: 'number',
        required: true,
        description: 'Longitude da localização',
        location: 'body'
      }
    ]
  },
  {
    name: 'send-contact',
    path: '/message/sendContact/{instance}',
    method: 'POST',
    description: 'Enviar contato',
    controller: 'message',
    requiresInstance: true,
    schema: sendContactSchema,
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
        description: 'Número do destinatário',
        location: 'body'
      },
      {
        name: 'contact',
        type: 'object',
        required: true,
        description: 'Dados do contato',
        location: 'body'
      }
    ]
  },
  {
    name: 'send-reaction',
    path: '/message/sendReaction/{instance}',
    method: 'POST',
    description: 'Enviar reação a uma mensagem',
    controller: 'message',
    requiresInstance: true,
    schema: sendReactionSchema,
    parameters: [
      {
        name: 'instance',
        type: 'string',
        required: true,
        description: 'Nome da instância',
        location: 'path'
      },
      {
        name: 'key',
        type: 'object',
        required: true,
        description: 'Chave da mensagem para reagir',
        location: 'body'
      },
      {
        name: 'reaction',
        type: 'string',
        required: true,
        description: 'Emoji da reação',
        location: 'body'
      }
    ]
  },
  {
    name: 'send-poll',
    path: '/message/sendPoll/{instance}',
    method: 'POST',
    description: 'Enviar enquete',
    controller: 'message',
    requiresInstance: true,
    schema: sendPollSchema,
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
        description: 'Número do destinatário',
        location: 'body'
      },
      {
        name: 'name',
        type: 'string',
        required: true,
        description: 'Pergunta da enquete',
        location: 'body'
      },
      {
        name: 'values',
        type: 'array',
        required: true,
        description: 'Opções da enquete',
        location: 'body'
      }
    ]
  },
  {
    name: 'send-list',
    path: '/message/sendList/{instance}',
    method: 'POST',
    description: 'Enviar lista interativa',
    controller: 'message',
    requiresInstance: true,
    schema: sendListSchema,
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
        description: 'Número do destinatário',
        location: 'body'
      },
      {
        name: 'title',
        type: 'string',
        required: true,
        description: 'Título da lista',
        location: 'body'
      },
      {
        name: 'sections',
        type: 'array',
        required: true,
        description: 'Seções da lista',
        location: 'body'
      }
    ]
  },
  {
    name: 'send-button',
    path: '/message/sendButtons/{instance}',
    method: 'POST',
    description: 'Enviar botões interativos',
    controller: 'message',
    requiresInstance: true,
    schema: sendButtonSchema,
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
        description: 'Número do destinatário',
        location: 'body'
      },
      {
        name: 'title',
        type: 'string',
        required: true,
        description: 'Título da mensagem',
        location: 'body'
      },
      {
        name: 'buttons',
        type: 'array',
        required: true,
        description: 'Botões da mensagem',
        location: 'body'
      }
    ]
  }
];