(function() {
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

  // Extract the wallet parameter from the URL
  const params = new URLSearchParams(window.location.search);
  const walletParam = params.has("wallet") ? params.get("wallet") : null;

  let startTime, elapsedTime, timerInterval;
  const form = document.querySelector('#tokenForm');
  const timer = document.querySelector('#timer');

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

      // Update the token count in the Firebase database
const wallet = walletParam; // Use the wallet parameter from the URL
const tokenRef = database.ref("users/" + wallet + "/token");
tokenRef.transaction(function (currentTokenCount) {
return (currentTokenCount || 0) + 0.5;
});
        // Reset the start time and update the token count display
  startTime = Date.now();
  const tokenCount = parseFloat(tokenCountElement.textContent);
  tokenCountElement.textContent = (tokenCount + 0.5).toFixed(1);
}
    }

function startTimer() {
startTime = Date.now();
timerInterval = setInterval(updateTimer, 1000);
}

function stopTimer() {
clearInterval(timerInterval);
}

form.addEventListener('submit', function(event) {
event.preventDefault();
startTimer();
});

tokenCountElement.addEventListener('click', function() {
// Update the token count in the Firebase database
const wallet = walletParam; // Use the wallet parameter from the URL
const tokenRef = database.ref("users/" + wallet + "/token");
tokenRef.transaction(function (currentTokenCount) {
return (currentTokenCount || 0) + 1;
});
// Update the token count display
const tokenCount = parseFloat(tokenCountElement.textContent);
tokenCountElement.textContent = (tokenCount + 1).toFixed(1);
  
});

displayTokenCount();
})();
