// script.js


chrome.runtime.sendMessage({ action: "getApiKey" }, function (response) {
    if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        return;
    }

    if (response) {
        const apiKey = response.apiKey;

        if (apiKey) {
            const apiUrl = 'https://www.googleapis.com/youtube/v3/search';

            function display(title, videoid) {
                console.log(`Displaying video: ${title} (${videoid})`);
                // Create new elements
                const titleElement = document.createElement('p');
                const iframe = document.createElement('iframe');

                // Set element attributes
                titleElement.id = 'title_' + videoid;
                titleElement.style.color = 'white';
                titleElement.style.fontWeight = 'bold';
                titleElement.style.fontSize = '18px';
                iframe.id = 'vid_' + videoid;
                iframe.width = '400';
                iframe.height = '230';
                iframe.frameborder = '0';
                iframe.style.borderRadius = '10px';
                iframe.style.border = '0';
                iframe.src = `https://www.youtube.com/embed/${videoid}`;
                iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
                iframe.allowfullscreen = true;

                // Display only if video is available
                if (availableVideos.has(videoid)) {
                    titleElement.innerHTML = title;
                    document.body.appendChild(titleElement);
                    document.body.appendChild(iframe);
                } else {
                    console.warn(`Video unavailable: ${title} (${videoid})`);
                }
            }

            async function isVideoAvailable(videoid) {
                try {
                    const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?id=${videoid}&key=${apiKey}&part=snippet`);
                    const data = await response.json();
                    return data.items && data.items.length > 0;
                } catch (error) {
                    console.error('Error fetching video data:', error);
                    return false;
                }
            }

            const searchButton = document.querySelector("#search_btn");
            const availableVideos = new Set(); // Track available video IDs
            const searchInput = document.querySelector("#search_data");

            async function getVideos() {
                const searchText = document.querySelector("#search_data").value;

                try {
                    // Remove existing elements
                    document.querySelectorAll("[id^='title_']").forEach(el => el.remove());
                    document.querySelectorAll("[id^='vid_']").forEach(el => el.remove());

                    const response = await fetch(`${apiUrl}?key=${apiKey}&part=snippet&type=video&q=${encodeURIComponent(searchText)}&maxResults=25`);
                    const data = await response.json();

                    if (data.items && data.items.length > 0) {
                        availableVideos.clear(); // Reset available video set
                        data.items.forEach(async item => {
                            const available = await isVideoAvailable(item.id.videoId);
                            if (available) {
                                availableVideos.add(item.id.videoId); // Add available video ID
                                display(item.snippet.title, item.id.videoId);
                            } else {
                                console.warn(`Video unavailable: ${item.snippet.title} (${item.id.videoId})`);
                            }
                        });
                    } else {
                        console.warn('No videos found');
                    }
                } catch (error) {
                    console.error('Error fetching data:', error);
                }
            }

            searchInput.addEventListener("keypress", function (event) {
                if (event.key === "Enter") {
                    getVideos();
                }
            });

            // Keep the existing click event listener for the search button
            searchButton.addEventListener("click", getVideos);

        } else {
            console.error('Error: API key not available in the response.');
        }
    } else {
        console.error('Error: No response received from background script.');
    }
});
