const form = document.getElementById('tokenForm');
const timer = document.getElementById('timer');

let startTime, elapsedTime, timerInterval;

form.addEventListener('submit', function(event) {
  event.preventDefault();

  // Get the start time
  startTime = Date.now();

  // Start the timer interval
  timerInterval = setInterval(updateTimer, 1000);
});

function updateTimer() {
  // Get the elapsed time
  elapsedTime = Date.now() - startTime;

  // Format the time into minutes and seconds
  let minutes = Math.floor(elapsedTime / 60000);
  let seconds = Math.floor((elapsedTime % 60000) / 1000);

  // Add leading zeros to seconds if necessary
  if (seconds < 10) {
    seconds = '0' + seconds;
  }

  // Update the timer display
  timer.textContent = `${minutes}:${seconds}`;
}


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

// Get a reference to the database service
var database = firebase.database();

function submitHandler() {
  var email = document.getElementById("email").value;
  var wallet = document.getElementById("wallet").value;
  var tokenCount = parseInt(document.getElementById("tokenCount").innerText);

  // Write the data to the database
  database.ref('users/' + email).set({
    wallet: wallet,
    tokenCount: tokenCount
  });
}

const submitBtn = document.querySelector('#tokenForm input[type="submit"]');
submitBtn.addEventListener('click', submitHandler);
