var SampleToken = artifacts.require("StarNotary");

module.exports = function(deployer) {
  deployer.deploy(SampleToken, "DeveshV56Token", "DVT", 18, 1000);
};