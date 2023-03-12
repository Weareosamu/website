const form = document.getElementById('tokenForm');
const timer = document.getElementById('timer');

const firebaseConfig = {
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



/////////////////////////////////////////////

// Get a reference to the database service
const database = firebase.database();

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


////////////////////////////////////////////////////////////////

function submitHandler(event) {
  event.preventDefault();

  // Authenticate anonymously
  firebase.auth().signInAnonymously()
    .then(() => {
      // Get user's wallet and email input values
      const emailInput = document.querySelector('#email');
      const walletInput = document.querySelector('#wallet');
      const email = emailInput.value;
      const wallet = walletInput.value;

      // Set initial token value and current timestamp
      const token = 1;
      const currentTime = new Date().getTime();

      // Write data to database under user's wallet ID
      const emailRef = database.ref('users/' + wallet);
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

    })
    .catch((error) => {
      // Handle authentication error
      console.log("Authentication failed:", error.message);
    });
}

const submitBtn = document.querySelector('#tokenForm input[type="submit"]');
submitBtn.addEventListener('click', submitHandler);
