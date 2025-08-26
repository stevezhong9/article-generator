#!/usr/bin/env node

/**
 * ShareX AI 功能自动测试脚本
 * 用于快速验证部署后的基础功能
 */

const https = require('https');
const http = require('http');

// 配置
const CONFIG = {
  // 修改为您的实际域名
  baseUrl: process.argv[2] || 'http://localhost:3000',
  timeout: 10000
};

// 测试结果
let testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

// 颜色输出
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = '') {
  console.log(`${color}${message}${colors.reset}`);
}

// HTTP 请求函数
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https:') ? https : http;
    
    const req = lib.get(url, {
      timeout: CONFIG.timeout,
      ...options
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// 测试函数
async function runTest(name, testFn) {
  try {
    log(`🧪 Testing: ${name}`, colors.blue);
    const result = await testFn();
    if (result) {
      log(`✅ PASS: ${name}`, colors.green);
      testResults.passed++;
    } else {
      log(`❌ FAIL: ${name}`, colors.red);
      testResults.failed++;
    }
    testResults.tests.push({ name, passed: result });
  } catch (error) {
    log(`❌ ERROR: ${name} - ${error.message}`, colors.red);
    testResults.failed++;
    testResults.tests.push({ name, passed: false, error: error.message });
  }
}

// 具体测试用例
const tests = {
  // 基础页面访问测试
  async testHomePage() {
    const response = await makeRequest(`${CONFIG.baseUrl}/`);
    return response.statusCode === 200 && response.body.includes('ShareX AI');
  },

  async testLogo() {
    const response = await makeRequest(`${CONFIG.baseUrl}/`);
    return response.body.includes('/logo.png') && response.body.includes('alt="ShareX AI');
  },

  // 法律页面测试
  async testPrivacyPage() {
    const response = await makeRequest(`${CONFIG.baseUrl}/privacy`);
    return response.statusCode === 200 && response.body.includes('Privacy Policy');
  },

  async testTermsPage() {
    const response = await makeRequest(`${CONFIG.baseUrl}/terms`);
    return response.statusCode === 200 && response.body.includes('Terms');
  },

  async testDMCAPage() {
    const response = await makeRequest(`${CONFIG.baseUrl}/dmca`);
    return response.statusCode === 200 && response.body.includes('DMCA');
  },

  async testContactPage() {
    const response = await makeRequest(`${CONFIG.baseUrl}/contact`);
    return response.statusCode === 200 && response.body.includes('Contact');
  },

  // 订阅页面测试
  async testPricingPage() {
    const response = await makeRequest(`${CONFIG.baseUrl}/subscription/pricing`);
    return response.statusCode === 200 && response.body.includes('VIP') || response.body.includes('subscription');
  },

  // API 端点测试（基础检查）
  async testAPIHealth() {
    try {
      const response = await makeRequest(`${CONFIG.baseUrl}/api/subscription/plans`);
      // API 可能需要认证，所以 401 或 500 也算正常响应
      return response.statusCode < 500;
    } catch (error) {
      return false;
    }
  },

  // 品牌CSS测试
  async testBrandCSS() {
    const response = await makeRequest(`${CONFIG.baseUrl}/`);
    return response.body.includes('brand-blue') || 
           response.body.includes('brand-orange') ||
           response.body.includes('gradient-primary');
  },

  // 多语言测试
  async testLanguageRoutes() {
    const response = await makeRequest(`${CONFIG.baseUrl}/zh`);
    return response.statusCode === 200;
  },

  // 安全头部测试
  async testSecurityHeaders() {
    const response = await makeRequest(`${CONFIG.baseUrl}/`);
    return response.headers['x-frame-options'] || 
           response.headers['x-content-type-options'];
  },

  // 管理员页面保护测试
  async testAdminProtection() {
    const response = await makeRequest(`${CONFIG.baseUrl}/admin`);
    // 未认证用户应该被重定向或拒绝访问
    return response.statusCode === 302 || response.statusCode === 401 || response.statusCode === 403;
  }
};

// 主测试函数
async function runAllTests() {
  log('🚀 Starting ShareX AI Functionality Tests', colors.bold);
  log(`🎯 Testing URL: ${CONFIG.baseUrl}`, colors.yellow);
  log('━'.repeat(50), colors.yellow);

  for (const [testName, testFn] of Object.entries(tests)) {
    await runTest(testName, testFn);
  }

  // 测试结果汇总
  log('━'.repeat(50), colors.yellow);
  log('📊 Test Results Summary:', colors.bold);
  log(`✅ Passed: ${testResults.passed}`, colors.green);
  log(`❌ Failed: ${testResults.failed}`, colors.red);
  log(`📈 Success Rate: ${Math.round((testResults.passed / (testResults.passed + testResults.failed)) * 100)}%`, colors.blue);

  // 详细结果
  if (testResults.failed > 0) {
    log('\n❌ Failed Tests:', colors.red);
    testResults.tests
      .filter(test => !test.passed)
      .forEach(test => {
        log(`  • ${test.name}${test.error ? ` (${test.error})` : ''}`, colors.red);
      });
  }

  log('━'.repeat(50), colors.yellow);
  
  if (testResults.failed === 0) {
    log('🎉 All tests passed! Your ShareX AI deployment looks good!', colors.green);
    process.exit(0);
  } else {
    log('⚠️  Some tests failed. Please check the issues above.', colors.yellow);
    process.exit(1);
  }
}

// 使用说明
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  log('ShareX AI Functionality Test Script', colors.bold);
  log('Usage: node test-functionality.js [URL]', colors.blue);
  log('');
  log('Examples:');
  log('  node test-functionality.js                           # Test localhost:3000');
  log('  node test-functionality.js http://localhost:3000     # Test specific local URL');
  log('  node test-functionality.js https://your-app.vercel.app # Test production URL');
  log('');
  log('Options:');
  log('  -h, --help    Show this help message');
  process.exit(0);
}

// 运行测试
if (require.main === module) {
  runAllTests().catch(error => {
    log(`💥 Test runner error: ${error.message}`, colors.red);
    process.exit(1);
  });
}

module.exports = { runAllTests, makeRequest };