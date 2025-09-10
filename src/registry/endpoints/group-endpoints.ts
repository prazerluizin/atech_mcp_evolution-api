/**
 * Group Controller endpoint definitions
 */

import { z } from 'zod';
import { EndpointInfo } from '../types';

// Schemas for Group Controller endpoints
export const createGroupSchema = z.object({
  instance: z.string().describe('Nome da instância'),
  subject: z.string().describe('Nome do grupo'),
  description: z.string().optional().describe('Descrição do grupo'),
  participants: z.array(z.string()).describe('Lista de participantes (números)')
});

export const updateGroupPictureSchema = z.object({
  instance: z.string().describe('Nome da instância'),
  groupJid: z.string().describe('JID do grupo'),
  image: z.string().describe('URL ou base64 da imagem')
});

export const updateGroupSubjectSchema = z.object({
  instance: z.string().describe('Nome da instância'),
  groupJid: z.string().describe('JID do grupo'),
  subject: z.string().describe('Novo nome do grupo')
});

export const updateGroupDescriptionSchema = z.object({
  instance: z.string().describe('Nome da instância'),
  groupJid: z.string().describe('JID do grupo'),
  description: z.string().describe('Nova descrição do grupo')
});

export const fetchInviteCodeSchema = z.object({
  instance: z.string().describe('Nome da instância'),
  groupJid: z.string().describe('JID do grupo')
});

export const revokeInviteCodeSchema = z.object({
  instance: z.string().describe('Nome da instância'),
  groupJid: z.string().describe('JID do grupo')
});

export const updateParticipantSchema = z.object({
  instance: z.string().describe('Nome da instância'),
  groupJid: z.string().describe('JID do grupo'),
  action: z.enum(['add', 'remove', 'promote', 'demote']).describe('Ação a ser executada'),
  participants: z.array(z.string()).describe('Lista de participantes')
});

export const leaveGroupSchema = z.object({
  instance: z.string().describe('Nome da instância'),
  groupJid: z.string().describe('JID do grupo')
});

export const fetchGroupInfoSchema = z.object({
  instance: z.string().describe('Nome da instância'),
  groupJid: z.string().describe('JID do grupo')
});

// Group Controller endpoints
export const groupEndpoints: EndpointInfo[] = [
  {
    name: 'create-group',
    path: '/group/create/{instance}',
    method: 'POST',
    description: 'Criar um novo grupo',
    controller: 'group',
    requiresInstance: true,
    schema: createGroupSchema,
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
        name: 'subject',
        type: 'string',
        required: true,
        description: 'Nome do grupo',
        location: 'body',
        example: 'Meu Grupo'
      },
      {
        name: 'description',
        type: 'string',
        required: false,
        description: 'Descrição do grupo',
        location: 'body',
        example: 'Descrição do meu grupo'
      },
      {
        name: 'participants',
        type: 'array',
        required: true,
        description: 'Lista de números dos participantes',
        location: 'body',
        example: ['5511999999999', '5511888888888']
      }
    ]
  },
  {
    name: 'update-group-picture',
    path: '/group/updateGroupPicture/{instance}',
    method: 'PUT',
    description: 'Atualizar foto do grupo',
    controller: 'group',
    requiresInstance: true,
    schema: updateGroupPictureSchema,
    parameters: [
      {
        name: 'instance',
        type: 'string',
        required: true,
        description: 'Nome da instância',
        location: 'path'
      },
      {
        name: 'groupJid',
        type: 'string',
        required: true,
        description: 'JID do grupo',
        location: 'body',
        example: '120363123456789012@g.us'
      },
      {
        name: 'image',
        type: 'string',
        required: true,
        description: 'URL ou base64 da imagem',
        location: 'body'
      }
    ]
  },
  {
    name: 'update-group-subject',
    path: '/group/updateGroupSubject/{instance}',
    method: 'PUT',
    description: 'Atualizar nome do grupo',
    controller: 'group',
    requiresInstance: true,
    schema: updateGroupSubjectSchema,
    parameters: [
      {
        name: 'instance',
        type: 'string',
        required: true,
        description: 'Nome da instância',
        location: 'path'
      },
      {
        name: 'groupJid',
        type: 'string',
        required: true,
        description: 'JID do grupo',
        location: 'body'
      },
      {
        name: 'subject',
        type: 'string',
        required: true,
        description: 'Novo nome do grupo',
        location: 'body'
      }
    ]
  },
  {
    name: 'update-group-description',
    path: '/group/updateGroupDescription/{instance}',
    method: 'PUT',
    description: 'Atualizar descrição do grupo',
    controller: 'group',
    requiresInstance: true,
    schema: updateGroupDescriptionSchema,
    parameters: [
      {
        name: 'instance',
        type: 'string',
        required: true,
        description: 'Nome da instância',
        location: 'path'
      },
      {
        name: 'groupJid',
        type: 'string',
        required: true,
        description: 'JID do grupo',
        location: 'body'
      },
      {
        name: 'description',
        type: 'string',
        required: true,
        description: 'Nova descrição do grupo',
        location: 'body'
      }
    ]
  },
  {
    name: 'fetch-invite-code',
    path: '/group/fetchInviteCode/{instance}',
    method: 'POST',
    description: 'Obter código de convite do grupo',
    controller: 'group',
    requiresInstance: true,
    schema: fetchInviteCodeSchema,
    parameters: [
      {
        name: 'instance',
        type: 'string',
        required: true,
        description: 'Nome da instância',
        location: 'path'
      },
      {
        name: 'groupJid',
        type: 'string',
        required: true,
        description: 'JID do grupo',
        location: 'body'
      }
    ]
  },
  {
    name: 'revoke-invite-code',
    path: '/group/revokeInviteCode/{instance}',
    method: 'PUT',
    description: 'Revogar código de convite do grupo',
    controller: 'group',
    requiresInstance: true,
    schema: revokeInviteCodeSchema,
    parameters: [
      {
        name: 'instance',
        type: 'string',
        required: true,
        description: 'Nome da instância',
        location: 'path'
      },
      {
        name: 'groupJid',
        type: 'string',
        required: true,
        description: 'JID do grupo',
        location: 'body'
      }
    ]
  },
  {
    name: 'update-participant',
    path: '/group/updateParticipant/{instance}',
    method: 'PUT',
    description: 'Gerenciar participantes do grupo (adicionar, remover, promover, rebaixar)',
    controller: 'group',
    requiresInstance: true,
    schema: updateParticipantSchema,
    parameters: [
      {
        name: 'instance',
        type: 'string',
        required: true,
        description: 'Nome da instância',
        location: 'path'
      },
      {
        name: 'groupJid',
        type: 'string',
        required: true,
        description: 'JID do grupo',
        location: 'body'
      },
      {
        name: 'action',
        type: 'string',
        required: true,
        description: 'Ação (add, remove, promote, demote)',
        location: 'body',
        example: 'add'
      },
      {
        name: 'participants',
        type: 'array',
        required: true,
        description: 'Lista de números dos participantes',
        location: 'body'
      }
    ]
  },
  {
    name: 'leave-group',
    path: '/group/leaveGroup/{instance}',
    method: 'DELETE',
    description: 'Sair do grupo',
    controller: 'group',
    requiresInstance: true,
    schema: leaveGroupSchema,
    parameters: [
      {
        name: 'instance',
        type: 'string',
        required: true,
        description: 'Nome da instância',
        location: 'path'
      },
      {
        name: 'groupJid',
        type: 'string',
        required: true,
        description: 'JID do grupo',
        location: 'body'
      }
    ]
  },
  {
    name: 'fetch-group-info',
    path: '/group/fetchAllGroups/{instance}',
    method: 'GET',
    description: 'Buscar informações de todos os grupos',
    controller: 'group',
    requiresInstance: true,
    schema: fetchGroupInfoSchema,
    parameters: [
      {
        name: 'instance',
        type: 'string',
        required: true,
        description: 'Nome da instância',
        location: 'path'
      }
    ]
  }
];