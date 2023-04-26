// Active vs. Deactivated
chrome.storage.local.get(["settings"]).then((result) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const url = tabs[0].url;
        const tabURL = new URL(url.replace(/\/$/, "")); //.split(/[?#]/)[0]
        const tabHostname = tabURL.hostname;

        const activeSection = document.getElementById("active");
        const inactiveSection = document.getElementById("inactive");
        const hostnameSpans = document.getElementsByClassName("domainName");
        Array.from(hostnameSpans).forEach((el) => (el.innerHTML = tabHostname));

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
        }
    });
});

const deactivateButton = document.getElementById("deactivate");
const reactivateButton = document.getElementById("reactivate");
const radioButtons = document.querySelectorAll('input[name="modeRadios"]');

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const url = tabs[0].url;
    const tabURL = new URL(url.replace(/\/$/, "")); //.split(/[?#]/)[0]
    const tabHostname = tabURL.hostname;

    // Deactivate button
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
                    window.location.reload();
                }
            );
        });
    }

    // Reactivate button
    if (reactivateButton) {
        reactivateButton.addEventListener("click", () => {
            chrome.storage.local.get(["settings"], function (result) {
                result["settings"][tabHostname]["active"] = true;
                chrome.storage.local.set(result);
                window.location.reload();
            });
        });
    }

    // Radio buttons
    chrome.storage.local.get(["settings"]).then((result) => {
        if (result["settings"][tabHostname] === undefined) {
            return;
        }
        if (
            result["settings"][tabHostname]["mode"] == null
        ) {
            result["settings"][tabHostname]["mode"] = 1;
        }
        const mode = result["settings"][tabHostname]["mode"];
        const activeRadioBtn = document.getElementById(modeToName(mode));
        activeRadioBtn.checked = true;
    });
    for (const radioButton of radioButtons) {
        radioButton.addEventListener("change", (e) => {
            const modeName = e.target.id;
            chrome.storage.local.get(["settings"]).then((result) => {
                result["settings"][tabHostname]["mode"] = nameToMode(modeName);
                chrome.storage.local.set(result);
            });
        });
    }
});

function modeToName(mode) {
    switch (mode) {
        case 0:
            return "radioOff";
        case 1:
            return "radioTrailMode";
        case -1:
            return "radioDisengageMode";
        default:
            return "radioTrailMode";
    }
}

function nameToMode(name) {
    switch (name) {
        case "radioOff":
            return 0;
        case "radioTrailMode":
            return 1;
        case "radioDisengageMode":
            return -1;
        default:
            return 1;
    }
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
