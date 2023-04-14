// Radio buttons:
const radioButtons = document.querySelectorAll('input[name="modeRadios"]');
chrome.storage.local.get(["mode"]).then((result) => {
    if (result["mode"] == null) {
        result["mode"] = "radioTrailMode";
    }
    const mode = result["mode"];
    console.log(mode);
    const activeRadioBtn = document.getElementById(mode);
    activeRadioBtn.checked = true;
});
for (const radioButton of radioButtons) {
    radioButton.addEventListener("change", (e) => {
        const mode = e.target.id;
        chrome.storage.local.get(["mode"]).then((result) => {
            result["mode"] = mode;
            console.log(JSON.stringify(result));
            chrome.storage.local.set(result);
        });
    });
}

// Download data button:

const downloadButton = document.getElementById("downloadData");

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const url = tabs[0].url;
    const tabURL = new URL(url.replace(/\/$/, "")); //.split(/[?#]/)[0]
    const tabHostname = tabURL.hostname;

    downloadButton.addEventListener("click", () => {
        chrome.storage.local.get(null, function (items) {
            // null implies all items

            // Convert object to a string.
            var result = JSON.stringify(items, null, 2);

            // Save as file
            var url = "data:application/json;base64," + btoa(result);
            chrome.downloads.download({
                url: url,
                filename: "ext_data.json",
            });
        });
    });

    chrome.storage.local.get(["button_data"], function (items) {
        const buttonsAsArray = Object.entries(items["button_data"]);
        const filteredLinks = buttonsAsArray.filter(
            ([key, value]) => key === tabHostname
        );

        // Convert object to a string.
        var result = JSON.stringify(filteredLinks, null, 2);

        const container = document.getElementById("container-buttons");
        container.innerHTML = `<pre>
            <code>
                ${result}
            </code>
        </pre>`;
    });

    chrome.storage.local.get(["click_data"], function (items) {
        const linksAsArray = Object.entries(items["click_data"]);
        const filteredLinks = linksAsArray.filter(
            ([key, value]) => key === tabHostname
        );

        // Convert object to a string.
        var result = JSON.stringify(filteredLinks, null, 2);

        const container = document.getElementById("container-links");
        container.innerHTML = `<pre>
            <code>
                ${result}
            </code>
        </pre>`;
    });
});
