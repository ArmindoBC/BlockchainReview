const Token = artifacts.require("Token");
const EthReview = artifacts.require("EthReview");

module.exports = async function(deployer) {
  // Deploy Token
  await deployer.deploy(Token);
  const token = await Token.deployed()

  // Deploy EthSwap
  await deployer.deploy(EthReview, token.address);
  const ethReview = await EthReview.deployed()

  // Transfer all tokens to EthSwap (1 million)
  await token.transfer(ethReview.address, '1000000000000000000000000')
  console.log(ethReview.address);
};
