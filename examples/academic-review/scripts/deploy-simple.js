const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying Simple Academic Peer Review System...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  // Deploy SimpleAcademicReview contract
  console.log("\n--- Deploying SimpleAcademicReview Contract ---");
  const SimpleAcademicReview = await ethers.getContractFactory("SimpleAcademicReview");
  const academicReview = await SimpleAcademicReview.deploy();
  await academicReview.waitForDeployment();
  
  const academicReviewAddress = await academicReview.getAddress();
  console.log("SimpleAcademicReview deployed to:", academicReviewAddress);

  // Test the contract
  try {
    const paperCount = await academicReview.paperCount();
    console.log("✓ Contract initialized, paper count:", paperCount.toString());
  } catch (error) {
    console.log("✗ Contract test failed:", error.message);
  }

  console.log("\n=== DEPLOYMENT SUMMARY ===");
  console.log("Network: Current Network");
  console.log("Deployer:", deployer.address);
  console.log("SimpleAcademicReview Address:", academicReviewAddress);
  
  console.log("\n=== UPDATE FRONTEND CONFIG ===");
  console.log("Update the following addresses in frontend/src/App.js:");
  console.log(`const ACADEMIC_REVIEW_ADDRESS = "${academicReviewAddress}";`);
  console.log(`const FHE_CORE_ADDRESS = "${academicReviewAddress}";`);

  return { academicReviewAddress };
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