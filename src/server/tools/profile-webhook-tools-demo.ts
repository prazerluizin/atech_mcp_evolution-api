/**
 * Demo script for Profile and Webhook Management Tools
 * Demonstrates all available profile and webhook management functionality
 */

import { ProfileWebhookTools } from './profile-webhook-tools';
import { EvolutionHttpClient } from '../../clients/evolution-http-client';

/**
 * Demo class to showcase Profile and Webhook Management Tools
 */
export class ProfileWebhookToolsDemo {
  private profileWebhookTools: ProfileWebhookTools;
  private httpClient: EvolutionHttpClient;

  constructor(evolutionUrl: string, apiKey: string) {
    this.httpClient = new EvolutionHttpClient(evolutionUrl, apiKey);
    this.profileWebhookTools = new ProfileWebhookTools(this.httpClient);
  }

  /**
   * Demonstrate all profile and webhook management tools
   */
  async runCompleteDemo(instanceName: string): Promise<void> {
    console.log('🚀 Starting Profile and Webhook Management Tools Demo');
    console.log('=' .repeat(60));

    try {
      // 1. Get API Information
      await this.demoApiInformation();

      // 2. Profile Management Demo
      await this.demoProfileManagement(instanceName);

      // 3. Privacy Settings Demo
      await this.demoPrivacySettings(instanceName);

      // 4. Business Profile Demo
      await this.demoBusinessProfile(instanceName);

      // 5. Webhook Management Demo
      await this.demoWebhookManagement(instanceName);

      console.log('\n✅ Profile and Webhook Management Tools Demo completed successfully!');
      
    } catch (error) {
      console.error('❌ Demo failed:', error);
      throw error;
    }
  }

  /**
   * Demo API Information tool
   */
  async demoApiInformation(): Promise<void> {
    console.log('\n📊 API Information Demo');
    console.log('-'.repeat(30));

    try {
      const tool = this.profileWebhookTools.createGetInformationTool();
      console.log(`Tool: ${tool.name}`);
      console.log(`Description: ${tool.description}`);

      const result = await tool.handler({});
      
      if (result.success) {
        console.log('✅ API Information retrieved successfully');
        console.log('📋 API Details:', JSON.stringify(result.data?.apiInfo, null, 2));
      } else {
        console.log('❌ Failed to get API information:', result.error?.message);
      }
    } catch (error) {
      console.error('❌ API Information demo error:', error);
    }
  }

  /**
   * Demo profile management tools
   */
  async demoProfileManagement(instanceName: string): Promise<void> {
    console.log('\n👤 Profile Management Demo');
    console.log('-'.repeat(30));

    try {
      // Fetch current profile
      console.log('\n1. Fetching current profile...');
      const fetchTool = this.profileWebhookTools.createFetchProfileTool();
      const fetchResult = await fetchTool.handler({ instance: instanceName });
      
      if (fetchResult.success) {
        console.log('✅ Profile fetched successfully');
        console.log('📋 Current Profile:', JSON.stringify(fetchResult.data?.profile, null, 2));
      } else {
        console.log('❌ Failed to fetch profile:', fetchResult.error?.message);
      }

      // Update profile name
      console.log('\n2. Updating profile name...');
      const updateNameTool = this.profileWebhookTools.createUpdateProfileNameTool();
      const nameResult = await updateNameTool.handler({ 
        instance: instanceName, 
        name: 'Evolution API Demo Bot' 
      });
      
      if (nameResult.success) {
        console.log('✅ Profile name updated successfully');
        console.log(`📝 New name: ${nameResult.data?.newName}`);
      } else {
        console.log('❌ Failed to update profile name:', nameResult.error?.message);
      }

      // Update profile status
      console.log('\n3. Updating profile status...');
      const updateStatusTool = this.profileWebhookTools.createUpdateProfileStatusTool();
      const statusResult = await updateStatusTool.handler({ 
        instance: instanceName, 
        status: 'Available for demo and testing - Evolution API v2' 
      });
      
      if (statusResult.success) {
        console.log('✅ Profile status updated successfully');
        console.log(`📝 New status: ${statusResult.data?.newStatus}`);
      } else {
        console.log('❌ Failed to update profile status:', statusResult.error?.message);
      }

      // Update profile picture (example with URL)
      console.log('\n4. Updating profile picture...');
      const updatePictureTool = this.profileWebhookTools.createUpdateProfilePictureTool();
      const pictureResult = await updatePictureTool.handler({ 
        instance: instanceName, 
        picture: 'https://via.placeholder.com/300x300/4CAF50/FFFFFF?text=Evolution+API' 
      });
      
      if (pictureResult.success) {
        console.log('✅ Profile picture updated successfully');
        console.log(`🖼️ Picture source: ${pictureResult.data?.pictureSource}`);
      } else {
        console.log('❌ Failed to update profile picture:', pictureResult.error?.message);
      }

    } catch (error) {
      console.error('❌ Profile management demo error:', error);
    }
  }

