

var firebaseConfig = {
  apiKey: "AIzaSyAxZqRlbFKnvLXQfDA5H-HdiPBLEjAlbXM",
  authDomain: "watchtoearn-3a2ac.firebaseapp.com",
  databaseURL: "https://watchtoearn-3a2ac-default-rtdb.firebaseio.com",
  projectId: "watchtoearn-3a2ac",
  storageBucket: "watchtoearn-3a2ac.appspot.com",
  messagingSenderId: "1018286487266",
  appId: "1:1018286487266:web:c08335e403ae893bfa10bb",
  measurementId: "G-L809K7DPGK"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
var database = firebase.database();

function displayTokenCount() {
  // Get wallet from URL
  const urlParams = new URLSearchParams(window.location.search);
  const wallet = urlParams.get("wallet");
  if (!wallet) {
    return;
  }

  const tokenRef = database.ref("users/" + wallet + "/token");
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
const walletParam = params.get("wallet");

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
  if (elapsedTime >= 60000) {

    // Update the token count in the Firebase database using transaction()
    const wallet = walletParam; // Use the wallet parameter from the URL
    const tokenRef = database.ref('users/' + wallet + '/token');
    tokenRef.transaction(function(currentTokenCount) {
      if (currentTokenCount === null || currentTokenCount === undefined) {
        return 1;
      } else {
        return currentTokenCount + 0.5;
      }
    });

    // Reset the start time
    startTime += 60000;
  }

  // Update the token count element in the HTML
  displayTokenCount();
}


////////////////////////////////////////////////////////////////TIMEREND


function submitHandler(event) {
  event.preventDefault();

  // Get user's wallet and email input values
  const emailInput = document.querySelector("#email");
  const walletInput = document.querySelector("#wallet");
  const email = emailInput.value;
  const wallet = walletInput.value;

  // Return if either email or wallet is empty
  if (email === "" || wallet === "") {
    return;
  }

  // Check if email and wallet parameters exist
  const urlParams = new URLSearchParams(window.location.search);
  const urlEmail = urlParams.get("email");
  const urlWallet = urlParams.get("wallet");

  // Add email and wallet to URL
  urlParams.set("email", email);
  urlParams.set("wallet", wallet);
  window.history.replaceState({}, "", "?" + urlParams.toString());

  // Get the start time
  startTime = Date.now();
  // Start the timer interval
  timerInterval = setInterval(updateTimer, 1000);

  // Authenticate anonymously
  firebase
    .auth()
    .signInAnonymously()
    .then(() => {
      // Write new data to database or update existing data
      const currentTime = new Date().getTime();
      const emailRef = database.ref("users/" + wallet);
      emailRef.once("value", (snapshot) => {
        const data = snapshot.val();
        if (data && data.email === email) {
          // User already exists, don't add any tokens
          emailRef.update({
            timestamp: currentTime,
          });
          console.log("Existing user signed in, data updated in database successfully!");
        } else {
          // New user, add 0 tokens
          emailRef.set({
            email: email,
            token: 0,
            timestamp: currentTime,
          });
          console.log("New user signed up, data written to database successfully!");
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
