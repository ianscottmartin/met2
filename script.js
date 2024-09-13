// Get the form, search input, and artList element
const form = document.querySelector('form');
const searchInput = document.getElementById('search');
const artList = document.getElementById('art-list');

// Create a 'Load More' button dynamically
const loadMoreButton = document.createElement('button');
loadMoreButton.textContent = 'Load More';
loadMoreButton.classList.add('load-more');
loadMoreButton.style.display = 'none'; // Hide the button initially

let currentIndex = 0;
let currentObjectIDs = [];

// Add an event listener to handle the form submission
form.addEventListener('submit', async function (event) {
    event.preventDefault(); // Prevents the form from submitting normally

    // Get the search input value
    const searchValue = searchInput.value;
    const SEARCH_URL = 'https://collectionapi.metmuseum.org/public/collection/v1/search';
    const response = await axios.get(`${SEARCH_URL}?q=${searchValue}`);
    const { objectIDs } = response.data;

    // Clear the current list before showing new items
    artList.innerHTML = '';
    currentObjectIDs = objectIDs; // Store the object IDs for pagination
    currentIndex = 0; // Reset the current index

    // Display the first 5 items
    loadArtworks();

    // Show the "Load More" button if there are more items
    if (currentObjectIDs.length > 5) {
        loadMoreButton.style.display = 'block';
    } else {
        loadMoreButton.style.display = 'none'; // Hide if less than 5 items
    }
});

// Add an event listener to the "Load More" button
loadMoreButton.addEventListener('click', function () {
    loadArtworks();
});

// Function to load artworks, 5 at a time
async function loadArtworks() {
    const remainingItems = currentObjectIDs.length - currentIndex;
    const itemsToShow = Math.min(remainingItems, 5); // Load 5 items or remaining ones

    for (let i = 0; i < itemsToShow; i++) {
        const objectID = currentObjectIDs[currentIndex + i];
        const objectResponse = await axios.get(
            `https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectID}`
        );

        // Log the object details to the console
        console.log("Fetched object:", objectResponse.data);

        const {
            primaryImage,
            title,
            artistDisplayName,
            objectDate,
            GalleryNumber,
            objectURL
        } = objectResponse.data;

        // Create a list item
        const listItem = document.createElement('li');

        // Create the image element or a fallback if no image
        if (primaryImage) {
            const image = document.createElement('img');
            image.src = primaryImage;
            listItem.appendChild(image);
        } else {
            const noImageText = document.createElement('p');
            noImageText.textContent = 'No image available';
            listItem.appendChild(noImageText);

            // Add a link to the museum's page for the artwork
            const linkElement = document.createElement('a');
            linkElement.href = objectURL;
            linkElement.textContent = 'View artwork details on the Met Museum website';
            linkElement.target = '_blank'; // Open in a new tab
            listItem.appendChild(linkElement);
        }

        // Create the title element
        const titleElement = document.createElement('h3');
        titleElement.textContent = title || 'Untitled';
        listItem.appendChild(titleElement);

        // Create the artist and date element
        const artistElement = document.createElement('p');
        artistElement.textContent = `${artistDisplayName || 'Unknown Artist'}, ${objectDate || 'Unknown Date'}`;
        listItem.appendChild(artistElement);

        // Create the display status element
        const displayStatus = document.createElement('p');
        if (GalleryNumber) {
            displayStatus.textContent = `On display in Gallery ${GalleryNumber}`;
            displayStatus.classList.add('on-display');
        } else {
            displayStatus.textContent = 'Not on display';
            displayStatus.classList.add('not-on-display');
        }
        listItem.appendChild(displayStatus);

        // Append the list item to the art list
        artList.appendChild(listItem);
    }

    // Update the current index
    currentIndex += itemsToShow;

    // Hide the "Load More" button if all items are loaded
    if (currentIndex >= currentObjectIDs.length) {
        loadMoreButton.style.display = 'none';
    }
}

// Append the "Load More" button to the body (or wherever you'd like it to appear)
document.body.appendChild(loadMoreButton);
