import {
  ethers
} from "https://cdn.ethers.io/lib/ethers-5.2.esm.min.js";


var App = {
  reviews: {},
  tokens: {},
  account: 0,
  signer: {},
  provider: {},
  load: async () => {
    await App.loadButton();
    await App.setUpListerners();
  },
  loadAccount: async () => {
    const showAccount = document.getElementById('account');
    App.provider = new ethers.providers.Web3Provider(window.ethereum);
    await App.provider.send("eth_requestAccounts", []);
    App.signer = App.provider.getSigner();
    showAccount.innerHTML = await App.signer.getAddress();
    const signerAddress = await App.signer.getAddress();

    App.loadContract();

  },
  loadButton: async () => {
    const ethereumButton = document.querySelector('.enableEthereumButton');

    ethereumButton.addEventListener('click', () => {
      App.loadAccount();
      if (App.signer != undefined) {
        ethereumButton.style.display = "none"
      }
    });

  },
  setUpListerners: async () => {
    let addReviewForm = document.getElementById("add-review-form");
    addReviewForm.addEventListener('submit', () => {
      App.addReview();
    });
    let addRestaurantForm = document.getElementById("add-restaurant-form");
    addRestaurantForm.addEventListener('submit', () => {
      App.addRestaurant();
    });
  },
  loadContract: async () => {

    if (App.signer != undefined) {

      const Token = await $.getJSON('Token.json');
      const EthReview = await $.getJSON('EthReview.json');

      const smartContractAddress = Token.networks['5777'].address;
      const smartContractAddress_review = EthReview.networks['5777'].address;
      App.tokens = new ethers.Contract(smartContractAddress, Token.abi, App.signer);
      App.reviews = new ethers.Contract(smartContractAddress_review, EthReview.abi, App.signer);
      App.render();
    }
  },

  render: async () => {
    document.getElementById("success-added").innerHTML = "";
    document.getElementById("restaurant-added").innerHTML = "";

    let select = document.getElementById('restaurant_select');
    const table_restaraunts = document.getElementById("table-restaurants");
    const restaurantsCounter = await App.reviews.restaurantId();

    for (let i = 1; i <= restaurantsCounter; i++) {
      let opt = document.createElement('option');
      const restaurant = await App.reviews.restaurants(i);
      opt.value = restaurant.id;
      opt.innerHTML = restaurant.name;
      select.appendChild(opt);

      var row = table_restaraunts.insertRow(1);
      var cell1 = row.insertCell(0);
      var cell2 = row.insertCell(1);
      var cell3 = row.insertCell(2);

      cell1.innerHTML = restaurant.id;
      cell2.innerHTML = restaurant.name;
      cell3.innerHTML = restaurant.street;

    }

    const reviewsCounter = await App.reviews.reviewId();

    const tables = document.getElementById("tables");
    const addReviewForm = document.getElementById("addInfoBlockchain");
    tables.style.display = "block";
    addReviewForm.style.display = "block";
    const table = document.getElementById("table");


    for (let i = 1; i <= reviewsCounter; i++) {

      var row = table.insertRow(1);
      var cell1 = row.insertCell(0);
      var cell2 = row.insertCell(1);
      var cell3 = row.insertCell(2);

      let review = await App.reviews.reviews(i);

      cell1.innerHTML = review.content;
      cell2.innerHTML = review.account;
      cell3.innerHTML = review.restaurantId;

    }

    let signerAddress = await App.signer.getAddress();
    document.getElementById("token-balance").innerHTML = ethers.utils.formatEther(await App.tokens.balanceOf(signerAddress));
    document.getElementById("wallet-balance").innerHTML = ethers.utils.formatEther(await App.provider.getBalance(signerAddress));
    document.getElementById("user-address").innerHTML = signerAddress;


  },
  addReview: async () => {
    const content = document.getElementById("content_text").value;
    const restaurantId = document.getElementById("restaurant_select").value;

    if (content != undefined && restaurantId != undefined) {
      const deployed_ethreview = await App.reviews.addReview(content, restaurantId);
    }

    App.reviews.on("ReviewAdded", (to, token, amount, restaurantId, reviewId, content) => {
      let success_alert = document.getElementById("success-added");
      success_alert.innerHTML = "Your review was added. Review Number: " + reviewId.toNumber() + " | Review Content: " + content + " | Amount Gained: " + ethers.utils.formatEther(amount);
    });
  },
  addRestaurant: async () => {
    const name = document.getElementById("restaurant_name_input").value;
    const address = document.getElementById("restaurant_street_input").value;

    if (name != undefined && address != undefined) {
      const deployed_ethreview = await App.reviews.addRestaurant(name, address);
    }

    App.reviews.on("RestaurantAdded", (id, name, street) => {

      let success_alert = document.getElementById("restaurant-added");
      success_alert.innerHTML = "Your restaurant was added. Restaurant Id: " + id.toNumber() + " | Restaurant Name: " + name + " | Restaurant Address: " + name;
    });
  },
  renderTasks: async () => {
    // Load the total task count from the blockchain
    // //console.log(App.account);
    // const totalSupply = await App.tokens.totalSupply();
    // const allowance = await App.tokens.allowance("0x45F51593B05c78638B631C67a35c25F41e41851D");

    // Render out each task with a new task template
    // App.tokens.forEach((token) =>{
    //
    //   console.log(token);
    // })
  },

  createTask: async () => {
    // App.setLoading(true)
    const content = $('#newTask').val();

    await App.todoList.createtTask(content, {
      from: App.account
    });
    window.location.reload()
  },

  toggleCompleted: async (e) => {
    // App.setLoading(true)
    const taskId = e.target.name
    await App.todoList.toggleCompleted(taskId, {
      from: App.account
    })
    window.location.reload()
  },

  setLoading: (boolean) => {
    App.loading = boolean
    const loader = $('#loader')
    const content = $('#content')
    if (boolean) {
      loader.show()
      content.hide()
    } else {
      loader.hide()
      content.show()
    }
  }
}

$(() => {
  $(window).load(() => {
    App.load();

  })
})
