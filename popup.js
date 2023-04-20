// Active vs. Deactivated
chrome.storage.local.get(["settings"]).then((result) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const url = tabs[0].url;
        const tabURL = new URL(url.replace(/\/$/, "")); //.split(/[?#]/)[0]
        const tabHostname = tabURL.hostname;

        const activeSection = document.getElementById("active");
        const inactiveSection = document.getElementById("inactive");
        if (
            tabHostname in result["settings"] &&
            "active" in result["settings"][tabHostname] &&
            result["settings"][tabHostname]["active"] === false
        ) {
            activeSection.style.display = "none";
            inactiveSection.style.display = "block";
        } else {
            inactiveSection.style.display = "none";
            activeSection.style.display = "block";
            const hostnameSpan = document.getElementById("domainName");
            hostnameSpan.innerHTML = tabHostname;
            console.log(hostnameSpan);
        }
    });
});

// Deactivate/Reactivate buttons:
const deactivateButton = document.getElementById("deactivate");
const reactivateButton = document.getElementById("reactivate");
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const url = tabs[0].url;
    const tabURL = new URL(url.replace(/\/$/, "")); //.split(/[?#]/)[0]
    const tabHostname = tabURL.hostname;
    if (deactivateButton) {
        deactivateButton.addEventListener("click", () => {
            chrome.storage.local.get(
                ["settings", "button_data", "click_data", "history"],
                function (result) {
                    result["settings"][tabHostname]["active"] = false;
                    delete result["button_data"][tabHostname];
                    delete result["click_data"][tabHostname];
                    delete result["history"][tabHostname];
                    chrome.storage.local.set(result);
                }
            );
        });
    }
    if (reactivateButton) {
        reactivateButton.addEventListener("click", () => {
            chrome.storage.local.get(["settings"], function (result) {
                result["settings"][tabHostname]["active"] = true;
                chrome.storage.local.set(result);
            });
        });
    }
});

// Radio buttons:
const radioButtons = document.querySelectorAll('input[name="modeRadios"]');
chrome.storage.local.get(["mode"]).then((result) => {
    if (result["mode"] == null) {
        result["mode"] = "radioTrailMode";
    }
    const mode = result["mode"];
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

// Debugging features:
// const downloadAllButton = document.getElementById("downloadAll");
// chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//     const url = tabs[0].url;
//     const tabURL = new URL(url.replace(/\/$/, "")); //.split(/[?#]/)[0]
//     const tabHostname = tabURL.hostname;

//     downloadAllButton.addEventListener("click", () => {
//         chrome.storage.local.get(null, function (items) {
//             // null implies all items

//             // Convert object to a string.
//             var result = JSON.stringify(items, null, 2);

//             // Save as file
//             var url = "data:application/json;base64," + btoa(result);
//             chrome.downloads.download({
//                 url: url,
//                 filename: "ext_data.json",
//             });
//         });
//     });

//     chrome.storage.local.get(["button_data"], function (items) {
//         const buttonsAsArray = Object.entries(items["button_data"]);
//         const filteredLinks = buttonsAsArray.filter(
//             ([key, value]) => key === tabHostname
//         );

//         // Convert object to a string.
//         var result = JSON.stringify(filteredLinks, null, 2);

//         const container = document.getElementById("container-buttons");
//         container.innerHTML = `<pre>
//             <code>
//                 ${result}
//             </code>
//         </pre>`;
//     });

//     chrome.storage.local.get(["click_data"], function (items) {
//         const linksAsArray = Object.entries(items["click_data"]);
//         const filteredLinks = linksAsArray.filter(
//             ([key, value]) => key === tabHostname
//         );

//         // Convert object to a string.
//         var result = JSON.stringify(filteredLinks, null, 2);

//         const container = document.getElementById("container-links");
//         container.innerHTML = `<pre>
//             <code>
//                 ${result}
//             </code>
//         </pre>`;
//     });
// });
