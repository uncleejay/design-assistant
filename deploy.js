#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Figma Design Critique Plugin - Deployment Helper\n');

// Check if we're in the right directory
if (!fs.existsSync('manifest.json')) {
  console.error('❌ Error: This script must be run from the plugin root directory');
  console.error('   Please run: cd figma-design-critique-plugin && node deploy.js');
  process.exit(1);
}

// Function to update URLs in files
function updateUrls(newUrl) {
  console.log(`📝 Updating plugin URLs to: ${newUrl}`);
  
  // Update code.js
  const codePath = './code.js';
  let codeContent = fs.readFileSync(codePath, 'utf8');
  codeContent = codeContent.replace(
    /BASE_URL: 'https:\/\/[^']*'/,
    `BASE_URL: '${newUrl}'`
  );
  fs.writeFileSync(codePath, codeContent);
  console.log('   ✅ Updated code.js');
  
  // Update ui.html
  const uiPath = './ui.html';
  let uiContent = fs.readFileSync(uiPath, 'utf8');
  uiContent = uiContent.replace(
    /fetch\('https:\/\/[^']*\/api\/critique'/g,
    `fetch('${newUrl}/api/critique'`
  );
  fs.writeFileSync(uiPath, uiContent);
  console.log('   ✅ Updated ui.html');
  
  // Update manifest.json
  const manifestPath = './manifest.json';
  let manifestContent = fs.readFileSync(manifestPath, 'utf8');
  const manifestData = JSON.parse(manifestContent);
  manifestData.networkAccess.allowedDomains = [newUrl];
  fs.writeFileSync(manifestPath, JSON.stringify(manifestData, null, 2));
  console.log('   ✅ Updated manifest.json');
}

// Get command line arguments
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'vercel':
    console.log('🔵 Deploying to Vercel...\n');
    
    // Check if server directory exists
    if (!fs.existsSync('./server')) {
      console.error('❌ Error: server directory not found');
      process.exit(1);
    }
    
    try {
      // Deploy to Vercel
      console.log('📦 Deploying server...');
      process.chdir('./server');
      const output = execSync('vercel --prod', { encoding: 'utf8' });
      console.log(output);
      
      // Extract URL from Vercel output
      const urlMatch = output.match(/https:\/\/[^\s]+/);
      if (urlMatch) {
        const deployedUrl = urlMatch[0];
        console.log(`\n🎉 Deployment successful!`);
        console.log(`📍 URL: ${deployedUrl}`);
        
        // Go back to root directory
        process.chdir('..');
        
        // Update plugin URLs
        updateUrls(deployedUrl);
        
        console.log('\n✨ Plugin updated successfully!');
        console.log('\n🔧 Next steps:');
        console.log('1. Test your plugin in Figma');
        console.log('2. Set your OpenAI API key in Vercel dashboard');
        console.log('3. Monitor usage and adjust rate limits if needed');
        
      } else {
        console.error('❌ Could not extract deployment URL from Vercel output');
      }
      
    } catch (error) {
      console.error('❌ Deployment failed:', error.message);
      process.exit(1);
    }
    break;
    
  case 'update-url':
    const newUrl = args[1];
    if (!newUrl) {
      console.error('❌ Error: Please provide a URL');
      console.error('   Usage: node deploy.js update-url https://your-domain.com');
      process.exit(1);
    }
    
    if (!newUrl.startsWith('http')) {
      console.error('❌ Error: URL must start with http:// or https://');
      process.exit(1);
    }
    
    updateUrls(newUrl);
    console.log('\n✅ URLs updated successfully!');
    break;
    
  case 'test-server':
    const testUrl = args[1] || 'http://localhost:3001';
    console.log(`🧪 Testing server at: ${testUrl}`);
    
    try {
      const testCommand = `curl -s -o /dev/null -w "%{http_code}" ${testUrl}/health`;
      const statusCode = execSync(testCommand, { encoding: 'utf8' }).trim();
      
      if (statusCode === '200') {
        console.log('✅ Server is responding correctly!');
      } else {
        console.log(`⚠️  Server responded with status code: ${statusCode}`);
      }
    } catch (error) {
      console.error('❌ Server test failed:', error.message);
      console.error('   Make sure your server is running');
    }
    break;
    
  default:
    console.log('📖 Usage:');
    console.log('   node deploy.js vercel              # Deploy to Vercel and update URLs');
    console.log('   node deploy.js update-url <URL>    # Update plugin URLs manually');
    console.log('   node deploy.js test-server [URL]   # Test if server is running');
    console.log('\n💡 Examples:');
    console.log('   node deploy.js update-url https://my-app.vercel.app');
    console.log('   node deploy.js test-server https://my-app.vercel.app');
    console.log('\n🔗 For more deployment options, see DEPLOYMENT_GUIDE.md');
}
