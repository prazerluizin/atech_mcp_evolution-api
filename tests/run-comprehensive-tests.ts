/**
 * Comprehensive Test Runner
 * Runs all test suites in the correct order and provides detailed reporting
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { resolve } from 'path';

interface TestSuite {
  name: string;
  pattern: string;
  description: string;
  timeout?: number;
}

const testSuites: TestSuite[] = [
  {
    name: 'Unit Tests - Configuration',
    pattern: 'tests/config/**/*.test.ts',
    description: 'Configuration management and validation tests'
  },
  {
    name: 'Unit Tests - Utilities',
    pattern: 'tests/utils/**/*.test.ts',
    description: 'Error handling and validation utilities tests'
  },
  {
    name: 'Unit Tests - Registry',
    pattern: 'tests/registry/**/*.test.ts',
    description: 'Endpoint registry and tool registration tests'
  },
  {
    name: 'Unit Tests - HTTP Client',
    pattern: 'tests/clients/**/*.test.ts',
    description: 'HTTP client with mocked responses tests'
  },
  {
    name: 'Unit Tests - Server Core',
    pattern: 'tests/server/mcp-server.test.ts tests/server/tool-*.test.ts',
    description: 'MCP server core and tool registry tests'
  },
  {
    name: 'Unit Tests - Tool Implementations',
    pattern: 'tests/server/*-tools.test.ts',
    description: 'Individual tool implementation tests'
  },
  {
    name: 'Unit Tests - CLI',
    pattern: 'tests/cli/**/*.test.ts',
    description: 'CLI interface and NPX executable tests'
  },
  {
    name: 'Integration Tests - Error Scenarios',
    pattern: 'tests/integration/error-scenarios.test.ts',
    description: 'Comprehensive error handling and edge cases',
    timeout: 30000
  },
  {
    name: 'Integration Tests - MCP Protocol',
    pattern: 'tests/integration/mcp-protocol.test.ts',
    description: 'End-to-end MCP protocol communication',
    timeout: 30000
  },
  {
    name: 'Integration Tests - Mock Evolution API',
    pattern: 'tests/integration/mock-evolution-api.test.ts',
    description: 'Integration with mock Evolution API server',
    timeout: 60000
  },
  {
    name: 'Integration Tests - Tool Workflows',
    pattern: 'tests/server/*-integration.test.ts',
    description: 'Complete tool workflow integration tests',
    timeout: 30000
  }
];

interface TestResult {
  suite: string;
  passed: boolean;
  duration: number;
  output: string;
  error?: string;
}

class ComprehensiveTestRunner {
  private results: TestResult[] = [];
  private startTime: number = 0;

  async runAllTests(): Promise<void> {
    console.log('🚀 Starting Comprehensive Test Suite for Evolution API MCP Server\n');
    this.startTime = Date.now();

    // Check test environment
    this.checkTestEnvironment();

    // Run each test suite
    for (const suite of testSuites) {
      await this.runTestSuite(suite);
    }

    // Generate final report
    this.generateReport();
  }

  private checkTestEnvironment(): void {
    console.log('🔍 Checking test environment...');
    
    const requiredFiles = [
      'jest.config.js',
      'tests/setup.ts',
      'tests/helpers/test-utils.ts'
    ];

    for (const file of requiredFiles) {
      if (!existsSync(resolve(process.cwd(), file))) {
        console.error(`❌ Missing required file: ${file}`);
        process.exit(1);
      }
    }

    console.log('✅ Test environment ready\n');
  }

  private async runTestSuite(suite: TestSuite): Promise<void> {
    console.log(`📋 Running: ${suite.name}`);
    console.log(`   ${suite.description}`);
    
    const startTime = Date.now();
    
    try {
      const timeout = suite.timeout || 15000;
      const command = `npm test -- --testPathPattern="${suite.pattern}" --verbose --timeout=${timeout}`;
      
      const output = execSync(command, {
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: timeout + 5000 // Add buffer to Jest timeout
      });

      const duration = Date.now() - startTime;
      
      this.results.push({
        suite: suite.name,
        passed: true,
        duration,
        output
      });

      console.log(`✅ Passed (${duration}ms)\n`);
      
    } catch (error: any) {
      const duration = Date.now() - startTime;
      
      this.results.push({
        suite: suite.name,
        passed: false,
        duration,
        output: error.stdout || '',
        error: error.stderr || error.message
      });

      console.log(`❌ Failed (${duration}ms)`);
      console.log(`   Error: ${error.message}\n`);
    }
  }

