// Ensure the DOM is fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {
    // Get the form, search input, and artList element
    const form = document.querySelector('form');
    const searchInput = document.getElementById('search');
    const artList = document.getElementById('art-list');

    // Placeholder image URL (or you can use a local image file)
    const placeholderImage = 'https://via.placeholder.com/200?text=No+Image';

    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        // Get the search input value
        const searchValue = searchInput.value;
        const SEARCH_URL = 'https://collectionapi.metmuseum.org/public/collection/v1/search';

        try {
            const response = await axios.get(`${SEARCH_URL}?q=${searchValue}`);
            const { objectIDs } = response.data;

            console.log('Search result object IDs:', objectIDs);

            // Clear the current list before showing new items
            artList.innerHTML = '';

            // Loop through up to 5 images
            for (let i = 0; i < Math.min(objectIDs.length, 5); i++) {
                const objectID = objectIDs[i];
                try {
                    const objectResponse = await axios.get(
                        `https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectID}`
                    );
                    const {
                        primaryImage,
                        additionalImages,
                        title,
                        artistDisplayName,
                        objectDate,
                        galleryNumber,
                        objectURL
                    } = objectResponse.data;

                    console.log('Fetched object details:', objectResponse.data);

                    // Choose the image to display
                    const imageUrl = primaryImage || (additionalImages.length > 0 ? additionalImages[0] : placeholderImage);

                    // Create a list item
                    const listItem = document.createElement('li');
                    listItem.classList.add('art-item'); // Add class for styling

                    // Create the image element
                    const image = document.createElement('img');
                    image.src = imageUrl; // Use the chosen image URL
                    image.alt = title || 'Artwork'; // Provide alt text for accessibility

                    // Create the title element
                    const titleElement = document.createElement('h3');
                    titleElement.textContent = title || 'Untitled';

                    // Create the artist and date element
                    const artistElement = document.createElement('p');
                    artistElement.textContent = `${artistDisplayName || 'Unknown Artist'}, ${objectDate || 'Unknown Date'}`;

                    // Create the display status element
                    const displayStatus = document.createElement('p');
                    if (galleryNumber) {
                        displayStatus.textContent = `On display in Gallery ${galleryNumber}`;
                        displayStatus.classList.add('on-display');
                    } else {
                        displayStatus.textContent = 'Not on display';
                        displayStatus.classList.add('not-on-display');
                    }

                    // Create a link to the object's page
                    const link = document.createElement('a');
                    link.href = objectURL;
                    link.textContent = 'View on Museum Website';
                    link.target = '_blank'; // Open link in a new tab

                    // Append elements to the list item
                    listItem.appendChild(image);
                    listItem.appendChild(titleElement);
                    listItem.appendChild(artistElement);
                    listItem.appendChild(displayStatus);
                    listItem.appendChild(link);

                    // Append the list item to the art list
                    artList.appendChild(listItem);

                    console.log('Appended list item:', title);
                } catch (error) {
                    console.error('Error fetching details for object ID:', objectID, error);
                }
            }
        } catch (error) {
            console.error('Error fetching search results:', error);
        }
    });
});
