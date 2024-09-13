// Get the form, search input, and artList element
const form = document.querySelector('form');
const searchInput = document.getElementById('search');
const artList = document.getElementById('art-list');

// Add an event listener to handle the form submission
form.addEventListener('submit', async function (event) {
    event.preventDefault();

    // Get the search input value
    const searchValue = searchInput.value;
    const SEARCH_URL = 'https://collectionapi.metmuseum.org/public/collection/v1/search';
    const response = await axios.get(`${SEARCH_URL}?q=${searchValue}`);
    const { objectIDs } = response.data;

    // Clear the current list before showing new items
    artList.innerHTML = '';

    // Loop through up to 5 images
    for (let i = 0; i < Math.min(objectIDs.length, 5); i++) {
        const objectID = objectIDs[i];
        const objectResponse = await axios.get(
            `https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectID}`
        );
        const {
            primaryImage,
            title,
            artistDisplayName,
            objectDate,
            GalleryNumber
        } = objectResponse.data;

        if (primaryImage) {
            // Create a list item
            const listItem = document.createElement('li');

            // Create the image element
            const image = document.createElement('img');
            image.src = primaryImage;

            // Create the title element
            const titleElement = document.createElement('h3');
            titleElement.textContent = title || 'Untitled';

            // Create the artist and date element
            const artistElement = document.createElement('p');
            artistElement.textContent = `${artistDisplayName || 'Unknown Artist'}, ${objectDate || 'Unknown Date'}`;

            // Create the display status element
            const displayStatus = document.createElement('p');
            if (GalleryNumber) {
                displayStatus.textContent = `On display in Gallery ${GalleryNumber}`;
                displayStatus.classList.add('on-display');
            } else {
                displayStatus.textContent = 'Not on display';
                displayStatus.classList.add('not-on-display');
            }

            // Append elements to the list item
            listItem.appendChild(image);
            listItem.appendChild(titleElement);
            listItem.appendChild(artistElement);
            listItem.appendChild(displayStatus);

            // Append the list item to the art list
            artList.appendChild(listItem);
        }
    }
});
