import { ethers } from 'ethers';

// 使用公共RPC端点连接到Sepolia
const provider = new ethers.JsonRpcProvider('https://sepolia.infura.io/v3/');

// 合约地址和ABI
const contractAddress = '0x90DD935d005781Fd7B20DE72dD04b9c1EB54E117';

// 简化的ABI用于测试
const testABI = [
  "function paperCount() external view returns (uint256)",
  "function owner() external view returns (address)",
  "function registerReviewer(string memory expertise) external"
];

async function testContract() {
  console.log('Testing contract at:', contractAddress);
  
  try {
    // 创建合约实例
    const contract = new ethers.Contract(contractAddress, testABI, provider);
    
    // 测试 paperCount 函数
    try {
      const paperCount = await contract.paperCount();
      console.log('✓ paperCount() works:', paperCount.toString());
    } catch (error) {
      console.log('✗ paperCount() failed:', error.message);
    }
    
    // 测试 owner 函数
    try {
      const owner = await contract.owner();
      console.log('✓ owner() works:', owner);
    } catch (error) {
      console.log('✗ owner() failed:', error.message);
    }
    
    // 检查合约代码
    const code = await provider.getCode(contractAddress);
    if (code === '0x') {
      console.log('✗ No contract code found at this address!');
    } else {
      console.log('✓ Contract code exists, length:', code.length);
    }
    
  } catch (error) {
    console.error('Contract test failed:', error);
  }
}

testContract();