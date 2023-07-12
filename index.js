document.addEventListener("DOMContentLoaded", async () => {
  // Function to get geolocation coordinates
  async function getGeolocation() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position.coords),
        (error) => reject(error)
      );
    });
  }

  try {
    // Get geolocation coordinates
    const coordinates = await getGeolocation();
    // Store coordinates in Local Storage
    localStorage.setItem("latitude", coordinates.latitude);
    localStorage.setItem("longitude", coordinates.longitude);
  } catch (error) {
    // Handle error if geolocation is not available or denied by the user
    displayErrorMessage(error.message);
  }

  async function displayErrorMessage(message) {
    const errorContainer = document.getElementById('errorContainer');
    errorContainer.textContent = message;
  }

  // Function to play the opening sound
  function playOpeningSound() {
    const openingSound = document.getElementById('openingSound');
    openingSound.play();
    // Remove the event listener after the first user interaction
    document.removeEventListener('click', playOpeningSound);
  }

  // Add a click event listener to play the opening sound after a user interaction
  document.addEventListener('click', playOpeningSound);
});