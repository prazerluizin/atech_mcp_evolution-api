// Simple test script to verify configuration system
const { createConfigurationManager } = require('./dist/config/configuration-manager.js');

async function testConfig() {
  console.log('Testing configuration system...');
  
  try {
    // Test with environment variables
    process.env.EVOLUTION_URL = 'https://test.example.com';
    process.env.EVOLUTION_API_KEY = 'test-key-123';
    process.env.HTTP_TIMEOUT = '5000';
    
    const configManager = createConfigurationManager();
    const config = await configManager.loadConfig();
    
    console.log('✅ Configuration loaded successfully:');
    console.log('- Evolution URL:', config.evolutionUrl);
    console.log('- API Key:', config.evolutionApiKey ? '[SET]' : '[NOT SET]');
    console.log('- Server Name:', config.server.name);
    console.log('- HTTP Timeout:', config.http.timeout);
    console.log('- Retry Attempts:', config.http.retryAttempts);
    
    console.log('\n✅ Configuration Summary:');
    console.log(configManager.getConfigSummary());
    
    // Test validation error
    console.log('\n🧪 Testing validation error...');
    delete process.env.EVOLUTION_API_KEY;
    configManager.clearCache();
    
    try {
      await configManager.loadConfig();
      console.log('❌ Should have thrown validation error');
    } catch (error) {
      console.log('✅ Validation error caught:', error.message.split('\n')[0]);
    }
    
    console.log('\n🎉 All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testConfig();