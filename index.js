chrome.storage.local.get(["history"], function (result) {
    const listContainer = document.getElementById("listContainer");
    const filteredHistory = filterHistoryBlanks(result["history"]);
    for (const domain in filteredHistory) {
        const newCheckbox = document.createElement("input");
        newCheckbox.setAttribute("type", "checkbox");
        newCheckbox.setAttribute("id", "checkbox-" + domain);
        newCheckbox.setAttribute("checked", "");

        const newLabel = document.createElement("label");
        newLabel.setAttribute("for", "checkbox-" + domain);
        newLabel.innerHTML = "&nbsp" + domain + "&nbsp";

        const newDescription = document.createElement("a");
        newDescription.setAttribute("href", "http://" + domain);
        newDescription.setAttribute("target", "_blank");
        newDescription.innerHTML = "(view website)";

        listContainer.appendChild(newCheckbox);
        listContainer.appendChild(newLabel);
        listContainer.appendChild(newDescription);
        listContainer.appendChild(document.createElement("br"));
    }
});

const downloadButton = document.getElementById("downloadSelections");
downloadButton.addEventListener("click", () => {
    chrome.storage.local.get(["history", "settings"], function (result) {
        // const filteredHistory = filterHistoryBlanks(result["history"]);
        // result["history"] = filteredHistory;
        const out = {history: {}, settings: {}}

        const checkboxes = document.getElementsByTagName("input");
        Array.from(checkboxes).forEach(function (el) {
            const tabHostname = el.id.replace("checkbox-", "");
            if (el.checked) {
                out["history"][tabHostname] = result["history"][tabHostname];
                if (tabHostname in result["settings"]) {
                    out["settings"][tabHostname] = result["settings"][tabHostname];
                }
            }
        });

        const resultStr = JSON.stringify(out, null, 2);
        var url = "data:application/json;base64," + btoa(resultStr);
        chrome.downloads.download({
            url: url,
            filename: "ClickTrails_Selected_Data.json",
        });
    });
});

function filterHistoryBlanks(history) {
    Object.keys(history).forEach((key) => {
        if (
            Object.keys(history[key]["button_data"]).length === 0 &&
            Object.keys(history[key]["click_data"]).length === 0
        ) {
            delete history[key];
        }
    });
    return history;
}
