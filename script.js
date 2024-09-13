document.addEventListener('DOMContentLoaded', function () {
    // Get the form, search input, and artList element
    const form = document.querySelector('form');
    const searchInput = document.getElementById('search');
    const artList = document.getElementById('art-list');

    // Create 'Load More' button dynamically
    const loadMoreButton = document.createElement('button');
    loadMoreButton.textContent = 'Load More';
    loadMoreButton.classList.add('load-more');
    loadMoreButton.style.display = 'none'; // Hide the button initially

    // Create 'Clear' or 'Reset' button dynamically
    const clearButton = document.createElement('button');
    clearButton.textContent = 'Clear';
    clearButton.classList.add('clear-button');
    clearButton.style.display = 'none'; // Hide the button initially

    let currentIndex = 0;
    let currentObjectIDs = [];
    async function setRandomBackground() {
        const SEARCH_URL = 'https://collectionapi.metmuseum.org/public/collection/v1/search';
        const response = await axios.get(`${SEARCH_URL}?q=art&hasImages=true`);
        const objectIDs = response.data.objectIDs;

        if (objectIDs.length > 0) {
            const randomID = objectIDs[Math.floor(Math.random() * objectIDs.length)];
            const objectResponse = await axios.get(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${randomID}`);
            const { primaryImage } = objectResponse.data;

            if (primaryImage) {
                document.body.style.backgroundImage = `url('${primaryImage}')`;
            }
        }
    }

    // Call the function when the DOM is loaded
    document.addEventListener('DOMContentLoaded', function () {
        setRandomBackground();
        // Other initialization code here...
    });

    // Add event listener for form submission
    form.addEventListener('submit', async function (event) {
        event.preventDefault(); // Prevents form from submitting normally

        // Get the search input value
        const searchValue = searchInput.value;
        const SEARCH_URL = 'https://collectionapi.metmuseum.org/public/collection/v1/search';
        const response = await axios.get(`${SEARCH_URL}?q=${searchValue}`);
        const { objectIDs } = response.data;

        // Clear the current list before showing new items
        artList.innerHTML = '';
        currentObjectIDs = objectIDs; // Store object IDs for pagination
        currentIndex = 0; // Reset the current index

        // Display the first 5 items
        loadArtworks();

        // Show 'Load More' and 'Clear' buttons if there are results
        if (currentObjectIDs.length > 5) {
            loadMoreButton.style.display = 'block';
        } else {
            loadMoreButton.style.display = 'none'; // Hide if less than 5 items
        }

        clearButton.style.display = 'block'; // Show 'Clear' button after search
    });

    // Add event listener to "Load More" button
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

            // Create image element or fallback for no image
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

            // Create title element
            const titleElement = document.createElement('h3');
            titleElement.textContent = title || 'Untitled';
            listItem.appendChild(titleElement);

            // Create artist and date element
            const artistElement = document.createElement('p');
            artistElement.textContent = `${artistDisplayName || 'Unknown Artist'}, ${objectDate || 'Unknown Date'}`;
            listItem.appendChild(artistElement);

            // Create display status element
            const displayStatus = document.createElement('p');
            if (GalleryNumber) {
                displayStatus.textContent = `On display in Gallery ${GalleryNumber}`;
                displayStatus.classList.add('on-display');
            } else {
                displayStatus.textContent = 'Not on display';
                displayStatus.classList.add('not-on-display');
            }
            listItem.appendChild(displayStatus);

            // Append list item to art list
            artList.appendChild(listItem);
        }

        // Update the current index
        currentIndex += itemsToShow;

        // Hide "Load More" button if all items are loaded
        if (currentIndex >= currentObjectIDs.length) {
            loadMoreButton.style.display = 'none';
        }
    }

    // Add event listener to the "Clear" button to reset the search and list
    clearButton.addEventListener('click', function () {
        artList.innerHTML = ''; // Clear the artwork list
        searchInput.value = ''; // Clear the search input
        currentIndex = 0;
        currentObjectIDs = [];

        loadMoreButton.style.display = 'none'; // Hide the "Load More" button
        clearButton.style.display = 'none'; // Hide the "Clear" button
    });

    // Append the buttons to the body (or wherever you'd like them to appear)
    document.body.appendChild(loadMoreButton);
    document.body.appendChild(clearButton);
});
