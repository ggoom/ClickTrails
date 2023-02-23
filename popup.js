const downloadButton = document.getElementById("downloadData");
downloadButton.addEventListener("click", () => {
    chrome.storage.local.get(null, function(items) { // null implies all items
        // Convert object to a string.
        var result = JSON.stringify(items, null, 2);
    
        // Save as file
        var url = 'data:application/json;base64,' + btoa(result);
        chrome.downloads.download({
            url: url,
            filename: 'ext_data.json'
        });
    });
});

chrome.storage.local.get(['button_data'], function(items) {
    // Convert object to a string.
    var result = JSON.stringify(items, null, 2);

    const container = document.getElementById("container-buttons");
    container.innerHTML =
    `<pre>
        <code>
            ${result}
        </code>
    </pre>`
});

chrome.storage.local.get(['click_data'], function(items) {
    // Convert object to a string.
    var result = JSON.stringify(items, null, 2);

    const container = document.getElementById("container-links");
    container.innerHTML =
    `<pre>
        <code>
            ${result}
        </code>
    </pre>`
});