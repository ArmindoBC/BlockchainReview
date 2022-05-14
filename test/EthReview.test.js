const Token = artifacts.require('Token')
const EthReview = artifacts.require('EthReview')

require('chai')
  .use(require('chai-as-promised'))
  .should()

function tokens(n) {
  return web3.utils.toWei(n, 'ether');
}


contract('EthReview', ([deployer, investor]) => {
  let token, ethReview

  before(async () => {
    token = await Token.new()
    ethReview = await EthReview.new(token.address)
    // Transfer all tokens to EthSwap (1 million)
    await token.transfer(ethReview.address, tokens('1000000'))
  })

  describe('Token deployment', async () => {
    it('contract has a name', async () => {
      const name = await token.name()
      assert.equal(name, 'DApp Token')
    })
  })

  describe('EthReview deployment', async () => {
    it('contract has a name', async () => {
      const name = await ethReview.name()
      assert.equal(name, 'EthReview Instant Exchange')
    })

    it('contract has tokens', async () => {
      let balance = await token.balanceOf(ethReview.address)
      assert.equal(balance.toString(), tokens('1000000'))
    })
  })

  describe('buyTokens()', async () => {
    let result

    before(async () => {
      // Purchase tokens before each example
      result = await ethReview.buyTokens({ from: investor, value: web3.utils.toWei('1', 'ether')})
    })

    it('Allows user to instantly purchase tokens from ethSwap for a fixed price', async () => {
      // Check investor token balance after purchase
      let investorBalance = await token.balanceOf(investor)
      assert.equal(investorBalance.toString(), tokens('100'))

      // Check ethSwap balance after purchase
      let ethReviewBalance
      ethReviewBalance = await token.balanceOf(ethReview.address)
      assert.equal(ethReviewBalance.toString(), tokens('999900'))
      ethReviewBalance = await web3.eth.getBalance(ethReview.address)
      assert.equal(ethReviewBalance.toString(), web3.utils.toWei('1', 'Ether'))

      // Check logs to ensure event was emitted with correct data
      const event = result.logs[0].args
      assert.equal(event.account, investor)
      assert.equal(event.token, token.address)
      assert.equal(event.amount.toString(), tokens('100').toString())
      assert.equal(event.rate.toString(), '100')
    })
  })



  describe('sellTokens()', async () => {
    let result

    before(async () => {
      // Investor must approve tokens before the purchase
      await token.approve(ethReview.address, tokens('100'), { from: investor })
      // Investor sells tokens
      result = await ethReview.sellTokens(tokens('100'), { from: investor })
    })

    it('Allows user to instantly sell tokens to ethSwap for a fixed price', async () => {
      // Check investor token balance after purchase
      let investorBalance = await token.balanceOf(investor)
      assert.equal(investorBalance.toString(), tokens('0'))

      // Check ethSwap balance after purchase
      let ethReviewBalance
      ethReviewBalance = await token.balanceOf(ethReview.address)
      assert.equal(ethReviewBalance.toString(), tokens('1000000'))
      ethReviewBalance = await web3.eth.getBalance(ethReview.address)
      assert.equal(ethReviewBalance.toString(), web3.utils.toWei('0', 'Ether'))

      // Check logs to ensure event was emitted with correct data
      const event = result.logs[0].args
      assert.equal(event.account, investor)
      assert.equal(event.token, token.address)
      assert.equal(event.amount.toString(), tokens('100').toString())
      assert.equal(event.rate.toString(), '100')

      // FAILURE: investor can't sell more tokens than they have
      await ethReview.sellTokens(tokens('500'), { from: investor }).should.be.rejected;
    })
  })

  // describe('addReview()', async () => {
  //   let result
  //
  //   before(async () => {
  //     // Purchase tokens before each example
  //     result = await ethReview.addReview("some nice review", 1, {from: investor})
  //   })
  //
  //   it('Allows user to instantly add a review', async () => {
  //
  //
  //     // Check investor token balance after purchase
  //     let investorBalance = await token.balanceOf(investor)
  //     assert.equal(investorBalance.toString(), tokens('1'))
  //
  //     // Check ethSwap balance after purchase
  //     let ethReviewBalance
  //     ethReviewBalance = await token.balanceOf(ethReview.address)
  //     assert.equal(ethReviewBalance.toString(), tokens('999999'))
  //
  //     // Check logs to ensure event was emitted with correct data
  //     const event = result.logs[0].args
  //     assert.equal(event.account, investor)
  //     assert.equal(event.token, token.address)
  //     assert.equal(event.amount.toString(), tokens('1').toString())
  //     assert.equal(event.content.toString(),"some nice review")
  //     assert.equal(event.restaurantId.toString(),"1")
  //
  //
  //   })
  // })

})
