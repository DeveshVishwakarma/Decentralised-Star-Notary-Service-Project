const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

it('can Create a Star', async() => {
    let tokenId = 1;
    let instance = await StarNotary.deployed();
    await instance.createStar('Awesome Star!', tokenId, {from: accounts[0]})
    assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!')
});

it('lets user1 put up their star for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, {from: user2, value: balance});
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 4;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance});
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance, gasPrice:0});
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
    assert.equal(value, starPrice);
});

// Implement Task 2 Add supporting unit tests

it('can add the star name and star symbol properly', async() => {
    //1. Create a star
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starId = 6;
    await instance.createStar('Mystar', starId, {from: user1});

    //2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
    let ContractName = await instance.name();
    let ContractSymbol = await instance.symbol();
    let starLookUp = await instance.lookUptokenIdToStarInfo(starId);

    assert.equal(ContractName,'StarToken');
    assert.equal(ContractSymbol,'SRT');
    assert.equal(starLookUp,'Mystar');
});

it('lets 2 users exchange stars', async() => {
    let instance = await StarNotary.deployed();
    let Alice = accounts[0];
    let Bob = accounts[1];
    let starId = 7;
    let starId2 = 8;

    // 1. Create 2 Stars
    await instance.createStar('TheDstar',starId, {from: Alice});
    await instance.createStar('TheVstar',starId2, {from: Bob});
    // 2. Call the exchangeStars functions implemented in the Smart Contract
    await instance.exchangeStars(starId,starId2);
    let star1 = await instance.ownerOf.call(starId);
    let star2 = await instance.ownerOf.call(starId2);
    // 3. Verify that the owners changed
    assert.equal(star1,Bob);
    assert.equal(star2,Alice);
});

it('lets a user transfer a star', async() => {
    let instance = await StarNotary.deployed();
    let Alice = accounts[0];
    let Bob = accounts[1];
    let starId = 9;
    // 1. create a Star
    await instance.createStar('TheDstar',starId, {from: Alice});
    // 2. use the transferStar function implemented in the Smart Contract
    await instance.transferStar(Bob,starId);
    // 3. Verify the star owner changed.
    let stars = await instance.ownerOf.call(starId);
    assert.equal(stars,Bob);
});