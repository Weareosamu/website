

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

////////////////////////////////////////////////////////////////TIMER

let startTime, elapsedTime, timerInterval;

const form = document.querySelector('#tokenForm');
const timer = document.querySelector('#timer');

form.addEventListener('submit', function(event) {
  event.preventDefault();

  // Get the start time and the token count from Firebase
  startTime = Date.now();
  const walletInput = document.querySelector('#wallet');
  const wallet = walletInput.value;
  const tokenRef = database.ref('users/' + wallet + '/token');
  tokenRef.once('value').then((snapshot) => {
    tokenCount = snapshot.val() || 0;
    tokenCountElement.textContent = tokenCount;
  });

  // Start the timer interval
  timerInterval = setInterval(updateTimer, 1000);
});

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

  // Check if a minute has passed and add 1 token if so
  if (elapsedTime >= 60000) {
    // Update the token count in the Firebase database using transaction()
    const walletInput = document.querySelector('#wallet');
    const wallet = walletInput.value;
    const tokenRef = database.ref('users/' + wallet + '/token');
    tokenRef.transaction(function(currentTokenCount) {
      return (currentTokenCount || 0) + 0.5;
    });

    // Update the token count element in the HTML
    database.ref('users/' + wallet + '/token').on('value', function(snapshot) {
      tokenCountElement.textContent = snapshot.val();
    });


const tokenDisplayElement = document.getElementById('tokenDisplay');


// Retrieve token count from Firebase database
tokenRef.on('value', function(snapshot) {
  tokenDisplayElement.textContent = snapshot.val();
});
	  
    // Reset the start time
    startTime += 60000;
  }
}

////////////////////////////////////////////////////////////////TIMEREND

function submitHandler(event) {
event.preventDefault();

// Get the start time
  startTime = Date.now();

// Start the timer interval
	timerInterval = setInterval(updateTimer, 1000);
   
// Get user's wallet and email input values
const emailInput = document.querySelector('#email');
const walletInput = document.querySelector('#wallet');
const email = emailInput.value;
const wallet = walletInput.value;

// Return if either email or wallet is empty
if (email === '' || wallet === '') {
return;
}

// Authenticate anonymously
firebase.auth().signInAnonymously()
.then(() => {
  // Check if data exists in database under user's wallet ID
  const emailRef = database.ref('users/' + wallet);
  emailRef.once('value')
    .then((snapshot) => {
      if (snapshot.exists()) {
        // Data already exists, change button text to "Signed In"
        document.querySelector('input[type="submit"]').value = 'Signed In';
      } else {
        // Data doesn't exist, write new data to database
        const token = 1;
        const currentTime = new Date().getTime();
        emailRef.set({
          email: email,
          token: token,
          timestamp: currentTime
        });
        // Clear input fields
        emailInput.value = '';
        walletInput.value = '';
        // Log success message
        console.log("Data written to database successfully!");
      }
    })
    .catch((error) => {
      // Handle read error
      console.log("Read failed:", error.message);
    });

})
.catch((error) => {
  // Handle authentication error
  console.log("Authentication failed:", error.message);
});
 
}

const submitBtn = document.querySelector('#tokenForm input[type="submit"]');
submitBtn.addEventListener('click', submitHandler);
