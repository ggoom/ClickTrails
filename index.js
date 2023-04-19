chrome.storage.local.get(["history"], function (result) {
    const listContainer = document.getElementById("listContainer");
    for (const domain in result["history"]) {
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
    chrome.storage.local.get(["history"], function (result) {
        const checkboxes = document.getElementsByTagName("input");
        Array.from(checkboxes).forEach(function (el) {
            const tabHostname = el.id.replace("checkbox-", "");
            if (!el.checked) {
                delete result["history"][tabHostname];
            }
        });

        const resultStr = JSON.stringify(result, null, 2);
        var url = "data:application/json;base64," + btoa(resultStr);
        chrome.downloads.download({
            url: url,
            filename: "ClickTrails_Selected_Data.json",
        });
    });
});
