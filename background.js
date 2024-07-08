const apiKey = AIzaSyBNKUVPxfKGTg99XkHELkcQJjQUvYG8eeM;

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.action === "getApiKey") {
            sendResponse({ apiKey: apiKey });
        }
    }
);
