const apiKey = API_KEY;

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.action === "getApiKey") {
            sendResponse({ apiKey: apiKey });
        }
    }
);
