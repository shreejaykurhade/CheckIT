const hre = require("hardhat");

async function main() {
    console.log("Deploying Truth DAO contracts...");

    // Deploy Truth Token
    const TruthToken = await hre.ethers.getContractFactory("TruthToken");
    const truthToken = await TruthToken.deploy();
    await truthToken.waitForDeployment();
    const truthTokenAddress = await truthToken.getAddress();
    console.log(`Truth Token deployed to: ${truthTokenAddress}`);

    // Deploy Truth DAO
    const TruthDAO = await hre.ethers.getContractFactory("TruthDAO");
    const truthDAO = await TruthDAO.deploy(truthTokenAddress);
    await truthDAO.waitForDeployment();
    const truthDAOAddress = await truthDAO.getAddress();
    console.log(`Truth DAO deployed to: ${truthDAOAddress}`);

    // Transfer tokens to DAO for rewards
    const rewardAmount = hre.ethers.parseEther("100000"); // 100k tokens for rewards
    await truthToken.transfer(truthDAOAddress, rewardAmount);
    console.log(`Transferred ${hre.ethers.formatEther(rewardAmount)} TRUTH tokens to DAO`);

    // Get signers for demo
    const [owner, voter1, voter2, voter3] = await hre.ethers.getSigners();

    // Distribute tokens to voters (for testing)
    const voterAmount = hre.ethers.parseEther("1000"); // 1000 tokens each
    await truthToken.transfer(voter1.address, voterAmount);
    await truthToken.transfer(voter2.address, voterAmount);
    await truthToken.transfer(voter3.address, voterAmount);
    console.log("Distributed tokens to test voters");

    console.log("\n=== Deployment Summary ===");
    console.log(`Truth Token: ${truthTokenAddress}`);
    console.log(`Truth DAO: ${truthDAOAddress}`);
    console.log(`\nSave these addresses to your backend/.env:`);
    console.log(`TRUTH_TOKEN_ADDRESS=${truthTokenAddress}`);
    console.log(`TRUTH_DAO_ADDRESS=${truthDAOAddress}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
