pragma solidity ^0.5.0;

import "./Token.sol";

contract EthReview {
  string public name = "EthReview Instant Exchange";
  Token public token;
  uint public rate = 100;
  uint public reviewId = 0;
  uint public restaurantId = 0;
  uint public tokenAmountReview = 1;

  struct Review {
    uint id;
    uint restaurantId;
    string content;
    address account;
  }

  struct Restaurant{
    uint id;
    string name;
    string street;
  }

  mapping(uint => Review) public reviews;
  mapping(uint => Restaurant) public restaurants;


  event TokensPurchased(
    address account,
    address token,
    uint amount,
    uint rate
  );

  event TokensSold(
    address account,
    address token,
    uint amount,
    uint rate
  );

  event ReviewAdded(
    address account,
    address token,
    uint amount,
    uint restaurantId,
    uint reviewId,
    string  content
    );

  event RestaurantAdded(
    uint restaurantId,
    string name,
    string street
  );

  constructor(Token _token) public {
    token = _token;
  }

  function addReview(string memory _content, uint _restaurantId) public payable{
      uint tokenAmount = tokenAmountReview * 1000000000000000000;
      reviewId++;
      reviews[reviewId] = Review(reviewId, _restaurantId, _content, msg.sender);

      // Require that EthReview has enough tokens
    require(token.balanceOf(address(this)) >= tokenAmount);

    // Transfer tokens to the user
    token.transfer(msg.sender, tokenAmount);

    //emit an event
    emit ReviewAdded(msg.sender, address(token), tokenAmount, _restaurantId, reviewId, _content);
  }

  function addRestaurant(string memory _name, string memory _street) public{
    restaurantId++;
    restaurants[restaurantId] = Restaurant(restaurantId, _name, _street);
    emit RestaurantAdded(restaurantId, _name, _street);
  }

  function buyTokens() public payable {
    // Calculate the number of tokens to buy
    uint tokenAmount = msg.value * rate;

    // Require that EthSwap has enough tokens
    require(token.balanceOf(address(this)) >= tokenAmount);

    // Transfer tokens to the user
    token.transfer(msg.sender, tokenAmount);

    // Emit an event
    emit TokensPurchased(msg.sender, address(token), tokenAmount, rate);
  }

  function sellTokens(uint _amount) public {
    // User can't sell more tokens than they have
    require(token.balanceOf(msg.sender) >= _amount);

    // Calculate the amount of Ether to redeem
    uint etherAmount = _amount / rate;

    // Require that EthSwap has enough Ether
    require(address(this).balance >= etherAmount);

    // Perform sale
    token.transferFrom(msg.sender, address(this), _amount);
    msg.sender.transfer(etherAmount);

    // Emit an event
    emit TokensSold(msg.sender, address(token), _amount, rate);
  }

}