  /**
   * Demo privacy settings tools
   */
  async demoPrivacySettings(instanceName: string): Promise<void> {
    console.log('\n🔒 Privacy Settings Demo');
    console.log('-'.repeat(30));

    try {
      // Fetch current privacy settings
      console.log('\n1. Fetching current privacy settings...');
      const fetchTool = this.profileWebhookTools.createFetchPrivacySettingsTool();
      const fetchResult = await fetchTool.handler({ instance: instanceName });
      
      if (fetchResult.success) {
        console.log('✅ Privacy settings fetched successfully');
        console.log('📋 Current Settings:', JSON.stringify(fetchResult.data?.privacySettings, null, 2));
      } else {
        console.log('❌ Failed to fetch privacy settings:', fetchResult.error?.message);
      }

      // Update privacy settings
      console.log('\n2. Updating privacy settings...');
      const updateTool = this.profileWebhookTools.createUpdatePrivacySettingsTool();
      const updateResult = await updateTool.handler({ 
        instance: instanceName, 
        privacySettings: {
          readreceipts: 'all',
          profile: 'contacts',
          status: 'contacts',
          online: 'all',
          last: 'contacts',
          groupadd: 'contacts'
        }
      });
      
      if (updateResult.success) {
        console.log('✅ Privacy settings updated successfully');
        console.log('📝 Updated Settings:', JSON.stringify(updateResult.data?.updatedSettings, null, 2));
      } else {
        console.log('❌ Failed to update privacy settings:', updateResult.error?.message);
      }

    } catch (error) {
      console.error('❌ Privacy settings demo error:', error);
    }
  }

  /**
   * Demo business profile tools
   */
  async demoBusinessProfile(instanceName: string): Promise<void> {
    console.log('\n🏢 Business Profile Demo');
    console.log('-'.repeat(30));

    try {
      // Fetch current business profile
      console.log('\n1. Fetching current business profile...');
      const fetchTool = this.profileWebhookTools.createFetchBusinessProfileTool();
      const fetchResult = await fetchTool.handler({ instance: instanceName });
      
      if (fetchResult.success) {
        console.log('✅ Business profile fetched successfully');
        console.log('📋 Current Business Profile:', JSON.stringify(fetchResult.data?.businessProfile, null, 2));
      } else {
        console.log('❌ Failed to fetch business profile:', fetchResult.error?.message);
      }

      // Update business profile
      console.log('\n2. Updating business profile...');
      const updateTool = this.profileWebhookTools.createUpdateBusinessProfileTool();
      const updateResult = await updateTool.handler({ 
        instance: instanceName, 
        business: {
          description: 'Evolution API v2 - The most advanced WhatsApp API solution for businesses. Automate your customer communication with powerful features.',
          category: 'Technology',
          email: 'demo@evolution-api.com',
          website: [
            'https://evolution-api.com',
            'https://docs.evolution-api.com'
          ],
          address: 'Innovation District, Tech City, Digital State, 12345'
        }
      });
      
      if (updateResult.success) {
        console.log('✅ Business profile updated successfully');
        console.log(`📝 Updated fields: ${updateResult.data?.updatedFields.join(', ')}`);
      } else {
        console.log('❌ Failed to update business profile:', updateResult.error?.message);
      }

    } catch (error) {
      console.error('❌ Business profile demo error:', error);
    }
  }

  /**
   * Demo webhook management tools
   */
  async demoWebhookManagement(instanceName: string): Promise<void> {
    console.log('\n🔗 Webhook Management Demo');
    console.log('-'.repeat(30));

    try {
      // Get current webhook configuration
      console.log('\n1. Checking current webhook configuration...');
      const getTool = this.profileWebhookTools.createGetWebhookTool();
      const getResult1 = await getTool.handler({ instance: instanceName });
      
      if (getResult1.success) {
        console.log('✅ Webhook configuration retrieved');
        console.log('📋 Current Webhook:', JSON.stringify(getResult1.data?.webhookConfig, null, 2));
      } else {
        console.log('ℹ️ No webhook configured yet or failed to retrieve:', getResult1.error?.message);
      }

      // Set webhook configuration
      console.log('\n2. Configuring webhook...');
      const setTool = this.profileWebhookTools.createSetWebhookTool();
      const setResult = await setTool.handler({ 
        instance: instanceName, 
        webhook: {
          url: 'https://demo-webhook.evolution-api.com/events',
          enabled: true,
          webhookByEvents: true,
          webhookBase64: false,
          events: [
            'APPLICATION_STARTUP',
            'QRCODE_UPDATED',
            'CONNECTION_UPDATE',
            'MESSAGES_UPSERT',
            'SEND_MESSAGE',
            'CONTACTS_UPSERT',
            'CHATS_UPSERT',
            'GROUPS_UPSERT',
            'GROUP_PARTICIPANTS_UPDATE'
          ]
        }
      });
      
      if (setResult.success) {
        console.log('✅ Webhook configured successfully');
        console.log(`🔗 Webhook URL: ${setResult.data?.webhookUrl}`);
        console.log(`📊 Events configured: ${setResult.data?.eventsCount}`);
        console.log('📋 Selected Events:', setResult.data?.selectedEvents);
      } else {
        console.log('❌ Failed to configure webhook:', setResult.error?.message);
      }

      // Get updated webhook configuration
      console.log('\n3. Verifying webhook configuration...');
      const getResult2 = await getTool.handler({ instance: instanceName });
      
      if (getResult2.success) {
        console.log('✅ Webhook configuration verified');
        console.log('📋 Updated Webhook Config:', JSON.stringify(getResult2.data?.webhookConfig, null, 2));
      } else {
        console.log('❌ Failed to verify webhook configuration:', getResult2.error?.message);
      }

    } catch (error) {
      console.error('❌ Webhook management demo error:', error);
    }
  }

