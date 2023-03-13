const database = firebase.database();

function displayTokenCount() {
  // Get UID from Firebase Authentication
  const user = firebase.auth().currentUser;
  if (!user) {
    return;
  }
  const uid = user.uid;

  const tokenRef = database.ref("users/" + uid + "/token");
  tokenRef.on("value", function (snapshot) {
    const tokenCount = snapshot.val() || 0;
    const countElement = document.querySelector("#tokenDisplay .count");
    countElement.textContent = tokenCount;
  });
}


////////////////////////////////////////////////////////////////TIMER

let startTime, elapsedTime, timerInterval;

const form = document.querySelector('#tokenForm');
const timer = document.querySelector('#timer');

// Extract the wallet parameter from the URL
const params = new URLSearchParams(window.location.search);
const walletParam = params.has("wallet") ? params.get("wallet") : null;
const emailParam = params.has("email") ? params.get("email") : null;

let tokenCount = 0.0;
let tokenCountElement = document.getElementById('tokenCount');

function updateTimer() {
  // Get the elapsed time
  elapsedTime = Date.now() - startTime;

  // Format the time into hours, minutes, and seconds
  let hours = Math.floor(elapsedTime / 3600000);
  let minutes = Math.floor((elapsedTime % 3600000) / 60000);
  let seconds = Math.floor((elapsedTime % 60000) / 1000);

  // Add leading zeros to minutes and seconds if necessary
  if (minutes < 10) {
    minutes = '0' + minutes;
  }
  if (seconds < 10) {
    seconds = '0' + seconds;
  }

  // Update the timer display
  timer.textContent = `${hours}:${minutes}:${seconds}`;

  // Check if a minute has passed and add 0.5 token if so
  if (elapsedTime >= 6000) {

    // Update the token count in the Firebase database
    const wallet = walletParam; // Use the wallet parameter from the URL
    const email = emailParam; // Use the email parameter from the URL

    if (wallet !== null && email !== null) {
      const walletRef = database.ref(`users/${wallet}`);

      // Create the wallet section if it doesn't exist yet
      walletRef.once('value', function(snapshot) {
        if (!snapshot.exists()) {
          walletRef.set({ token: 0, email: email });
          console.log(wallet); // log the wallet value to the console
        } else {
          // Retrieve the current token count and update it
          const currentTokenCount = snapshot.child('token').val();
          const newTokenCount = (currentTokenCount === null || currentTokenCount === undefined) ? 1 : currentTokenCount + 0.5;
          walletRef.update({ token: newTokenCount });
          console.log(wallet); // log the wallet value to the console
        }
      });
    }

    // Reset the start time
    startTime += 6000;
  }

  // Update the token count element in the HTML
  displayTokenCount();
}


////////////////////////////////////////////////////////////////TIMEREND

function isValidCryptoAddress(address) {
  // Regular expression that matches Bitcoin, Ethereum, and other cryptocurrency addresses
  const cryptoAddressRegex = /^([13][a-km-zA-HJ-NP-Z1-9]{25,34}|0x[a-fA-F0-9]{40}|0x[a-fA-F0-9]{42})$/;
  return cryptoAddressRegex.test(address);
}


function submitHandler(event) {
  event.preventDefault();

  // Get user's wallet and email input values
  const emailInput = document.querySelector("#email");
  const walletInput = document.querySelector("#wallet");
  const email = emailInput.value;
  const wallet = walletInput.value;

if (!isValidCryptoAddress(wallet)) {
  // Wallet address is not valid, show error message and prevent form submission
  alert("Invalid cryptocurrency address!");
  return;
}

  
  // Return if either email or wallet is empty
  if (email === "" || wallet === "") {
    return;
  }

  // Check if email and wallet parameters exist
  const urlParams = new URLSearchParams(window.location.search);
  const urlEmail = urlParams.get("email");
  const urlWallet = urlParams.get("wallet");

  // Show confirmation window if email and wallet were previously set
  if (urlEmail && urlWallet) {
    const confirmation = confirm("Are you sure you want to update your email and wallet?");
    if (!confirmation) {
      // Clear input fields and return
      emailInput.value = "";
      walletInput.value = "";
      return;
    }
  }

  // Add email and wallet to URL
  urlParams.set("wallet", wallet);
  urlParams.set("email", email);

  window.history.replaceState({}, "", "?" + urlParams.toString());

  // Get anonymous user id
  let userId;
  firebase.auth().signInAnonymously()
    .then((userCredential) => {
      userId = userCredential.user.uid;
      const emailRef = database.ref(`users/${userId}`);
      emailRef.once("value", (snapshot) => {
        const data = snapshot.val();
        if (data && data.email === email && data.wallet === wallet) {
          // User already exists, don't add any tokens
          console.log("Existing user signed in, data exists in database already!");
        } else {
          // New user or update user, add 0 tokens
          emailRef.set({
            email: email,
            wallet: wallet,
            token: 0,
          });
          console.log("User signed up or data updated in database successfully!");
        }
      });
      // Clear input fields
      emailInput.value = "";
      walletInput.value = "";
    })
    .catch((error) => {
      // Handle authentication error
      console.log("Authentication failed:", error.message);
    });
}



const submitBtn = document.querySelector('#tokenForm input[type="submit"]');
submitBtn.addEventListener('click', submitHandler);
