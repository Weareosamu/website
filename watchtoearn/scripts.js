const urlParams = new URLSearchParams(window.location.search);
const wallet = urlParams.get("wallet");
const email = urlParams.get("email");
const database = firebase.database();
const tokenCountElement = document.querySelector('#tokenCount');
const countElement = document.querySelector("#tokenDisplay .count");
const tokenRef = database.ref("users/" + wallet + "/" + wallet);

function displayTokenCount() {
  if (!wallet) {
    return;
  }
  tokenRef.on("value", function (snapshot) {
    const tokenCount = snapshot.val() || 0;
    countElement.textContent = tokenCount;
  });
}

let startTime, elapsedTime, timerInterval;
const form = document.querySelector('#tokenForm');
const timer = document.querySelector('#timer');

function updateTimer() {
  elapsedTime = Date.now() - startTime;
  let hours = Math.floor(elapsedTime / 3600000);
  let minutes = Math.floor((elapsedTime % 3600000) / 60000);
  let seconds = Math.floor((elapsedTime % 60000) / 1000);
  minutes = minutes < 10 ? '0' + minutes : minutes;
  seconds = seconds < 10 ? '0' + seconds : seconds;
  timer.textContent = `${hours}:${minutes}:${seconds}`;
  if (elapsedTime >= 6000) {
    if (wallet && email) {
      const walletRef = database.ref(`users/${wallet}`);
      walletRef.once('value', function(snapshot) {
        const currentTokenCount = snapshot.child('token').val();
        const newTokenCount = (currentTokenCount === null || currentTokenCount === undefined) ? 1 : currentTokenCount + 0.5;
        walletRef.update({ [wallet]: newTokenCount });
      });
    }
    startTime += 6000;
  }
  displayTokenCount();
}

function submitHandler(event) {
  event.preventDefault();
  const emailInput = document.querySelector("#email");
  const walletInput = document.querySelector("#wallet");
  const newEmail = emailInput.value;
  const newWallet = walletInput.value;
  if (newEmail === "" || newWallet === "") {
    return;
  }
  urlParams.set("wallet", newWallet);
  urlParams.set("email", newEmail);
  window.history.replaceState({}, "", "?" + urlParams.toString());
  startTime = Date.now();
  timerInterval = setInterval(updateTimer, 1000);
  firebase.auth().signInAnonymously().then(() => {
    const currentTime = new Date().getTime();
    const emailRef = database.ref("users/" + wallet);
    emailRef.once("value", (snapshot) => {
      const data = snapshot.val();
      if (data && data.email === newEmail) {
        emailRef.update({ timestamp: currentTime });
      } else {
        emailRef.set({ token: 0, email: newEmail });
      }
    });
  });
}

if (wallet) {
  displayTokenCount();
}
form.addEventListener('submit', submitHandler);