  /**
   * Demo webhook URL validation
   */
  async demoWebhookValidation(): Promise<void> {
    console.log('\n🔍 Webhook URL Validation Demo');
    console.log('-'.repeat(30));

    const setTool = this.profileWebhookTools.createSetWebhookTool();

    // Test invalid URLs
    const invalidUrls = [
      'not-a-url',
      'ftp://invalid-protocol.com',
      'http://',
      'https://',
      'invalid-format'
    ];

    for (const invalidUrl of invalidUrls) {
      console.log(`\nTesting invalid URL: ${invalidUrl}`);
      const result = await setTool.handler({ 
        instance: 'test-instance', 
        webhook: { url: invalidUrl, enabled: true }
      });
      
      if (!result.success) {
        console.log(`✅ Correctly rejected invalid URL: ${result.error?.message}`);
      } else {
        console.log(`❌ Unexpectedly accepted invalid URL`);
      }
    }

    // Test valid URLs
    const validUrls = [
      'https://example.com/webhook',
      'http://localhost:3000/webhook',
      'https://api.mycompany.com/whatsapp/events'
    ];

    console.log('\nTesting valid URL formats (validation only):');
    for (const validUrl of validUrls) {
      try {
        new URL(validUrl);
        console.log(`✅ Valid URL format: ${validUrl}`);
      } catch {
        console.log(`❌ Invalid URL format: ${validUrl}`);
      }
    }
  }

  /**
   * Get all available tools summary
   */
  getToolsSummary(): void {
    console.log('\n📚 Available Profile and Webhook Management Tools');
    console.log('=' .repeat(60));

    const tools = this.profileWebhookTools.getAllTools();
    
    const toolsByController = tools.reduce((acc, tool) => {
      if (!acc[tool.controller]) {
        acc[tool.controller] = [];
      }
      acc[tool.controller].push(tool);
      return acc;
    }, {} as Record<string, typeof tools>);

    Object.entries(toolsByController).forEach(([controller, controllerTools]) => {
      console.log(`\n${controller.toUpperCase()} CONTROLLER (${controllerTools.length} tools):`);
      controllerTools.forEach((tool, index) => {
        console.log(`  ${index + 1}. ${tool.name}`);
        console.log(`     ${tool.description}`);
      });
    });

    console.log(`\n📊 Total Tools: ${tools.length}`);
  }
}

/**
 * Example usage of the demo
 */
async function runDemo(): Promise<void> {
  // Configuration
  const EVOLUTION_URL = process.env.EVOLUTION_URL || 'https://your-evolution-api.com';
  const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || 'your-api-key';
  const INSTANCE_NAME = process.env.INSTANCE_NAME || 'demo-instance';

  if (!process.env.EVOLUTION_URL || !process.env.EVOLUTION_API_KEY) {
    console.log('⚠️ Please set EVOLUTION_URL and EVOLUTION_API_KEY environment variables');
    console.log('Example:');
    console.log('EVOLUTION_URL=https://your-api.com EVOLUTION_API_KEY=your-key npm run demo:profile-webhook');
    return;
  }

  try {
    const demo = new ProfileWebhookToolsDemo(EVOLUTION_URL, EVOLUTION_API_KEY);
    
    // Show tools summary
    demo.getToolsSummary();
    
    // Run complete demo
    await demo.runCompleteDemo(INSTANCE_NAME);
    
    // Demo webhook validation
    await demo.demoWebhookValidation();
    
  } catch (error) {
    console.error('❌ Demo execution failed:', error);
    process.exit(1);
  }
}

// Run demo if this file is executed directly
if (require.main === module) {
  runDemo().catch(console.error);
}

export { runDemo };