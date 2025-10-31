import { ethers } from "hardhat";

async function main() {
  console.log("Deploying Academic Review System...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  // Deploy AcademicReviewSystem
  console.log("\n--- Deploying AcademicReviewSystem ---");
  const AcademicReviewSystem = await ethers.getContractFactory("AcademicReviewSystem");
  const testContract = await AcademicReviewSystem.deploy();
  await testContract.waitForDeployment();
  
  const testContractAddress = await testContract.getAddress();
  console.log("AcademicReviewSystem deployed to:", testContractAddress);

  // Test the contract
  try {
    const paperCount = await testContract.paperCount();
    console.log("✓ Contract initialized, paper count:", paperCount.toString());
    
    const owner = await testContract.owner();
    console.log("✓ Contract owner:", owner);
  } catch (error) {
    console.log("✗ Contract test failed:", error.message);
  }

  console.log("\n=== DEPLOYMENT SUMMARY ===");
  console.log("AcademicReviewSystem Address:", testContractAddress);
  
  console.log("\n=== UPDATE FRONTEND CONFIG ===");
  console.log("Update the following addresses in frontend/src/App.js:");
  console.log(`const ACADEMIC_REVIEW_ADDRESS = "${testContractAddress}";`);

  return { testContractAddress };
}

main()
  .then((info) => {
    console.log("\n✅ Academic Review System deployment completed!");
    console.log("New contract address:", info.testContractAddress);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });