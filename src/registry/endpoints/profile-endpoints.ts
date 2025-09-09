/**
 * Profile Settings endpoint definitions
 */

import { z } from 'zod';
import { EndpointInfo } from '../types';

// Schemas for Profile Settings endpoints
export const fetchProfileSchema = z.object({
  instance: z.string().describe('Nome da instância'),
  number: z.string().optional().describe('Número do perfil (opcional, padrão é o próprio)')
});

export const updateProfileNameSchema = z.object({
  instance: z.string().describe('Nome da instância'),
  name: z.string().describe('Novo nome do perfil')
});

export const updateProfileStatusSchema = z.object({
  instance: z.string().describe('Nome da instância'),
  status: z.string().describe('Novo status do perfil')
});

export const updateProfilePictureSchema = z.object({
  instance: z.string().describe('Nome da instância'),
  picture: z.string().describe('URL ou base64 da foto do perfil')
});

export const fetchPrivacySettingsSchema = z.object({
  instance: z.string().describe('Nome da instância')
});

export const updatePrivacySettingsSchema = z.object({
  instance: z.string().describe('Nome da instância'),
  privacySettings: z.object({
    readreceipts: z.enum(['all', 'none']).optional(),
    profile: z.enum(['all', 'contacts', 'contact_blacklist', 'none']).optional(),
    status: z.enum(['all', 'contacts', 'contact_blacklist', 'none']).optional(),
    online: z.enum(['all', 'match_last_seen']).optional(),
    last: z.enum(['all', 'contacts', 'contact_blacklist', 'none']).optional(),
    groupadd: z.enum(['all', 'contacts', 'contact_blacklist', 'none']).optional()
  }).describe('Configurações de privacidade')
});

export const fetchBusinessProfileSchema = z.object({
  instance: z.string().describe('Nome da instância')
});

export const updateBusinessProfileSchema = z.object({
  instance: z.string().describe('Nome da instância'),
  business: z.object({
    description: z.string().optional(),
    category: z.string().optional(),
    email: z.string().email().optional(),
    website: z.array(z.string().url()).optional(),
    address: z.string().optional()
  }).describe('Dados do perfil comercial')
});

// Profile Settings endpoints
export const profileEndpoints: EndpointInfo[] = [
  {
    name: 'fetch-profile',
    path: '/chat/fetchProfile/{instance}',
    method: 'POST',
    description: 'Buscar informações do perfil',
    controller: 'profile',
    requiresInstance: true,
    schema: fetchProfileSchema,
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
        required: false,
        description: 'Número do perfil (opcional)',
        location: 'body',
        example: '5511999999999'
      }
    ]
  },
  {
    name: 'update-profile-name',
    path: '/chat/updateProfileName/{instance}',
    method: 'PUT',
    description: 'Atualizar nome do perfil',
    controller: 'profile',
    requiresInstance: true,
    schema: updateProfileNameSchema,
    parameters: [
      {
        name: 'instance',
        type: 'string',
        required: true,
        description: 'Nome da instância',
        location: 'path'
      },
      {
        name: 'name',
        type: 'string',
        required: true,
        description: 'Novo nome do perfil',
        location: 'body',
        example: 'Meu Nome'
      }
    ]
  },
  {
    name: 'update-profile-status',
    path: '/chat/updateProfileStatus/{instance}',
    method: 'PUT',
    description: 'Atualizar status do perfil',
    controller: 'profile',
    requiresInstance: true,
    schema: updateProfileStatusSchema,
    parameters: [
      {
        name: 'instance',
        type: 'string',
        required: true,
        description: 'Nome da instância',
        location: 'path'
      },
      {
        name: 'status',
        type: 'string',
        required: true,
        description: 'Novo status do perfil',
        location: 'body',
        example: 'Disponível'
      }
    ]
  },
  {
    name: 'update-profile-picture',
    path: '/chat/updateProfilePicture/{instance}',
    method: 'PUT',
    description: 'Atualizar foto do perfil',
    controller: 'profile',
    requiresInstance: true,
    schema: updateProfilePictureSchema,
    parameters: [
      {
        name: 'instance',
        type: 'string',
        required: true,
        description: 'Nome da instância',
        location: 'path'
      },
      {
        name: 'picture',
        type: 'string',
        required: true,
        description: 'URL ou base64 da foto do perfil',
        location: 'body'
      }
    ]
  },
  {
    name: 'fetch-privacy-settings',
    path: '/chat/fetchPrivacySettings/{instance}',
    method: 'GET',
    description: 'Buscar configurações de privacidade',
    controller: 'profile',
    requiresInstance: true,
    schema: fetchPrivacySettingsSchema,
    parameters: [
      {
        name: 'instance',
        type: 'string',
        required: true,
        description: 'Nome da instância',
        location: 'path'
      }
    ]
  },
  {
    name: 'update-privacy-settings',
    path: '/chat/updatePrivacySettings/{instance}',
    method: 'PUT',
    description: 'Atualizar configurações de privacidade',
    controller: 'profile',
    requiresInstance: true,
    schema: updatePrivacySettingsSchema,
    parameters: [
      {
        name: 'instance',
        type: 'string',
        required: true,
        description: 'Nome da instância',
        location: 'path'
      },
      {
        name: 'privacySettings',
        type: 'object',
        required: true,
        description: 'Configurações de privacidade',
        location: 'body',
        example: {
          readreceipts: 'all',
          profile: 'contacts',
          status: 'contacts',
          online: 'all',
          last: 'contacts',
          groupadd: 'contacts'
        }
      }
    ]
  },
  {
    name: 'fetch-business-profile',
    path: '/chat/fetchBusinessProfile/{instance}',
    method: 'GET',
    description: 'Buscar perfil comercial',
    controller: 'profile',
    requiresInstance: true,
    schema: fetchBusinessProfileSchema,
    parameters: [
      {
        name: 'instance',
        type: 'string',
        required: true,
        description: 'Nome da instância',
        location: 'path'
      }
    ]
  },
  {
    name: 'update-business-profile',
    path: '/chat/updateBusinessProfile/{instance}',
    method: 'PUT',
    description: 'Atualizar perfil comercial',
    controller: 'profile',
    requiresInstance: true,
    schema: updateBusinessProfileSchema,
    parameters: [
      {
        name: 'instance',
        type: 'string',
        required: true,
        description: 'Nome da instância',
        location: 'path'
      },
      {
        name: 'business',
        type: 'object',
        required: true,
        description: 'Dados do perfil comercial',
        location: 'body',
        example: {
          description: 'Minha empresa',
          category: 'Tecnologia',
          email: 'contato@empresa.com',
          website: ['https://empresa.com'],
          address: 'Rua das Flores, 123'
        }
      }
    ]
  }
];