const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying Academic Peer Review System to Sepolia...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  // Deploy FHECore contract first
  console.log("\n--- Deploying FHECore Contract ---");
  const FHECore = await ethers.getContractFactory("FHECore");
  const fheCore = await FHECore.deploy();
  await fheCore.waitForDeployment();
  
  const fheCoreAddress = await fheCore.getAddress();
  console.log("FHECore deployed to:", fheCoreAddress);

  // Deploy AcademicPeerReview contract (simplified - no constructor parameters)
  console.log("\n--- Deploying AcademicPeerReview Contract ---");
  const AcademicPeerReview = await ethers.getContractFactory("AcademicPeerReview");
  const academicReview = await AcademicPeerReview.deploy();
  await academicReview.waitForDeployment();
  
  const academicReviewAddress = await academicReview.getAddress();
  console.log("AcademicPeerReview deployed to:", academicReviewAddress);

  // Verify deployment
  console.log("\n--- Verifying Deployment ---");
  
  // Test FHECore
  const testValue = 100;
  const testPubKey = ethers.keccak256(ethers.toUtf8Bytes("test_key"));
  
  try {
    const encryptTx = await fheCore.encryptValue(testValue, testPubKey);
    await encryptTx.wait();
    console.log("✓ FHECore encryption test successful");
  } catch (error) {
    console.log("✗ FHECore encryption test failed:", error.message);
  }

  // Test AcademicPeerReview
  try {
    const paperCount = await academicReview.paperCount();
    console.log("✓ AcademicPeerReview initialized, paper count:", paperCount.toString());
  } catch (error) {
    console.log("✗ AcademicPeerReview test failed:", error.message);
  }

  // Display contract addresses for frontend
  console.log("\n=== DEPLOYMENT SUMMARY ===");
  console.log("Network: Sepolia Testnet");
  console.log("Deployer:", deployer.address);
  console.log("FHECore Address:", fheCoreAddress);
  console.log("AcademicPeerReview Address:", academicReviewAddress);
  
  console.log("\n=== UPDATE FRONTEND CONFIG ===");
  console.log("Update the following addresses in frontend/src/App.js:");
  console.log(`const ACADEMIC_REVIEW_ADDRESS = "${academicReviewAddress}";`);
  console.log(`const FHE_CORE_ADDRESS = "${fheCoreAddress}";`);

  // Save deployment info
  const deploymentInfo = {
    network: "sepolia",
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      FHECore: fheCoreAddress,
      AcademicPeerReview: academicReviewAddress
    }
  };

  console.log("\n=== ETHERSCAN VERIFICATION ===");
  console.log("To verify contracts on Etherscan, run:");
  console.log(`npx hardhat verify --network sepolia ${fheCoreAddress}`);
  console.log(`npx hardhat verify --network sepolia ${academicReviewAddress} ${fheCoreAddress}`);

  return deploymentInfo;
}

main()
  .then((info) => {
    console.log("\n✅ Deployment completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });