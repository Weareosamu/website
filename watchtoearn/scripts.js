const database = firebase.database();

function updateSubmitButtonText() {
  // Get the value of the "wallet" parameter from the URL
  const urlParams = new URLSearchParams(window.location.search);
  const wallet = urlParams.get("wallet");

  // Find the form element
  const form = document.getElementById("my-form");

  // Find the submit button element
  const submitButton = form.querySelector('input[type="submit"]');

  // If the "wallet" parameter is present in the URL, change the text of the button to "Submit Change" and add a "Log Out" button
  if (wallet) {
    submitButton.value = "Submit Change";

    // Check if the "Log Out" button already exists
    const logoutButton = form.querySelector('button.button-logout');
    if (!logoutButton) {
      // Create a new "Log Out" button element
      const logoutButton = document.createElement("button");
      logoutButton.innerText = "Log Out";
      logoutButton.classList.add("button");
      logoutButton.addEventListener("click", function() {
        // Remove the "wallet" parameter from the URL and reload the page
        const url = new URL(window.location.href);
        url.searchParams.delete("wallet");
        window.location.href = url.toString();
      });

      // Insert the "Log Out" button after the submit button
      submitButton.parentNode.insertBefore(logoutButton, submitButton.nextSibling);
    }
  }
}



function startTimer() {
  const timerElement = document.querySelector("#timer");
  let seconds = 0;
  let minutes = 0;
  let hours = 0;

  // Update the timer element with the current time
  function updateTimer() {
    seconds++;
    if (seconds >= 60) {
      seconds = 0;
      minutes++;
      if (minutes >= 60) {
        minutes = 0;
        hours++;
      }
    }
    timerElement.textContent = `${padNumber(hours)}:${padNumber(minutes)}:${padNumber(seconds)}`;
  }

  // Pad a number with leading zeros if it is less than 10
  function padNumber(number) {
    return number < 10 ? `0${number}` : number;
  }

  // Start the timer and update the timer element every second
  const timerInterval = setInterval(updateTimer, 1000);

  // Return a function that stops the timer when called
  return function stopTimer() {
    clearInterval(timerInterval);
  }
}
// Define the displayTokenCount function
function displayTokenCount() {
  // Get the user ID from the Firebase Authentication object
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

function calculateTokens() {
  const timer = document.getElementById("timer"); // Get the timer element
  const tokenCount = document.getElementById("tokenCount"); // Get the tokenCount element
  const time = timer.innerText.split(":"); // Split the time into an array of hours, minutes, and seconds
  const minutes = parseInt(time[1]); // Get the number of minutes
  const tokensEarned = minutes / 2; // Calculate the number of tokens earned
  const formattedTokens = tokensEarned.toFixed(2); // Format the number of tokens as a string with 2 decimal places
  tokenCount.innerText = formattedTokens.toString(); // Update the tokenCount element with the number of tokens earned
}
////////////////////////////////////////////////////////////////TIMER
function addTokens() {
  const user = firebase.auth().currentUser;
  if (!user) {
    return;
  }

  const uid = user.uid;
  const tokenRef = database.ref("users/" + uid + "/token");

  tokenRef.transaction(function(currentTokenCount) {
    const newTokenCount = (currentTokenCount || 0) + 0.5;
    console.log(`Updating token count to ${newTokenCount} at ${new Date().toLocaleString()}`);
    return newTokenCount;
  });
  
  calculateTokens();
}



////////////////////////////////////////////////////////////////TIMEREND


function isValidCryptoAddress(address) {
  // Regular expression that matches Bitcoin, Ethereum, and other cryptocurrency addresses
  const cryptoAddressRegex = /^([13][a-km-zA-HJ-NP-Z1-9]{25,34}|0x[a-fA-F0-9]{40}|0x[a-fA-F0-9]{42})$/;
  return cryptoAddressRegex.test(address);
}


function submitHandler(event) {
  event.preventDefault();


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
    const confirmation = confirm("Are you sure you want to update your email and wallet? WARNING! If you update it you lose all the tokens you earned before!");
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
  
  // Example usage:
const stopTimer = startTimer();
//setTimeout(stopTimer, 10000); // Stop the timer after 10 seconds
     // Call the displayTokenCount function every 1 minute
updateSubmitButtonText();
setInterval(displayTokenCount, 1000);
setInterval(addTokens, 60000); 
}

 const form = document.querySelector("#my-form");
  form.addEventListener("submit", submitHandler);



