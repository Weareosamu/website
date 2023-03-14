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
      logoutButton.classList.add("button-logout");
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



const TIMER_KEY = "my-timer";

function startTimer(callback, interval = 60000) {
  const timerElement = document.querySelector("#timer");

  // Get the previous timer value from localStorage
  let prevTime = parseInt(localStorage.getItem(TIMER_KEY)) || 0;
  let elapsedTime = prevTime;

  let seconds = elapsedTime % 60;
  let minutes = Math.floor(elapsedTime / 60) % 60;
  let hours = Math.floor(elapsedTime / (60 * 60));

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

    // Save the current timer value to localStorage
    let currentTime = hours * 60 * 60 + minutes * 60 + seconds;
    localStorage.setItem(TIMER_KEY, currentTime.toString());
  }

  // Pad a number with leading zeros if it is less than 10
  function padNumber(number) {
    return number < 10 ? `0${number}` : number;
  }

  // Start the timer and update the timer element every second
  let timerInterval = setInterval(updateTimer, 1000);

  // Call the callback function every 'interval' milliseconds
  let callbackInterval = setInterval(callback, interval);

  // Handle visibility changes
  document.addEventListener("visibilitychange", function() {
    if (document.visibilityState === "hidden") {
      // The page is hidden, save the timer state
      clearInterval(timerInterval);
      clearInterval(callbackInterval);
      let currentTime = hours * 60 * 60 + minutes * 60 + seconds;
      localStorage.setItem(TIMER_KEY, currentTime.toString());
    } else {
      // The page is visible again, restore the timer state
      prevTime = parseInt(localStorage.getItem(TIMER_KEY)) || 0;
      elapsedTime = prevTime;
      seconds = elapsedTime % 60;
      minutes = Math.floor(elapsedTime / 60) % 60;
      hours = Math.floor(elapsedTime / (60 * 60));
      timerInterval = setInterval(updateTimer, 1000);
      callbackInterval = setInterval(callback, interval);
    }
  });

  // Return a function that stops the timer and callback intervals when called
  return function stopTimer() {
    clearInterval(timerInterval);
    clearInterval(callbackInterval);
  }
}

function resetTimer() {
  // Clear the localStorage value associated with TIMER_KEY
  localStorage.removeItem(TIMER_KEY);

  // Reset the timer element to its initial value
  const timerElement = document.querySelector("#timer");
  timerElement.textContent = "00:00:00";
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

  const form = document.getElementById('my-form');
  const emailInput = document.querySelector("#email");
  const walletInput = document.querySelector("#wallet");
  const email = emailInput.value;
  const wallet = walletInput.value;
  const submitBtn = document.querySelector('input[type="submit"]');
  
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
      emailInput.style.display = 'none';
      walletInput.style.display = 'none';
      submitBtn.style.display = 'none';
    
    // Get the email and wallet parameters from the URL
const urlParams = new URLSearchParams(window.location.search);
const email = urlParams.get('email');
const wallet = urlParams.get('wallet');

// If email and wallet parameters are present in the URL, display them on the page
if (email && wallet) {
  const emailDisplay = document.createElement('p');
  emailDisplay.textContent = `Email: ${email}`;
  document.body.appendChild(emailDisplay);

  const walletDisplay = document.createElement('p');
  walletDisplay.textContent = `Wallet: ${wallet}`;
  document.body.appendChild(walletDisplay);
}
    
    })
    .catch((error) => {
      // Handle authentication error
      console.log("Authentication failed:", error.message);
    });
  
  // Example usage:
const stopTimer = startTimer();
//setTimeout(stopTimer, 10000); // Stop the timer after 10 seconds
     // Call the displayTokenCount function every 1 minute
  resetTimer();
updateSubmitButtonText();
setInterval(displayTokenCount, 1000);
startTimer(addTokens); 
}

////////////////////////////////////////////////////////////////////////////////// SEND EMAIL

const collectTokensBtn = document.getElementById('collect-tokens-btn');

collectTokensBtn.onclick = function() {
  const urlParams = new URLSearchParams(window.location.search);
  const walletParam = urlParams.get('wallet');

  if (!walletParam) {
    alert('Error: No wallet parameter found in the URL.');
    return;
  }

  const uid = firebase.auth().currentUser.uid;
  const db = firebase.database().ref('users/' + uid);

  db.once('value').then(function(snapshot) {
    const wallet = snapshot.child('wallet').val();
    const lastSubmitDate = snapshot.child('last_submit_date').val();
    const submitCount = snapshot.child('submit_count').val() || 0;
    const maxtokens = snapshot.child('token').val();
    const Emailaddress= snapshot.child('token').val();
    
    if (wallet !== walletParam) {
      alert(`Error: The wallet parameter in the URL does not match your current wallet address (${wallet}).`);
      return;
    }

    if (submitCount >= 5 && isWithin30Days(lastSubmitDate)) {
      alert('Error: You have reached the maximum number of submits (5) in the past 30 days.');
      return;
    }

    const tokenCount = prompt(`Please enter your token count (maximum ${maxtokens}):`);
    if (!tokenCount || tokenCount > maxtokens) {
      return;
    }

    // set API endpoint URL and API key
    const url = 'https://api.web3forms.com/submit';
    const apiKey = 'ac277651-75f6-42dc-aadd-33f4fba88a06';

    // set form data
    const formData = new FormData();
    formData.append('apikey', apiKey);
    formData.append('email', urlParams.get("email"));
    formData.append('wallet', wallet);
    formData.append('token_count', tokenCount);

    // send POST request to API endpoint
    fetch(url, {
      method: 'POST',
      body: formData
    }).then(response => {
      if (response.ok) {
        alert('Token count submitted successfully.');
        const now = Date.now();
        db.update({
          submit_count: submitCount + 1,
          last_submit_date: now,
          token: snapshot.child('token').val() - tokenCount
        });
      } else {
        alert('Error submitting token count.');
      }
    }).catch(error => {
      alert('Error submitting token count.');
      console.error(error);
    });
  }).catch(function(error) {
    alert(`Error: ${error.message}`);
  });
}

function isWithin30Days(date) {
  if (!date) {
    return false;
  }
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
  return date >= thirtyDaysAgo && date <= now;
}

////////////////////////////////////////////////////////////////////////////// SEND EMAIL END

 const form = document.querySelector("#my-form");
  form.addEventListener("submit", submitHandler);