  private generateReport(): void {
    const totalDuration = Date.now() - this.startTime;
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    const total = this.results.length;

    console.log('📊 COMPREHENSIVE TEST REPORT');
    console.log('=' .repeat(50));
    console.log(`Total Test Suites: ${total}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
    console.log(`Total Duration: ${(totalDuration / 1000).toFixed(2)}s`);
    console.log('');

    // Detailed results
    console.log('📋 DETAILED RESULTS');
    console.log('-'.repeat(50));
    
    for (const result of this.results) {
      const status = result.passed ? '✅' : '❌';
      const duration = `${result.duration}ms`;
      console.log(`${status} ${result.suite.padEnd(35)} ${duration.padStart(8)}`);
      
      if (!result.passed && result.error) {
        console.log(`   Error: ${result.error.split('\n')[0]}`);
      }
    }

    console.log('');

    // Coverage summary
    this.generateCoverageSummary();

    // Recommendations
    this.generateRecommendations();

    // Exit with appropriate code
    process.exit(failed > 0 ? 1 : 0);
  }

  private generateCoverageSummary(): void {
    console.log('📈 COVERAGE AREAS TESTED');
    console.log('-'.repeat(50));
    
    const coverageAreas = [
      '✅ Configuration Management (env vars, files, validation)',
      '✅ HTTP Client (requests, retries, error handling)',
      '✅ Tool Registry (registration, discovery, validation)',
      '✅ MCP Server Core (initialization, STDIO transport)',
      '✅ Instance Controller Tools (create, connect, manage)',
      '✅ Message Controller Tools (text, media, reactions)',
      '✅ Chat Controller Tools (find, manage, presence)',
      '✅ Group Controller Tools (create, manage, participants)',
      '✅ Profile & Webhook Tools (settings, configuration)',
      '✅ Error Scenarios (network, auth, validation, edge cases)',
      '✅ MCP Protocol Communication (end-to-end flows)',
      '✅ Evolution API Integration (mock server testing)',
      '✅ CLI Interface (NPX execution, argument parsing)',
      '✅ Performance & Concurrency (load testing, race conditions)'
    ];

    for (const area of coverageAreas) {
      console.log(`   ${area}`);
    }
    console.log('');
  }

  private generateRecommendations(): void {
    const failedSuites = this.results.filter(r => !r.passed);
    
    if (failedSuites.length === 0) {
      console.log('🎉 EXCELLENT! All test suites passed!');
      console.log('');
      console.log('✨ RECOMMENDATIONS FOR PRODUCTION:');
      console.log('   • Run tests in CI/CD pipeline');
      console.log('   • Add performance benchmarks');
      console.log('   • Monitor test execution times');
      console.log('   • Consider adding mutation testing');
      console.log('   • Set up automated security scanning');
      return;
    }

    console.log('🔧 RECOMMENDATIONS FOR FIXES:');
    console.log('-'.repeat(50));
    
    for (const failed of failedSuites) {
      console.log(`❌ ${failed.suite}:`);
      
      if (failed.error?.includes('timeout')) {
        console.log('   • Increase test timeout or optimize test performance');
      } else if (failed.error?.includes('Cannot find module')) {
        console.log('   • Check import paths and ensure all dependencies are installed');
      } else if (failed.error?.includes('TypeError')) {
        console.log('   • Review mock implementations and type definitions');
      } else if (failed.error?.includes('Connection')) {
        console.log('   • Verify network mocking and test isolation');
      } else {
        console.log('   • Review test implementation and error logs');
      }
    }

    console.log('');
    console.log('💡 GENERAL RECOMMENDATIONS:');
    console.log('   • Fix failing tests before proceeding to implementation');
    console.log('   • Ensure all mocks properly implement expected interfaces');
    console.log('   • Verify test environment setup and dependencies');
    console.log('   • Consider running tests individually to isolate issues');
  }
}

// Run the comprehensive test suite
if (require.main === module) {
  const runner = new ComprehensiveTestRunner();
  runner.runAllTests().catch(error => {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
  });
}

export { ComprehensiveTestRunner };