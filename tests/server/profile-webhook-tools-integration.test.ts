/**
 * Integration tests for Profile and Webhook Management Tools
 * Tests the tools with a real HTTP client (mocked at the network level)
 */

import { ProfileWebhookTools } from '../../src/server/tools/profile-webhook-tools';
import { EvolutionHttpClient } from '../../src/clients/evolution-http-client';
import axios from 'axios';

// Mock axios for integration testing
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ProfileWebhookTools Integration Tests', () => {
  let profileWebhookTools: ProfileWebhookTools;
  let httpClient: EvolutionHttpClient;

  beforeEach(() => {
    // Create real HTTP client with mocked axios
    httpClient = new EvolutionHttpClient({
      baseURL: 'https://test-api.com',
      apiKey: 'test-api-key'
    });
    profileWebhookTools = new ProfileWebhookTools(httpClient);
    
    // Reset axios mocks
    jest.clearAllMocks();
  });

  // ===== PROFILE MANAGEMENT INTEGRATION TESTS =====

  describe('Profile Management Integration', () => {
    it('should handle complete profile update workflow', async () => {
      // Mock fetch profile response
      mockedAxios.request.mockResolvedValueOnce({
        status: 200,
        data: {
          name: 'Old Name',
          status: 'Old Status',
          picture: 'old_picture_url'
        }
      });

      // Mock update profile name response
      mockedAxios.request.mockResolvedValueOnce({
        status: 200,
        data: { success: true, message: 'Profile name updated' }
      });

      // Mock update profile status response
      mockedAxios.request.mockResolvedValueOnce({
        status: 200,
        data: { success: true, message: 'Profile status updated' }
      });

      // Mock update profile picture response
      mockedAxios.request.mockResolvedValueOnce({
        status: 200,
        data: { success: true, message: 'Profile picture updated' }
      });

      // 1. Fetch current profile
      const fetchTool = profileWebhookTools.createFetchProfileTool();
      const fetchResult = await fetchTool.handler({ instance: 'test-instance' });
      
      expect(fetchResult.success).toBe(true);
      expect(fetchResult.data?.profile.name).toBe('Old Name');

      // 2. Update profile name
      const updateNameTool = profileWebhookTools.createUpdateProfileNameTool();
      const nameResult = await updateNameTool.handler({ 
        instance: 'test-instance', 
        name: 'New Business Name' 
      });
      
      expect(nameResult.success).toBe(true);
      expect(nameResult.data?.newName).toBe('New Business Name');

      // 3. Update profile status
      const updateStatusTool = profileWebhookTools.createUpdateProfileStatusTool();
      const statusResult = await updateStatusTool.handler({ 
        instance: 'test-instance', 
        status: 'Available 24/7 for business inquiries' 
      });
      
      expect(statusResult.success).toBe(true);
      expect(statusResult.data?.newStatus).toBe('Available 24/7 for business inquiries');

      // 4. Update profile picture
      const updatePictureTool = profileWebhookTools.createUpdateProfilePictureTool();
      const pictureResult = await updatePictureTool.handler({ 
        instance: 'test-instance', 
        picture: 'https://example.com/new-profile.jpg' 
      });
      
      expect(pictureResult.success).toBe(true);
      expect(pictureResult.data?.pictureSource).toBe('URL');

      // Verify all API calls were made with correct parameters
      expect(mockedAxios.request).toHaveBeenCalledTimes(4);
      
      // Check fetch profile call
      expect(mockedAxios.request).toHaveBeenNthCalledWith(1, expect.objectContaining({
        method: 'POST',
        url: 'https://test-api.com/chat/fetchProfile/test-instance',
        data: {},
        headers: expect.objectContaining({
          'apikey': 'test-api-key'
        })
      }));

      // Check update name call
      expect(mockedAxios.request).toHaveBeenNthCalledWith(2, expect.objectContaining({
        method: 'PUT',
        url: 'https://test-api.com/chat/updateProfileName/test-instance',
        data: { name: 'New Business Name' }
      }));

      // Check update status call
      expect(mockedAxios.request).toHaveBeenNthCalledWith(3, expect.objectContaining({
        method: 'PUT',
        url: 'https://test-api.com/chat/updateProfileStatus/test-instance',
        data: { status: 'Available 24/7 for business inquiries' }
      }));

      // Check update picture call
      expect(mockedAxios.request).toHaveBeenNthCalledWith(4, expect.objectContaining({
        method: 'PUT',
        url: 'https://test-api.com/chat/updateProfilePicture/test-instance',
        data: { picture: 'https://example.com/new-profile.jpg' }
      }));
    });

    it('should handle profile management errors gracefully', async () => {
      // Mock 404 error for non-existent instance
      mockedAxios.request.mockRejectedValueOnce({
        response: {
          status: 404,
          data: { error: 'Instance not found' }
        }
      });

      const fetchTool = profileWebhookTools.createFetchProfileTool();
      const result = await fetchTool.handler({ instance: 'non-existent-instance' });
      
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Instance not found');
      expect(result.error?.message).toContain('Instance not found');
    });
  });

  // ===== PRIVACY SETTINGS INTEGRATION TESTS =====

  describe('Privacy Settings Integration', () => {
    it('should handle complete privacy settings workflow', async () => {
      // Mock fetch privacy settings response
      mockedAxios.request.mockResolvedValueOnce({
        status: 200,
        data: {
          readreceipts: 'all',
          profile: 'all',
          status: 'all',
          online: 'all',
          last: 'all',
          groupadd: 'all'
        }
      });

      // Mock update privacy settings response
      mockedAxios.request.mockResolvedValueOnce({
        status: 200,
        data: { success: true, message: 'Privacy settings updated' }
      });

      // 1. Fetch current privacy settings
      const fetchTool = profileWebhookTools.createFetchPrivacySettingsTool();
      const fetchResult = await fetchTool.handler({ instance: 'test-instance' });
      
      expect(fetchResult.success).toBe(true);
      expect(fetchResult.data?.privacySettings.readreceipts).toBe('all');

      // 2. Update privacy settings to more restrictive
      const updateTool = profileWebhookTools.createUpdatePrivacySettingsTool();
      const updateResult = await updateTool.handler({ 
        instance: 'test-instance', 
        privacySettings: {
          readreceipts: 'all',
          profile: 'contacts',
          status: 'contacts',
          online: 'match_last_seen',
          last: 'contacts',
          groupadd: 'contacts'
        }
      });
      
      expect(updateResult.success).toBe(true);
      expect(updateResult.data?.updatedSettings.profile).toBe('contacts');

      // Verify API calls
      expect(mockedAxios.request).toHaveBeenCalledTimes(2);
      
      expect(mockedAxios.request).toHaveBeenNthCalledWith(1, expect.objectContaining({
        method: 'GET',
        url: 'https://test-api.com/chat/fetchPrivacySettings/test-instance'
      }));

      expect(mockedAxios.request).toHaveBeenNthCalledWith(2, expect.objectContaining({
        method: 'PUT',
        url: 'https://test-api.com/chat/updatePrivacySettings/test-instance',
        data: {
          privacySettings: {
            readreceipts: 'all',
            profile: 'contacts',
            status: 'contacts',
            online: 'match_last_seen',
            last: 'contacts',
            groupadd: 'contacts'
          }
        }
      }));
    });
  });

  // ===== BUSINESS PROFILE INTEGRATION TESTS =====

  describe('Business Profile Integration', () => {
    it('should handle business profile management workflow', async () => {
      // Mock fetch business profile response
      mockedAxios.request.mockResolvedValueOnce({
        status: 200,
        data: {
          description: 'Old business description',
          category: 'General',
          email: 'old@business.com',
          website: ['https://old-site.com'],
          address: 'Old Address'
        }
      });

      // Mock update business profile response
      mockedAxios.request.mockResolvedValueOnce({
        status: 200,
        data: { success: true, message: 'Business profile updated' }
      });

      // 1. Fetch current business profile
      const fetchTool = profileWebhookTools.createFetchBusinessProfileTool();
      const fetchResult = await fetchTool.handler({ instance: 'business-instance' });
      
      expect(fetchResult.success).toBe(true);
      expect(fetchResult.data?.businessProfile.category).toBe('General');

      // 2. Update business profile
      const updateTool = profileWebhookTools.createUpdateBusinessProfileTool();
      const updateResult = await updateTool.handler({ 
        instance: 'business-instance', 
        business: {
          description: 'We provide excellent technology solutions for businesses',
          category: 'Technology',
          email: 'contact@techbusiness.com',
          website: ['https://techbusiness.com', 'https://support.techbusiness.com'],
          address: '123 Tech Street, Innovation City, TC 12345'
        }
      });
      
      expect(updateResult.success).toBe(true);
      expect(updateResult.data?.updatedFields).toContain('description');
      expect(updateResult.data?.updatedFields).toContain('category');
      expect(updateResult.data?.updatedFields).toContain('email');

      // Verify API calls
      expect(mockedAxios.request).toHaveBeenCalledTimes(2);
      
      expect(mockedAxios.request).toHaveBeenNthCalledWith(2, expect.objectContaining({
        method: 'PUT',
        url: 'https://test-api.com/chat/updateBusinessProfile/business-instance',
        data: {
          business: {
            description: 'We provide excellent technology solutions for businesses',
            category: 'Technology',
            email: 'contact@techbusiness.com',
            website: ['https://techbusiness.com', 'https://support.techbusiness.com'],
            address: '123 Tech Street, Innovation City, TC 12345'
          }
        }
      }));
    });
  });

  // ===== WEBHOOK MANAGEMENT INTEGRATION TESTS =====

  describe('Webhook Management Integration', () => {
    it('should handle complete webhook configuration workflow', async () => {
      // Mock get webhook response (no webhook configured)
      mockedAxios.request.mockResolvedValueOnce({
        status: 404,
        data: { error: 'Webhook not configured' }
      });

      // Mock set webhook response
      mockedAxios.request.mockResolvedValueOnce({
        status: 200,
        data: { 
          success: true, 
          message: 'Webhook configured successfully',
          webhook: {
            url: 'https://myserver.com/webhook',
            enabled: true,
            events: ['MESSAGES_UPSERT', 'SEND_MESSAGE', 'CONNECTION_UPDATE']
          }
        }
      });

      // Mock get webhook response (after configuration)
      mockedAxios.request.mockResolvedValueOnce({
        status: 200,
        data: {
          url: 'https://myserver.com/webhook',
          enabled: true,
          webhookByEvents: true,
          webhookBase64: false,
          events: ['MESSAGES_UPSERT', 'SEND_MESSAGE', 'CONNECTION_UPDATE']
        }
      });

      // 1. Try to get webhook (should fail - not configured)
      const getTool = profileWebhookTools.createGetWebhookTool();
      const getResult1 = await getTool.handler({ instance: 'test-instance' });
      
      expect(getResult1.success).toBe(false);

      // 2. Set webhook configuration
      const setTool = profileWebhookTools.createSetWebhookTool();
      const setResult = await setTool.handler({ 
        instance: 'test-instance', 
        webhook: {
          url: 'https://myserver.com/webhook',
          enabled: true,
          webhookByEvents: true,
          webhookBase64: false,
          events: ['MESSAGES_UPSERT', 'SEND_MESSAGE', 'CONNECTION_UPDATE']
        }
      });
      
      expect(setResult.success).toBe(true);
      expect(setResult.data?.webhookUrl).toBe('https://myserver.com/webhook');
      expect(setResult.data?.eventsCount).toBe(3);

      // 3. Get webhook configuration (should succeed now)
      const getResult2 = await getTool.handler({ instance: 'test-instance' });
      
      expect(getResult2.success).toBe(true);
      expect(getResult2.data?.webhookConfig.url).toBe('https://myserver.com/webhook');
      expect(getResult2.data?.webhookConfig.enabled).toBe(true);

      // Verify API calls
      expect(mockedAxios.request).toHaveBeenCalledTimes(3);
      
      // Check set webhook call
      expect(mockedAxios.request).toHaveBeenNthCalledWith(2, expect.objectContaining({
        method: 'POST',
        url: 'https://test-api.com/webhook/set/test-instance',
        data: {
          webhook: {
            url: 'https://myserver.com/webhook',
            enabled: true,
            webhookByEvents: true,
            webhookBase64: false,
            events: ['MESSAGES_UPSERT', 'SEND_MESSAGE', 'CONNECTION_UPDATE']
          }
        }
      }));
    });

    it('should validate webhook URL before making API call', async () => {
      const setTool = profileWebhookTools.createSetWebhookTool();
      const result = await setTool.handler({ 
        instance: 'test-instance', 
        webhook: {
          url: 'invalid-url-format',
          enabled: true
        }
      });
      
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Invalid webhook URL format');
      
      // Should not make any API calls for invalid URL
      expect(mockedAxios.request).not.toHaveBeenCalled();
    });

    it('should handle webhook configuration with all available events', async () => {
      // Mock successful webhook configuration
      mockedAxios.request.mockResolvedValueOnce({
        status: 200,
        data: { success: true, message: 'Webhook configured with all events' }
      });

      const allEvents = [
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
      ];

      const setTool = profileWebhookTools.createSetWebhookTool();
      const result = await setTool.handler({ 
        instance: 'test-instance', 
        webhook: {
          url: 'https://comprehensive-webhook.com/events',
          enabled: true,
          webhookByEvents: true,
          webhookBase64: true,
          events: allEvents
        }
      });
      
      expect(result.success).toBe(true);
      expect(result.data?.eventsCount).toBe(allEvents.length);
      expect(result.data?.selectedEvents).toEqual(allEvents);

      // Verify the API call includes all events
      expect(mockedAxios.request).toHaveBeenCalledWith(expect.objectContaining({
        data: {
          webhook: {
            url: 'https://comprehensive-webhook.com/events',
            enabled: true,
            webhookByEvents: true,
            webhookBase64: true,
            events: allEvents
          }
        }
      }));
    });
  });

  // ===== API INFORMATION INTEGRATION TESTS =====

  describe('API Information Integration', () => {
    it('should fetch Evolution API information successfully', async () => {
      // Mock API information response
      mockedAxios.request.mockResolvedValueOnce({
        status: 200,
        data: {
          version: '2.1.0',
          status: 'online',
          features: [
            'instances',
            'messages', 
            'groups',
            'webhooks',
            'profiles',
            'business_profiles'
          ],
          uptime: '5 days, 12 hours, 30 minutes',
          totalInstances: 15,
          activeInstances: 12,
          serverTime: '2024-01-15T10:30:00Z'
        }
      });

      const getTool = profileWebhookTools.createGetInformationTool();
      const result = await getTool.handler({});
      
      expect(result.success).toBe(true);
      expect(result.data?.apiInfo.version).toBe('2.1.0');
      expect(result.data?.apiInfo.status).toBe('online');
      expect(result.data?.apiInfo.features).toContain('profiles');
      expect(result.data?.apiInfo.features).toContain('webhooks');

      // Verify API call
      expect(mockedAxios.request).toHaveBeenCalledWith(expect.objectContaining({
        method: 'GET',
        url: 'https://test-api.com/get-information',
        headers: expect.objectContaining({
          'apikey': 'test-api-key'
        })
      }));
    });

    it('should handle API information request when server is down', async () => {
      // Mock server error
      mockedAxios.request.mockRejectedValueOnce({
        response: {
          status: 503,
          data: { error: 'Service unavailable' }
        }
      });

      const getTool = profileWebhookTools.createGetInformationTool();
      const result = await getTool.handler({});
      
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Server error');
      expect(result.error?.message).toContain('Server error');
    });
  });

  // ===== COMPREHENSIVE WORKFLOW INTEGRATION TEST =====

  describe('Complete Profile and Webhook Setup Workflow', () => {
    it('should handle a complete business setup workflow', async () => {
      // Mock API information
      mockedAxios.request.mockResolvedValueOnce({
        status: 200,
        data: { version: '2.1.0', status: 'online' }
      });

      // Mock profile setup
      mockedAxios.request.mockResolvedValueOnce({
        status: 200,
        data: { success: true }
      });

      mockedAxios.request.mockResolvedValueOnce({
        status: 200,
        data: { success: true }
      });

      // Mock business profile setup
      mockedAxios.request.mockResolvedValueOnce({
        status: 200,
        data: { success: true }
      });

      // Mock privacy settings
      mockedAxios.request.mockResolvedValueOnce({
        status: 200,
        data: { success: true }
      });

      // Mock webhook setup
      mockedAxios.request.mockResolvedValueOnce({
        status: 200,
        data: { success: true }
      });

      // 1. Check API status
      const infoTool = profileWebhookTools.createGetInformationTool();
      const infoResult = await infoTool.handler({});
      expect(infoResult.success).toBe(true);

      // 2. Setup profile
      const nameResult = await profileWebhookTools.createUpdateProfileNameTool()
        .handler({ instance: 'business-bot', name: 'TechCorp Support' });
      expect(nameResult.success).toBe(true);

      const statusResult = await profileWebhookTools.createUpdateProfileStatusTool()
        .handler({ instance: 'business-bot', status: 'Available 24/7 for support' });
      expect(statusResult.success).toBe(true);

      // 3. Setup business profile
      const businessResult = await profileWebhookTools.createUpdateBusinessProfileTool()
        .handler({ 
          instance: 'business-bot', 
          business: {
            description: 'Technology solutions provider',
            category: 'Technology',
            email: 'support@techcorp.com',
            website: ['https://techcorp.com']
          }
        });
      expect(businessResult.success).toBe(true);

      // 4. Configure privacy settings
      const privacyResult = await profileWebhookTools.createUpdatePrivacySettingsTool()
        .handler({ 
          instance: 'business-bot', 
          privacySettings: {
            profile: 'all',
            status: 'all',
            last: 'contacts'
          }
        });
      expect(privacyResult.success).toBe(true);

      // 5. Setup webhook
      const webhookResult = await profileWebhookTools.createSetWebhookTool()
        .handler({ 
          instance: 'business-bot', 
          webhook: {
            url: 'https://techcorp.com/whatsapp-webhook',
            enabled: true,
            events: ['MESSAGES_UPSERT', 'SEND_MESSAGE', 'CONNECTION_UPDATE']
          }
        });
      expect(webhookResult.success).toBe(true);

      // Verify all API calls were made
      expect(mockedAxios.request).toHaveBeenCalledTimes(6);
    });
  });
});