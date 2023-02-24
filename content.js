// const url = chrome.runtime.getURL('./data/new_data.json');

// fetch(url)
//     .then((response) => response.json()) //assuming file contains json
//     .then((json) => chrome.storage.local.set(json));

const MIN_CLICKS = 1;
const tabURL = new URL(document.location.href.replace(/\/$/, "")); //.split(/[?#]/)[0]
const tabHostname = tabURL.hostname;

let shelf = document.createElement("div");
shelf.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
shelf.style.boxShadow = "0 0 5px 1px rgba(100, 100, 100, 0.5)";
shelf.style.position = "fixed";
shelf.style.bottom = "0px";
shelf.style.left = "0px";
shelf.style.height = "100px";
shelf.style.width = "100vw";
shelf.style.zIndex = "2147483647";
shelf.style.overflow = "scroll";
shelf.style.listStyleType = "none";

let collapse = document.createElement("span");
collapse.innerText = "▼";
collapse.style.position = "absolute";
collapse.style.top = "0px";
collapse.style.right = "10px";
collapse.style.padding = "3px 6px";
collapse.style.cursor = "pointer";
collapse.style.color = "darkgray";

let reopen = document.createElement("span");
reopen.innerText = "▲";
reopen.style.position = "fixed";
reopen.style.bottom = "0px";
reopen.style.right = "0px";
reopen.style.padding = "3px 10px";
reopen.style.cursor = "pointer";
reopen.style.color = "darkgray";

collapse.onclick = () => {
    shelf.remove();
    document.body.append(reopen);
    // document.body.style.height = "100vh";
    chrome.storage.local.set({"shelf_open": false});
};
reopen.onclick = () => {
    reopen.remove();
    // document.body.style.height = "calc(100vh - 100px)";
    document.body.append(shelf);
    shelf.appendChild(collapse);
    chrome.storage.local.set({"shelf_open": true});
};

chrome.storage.local.get(["shelf_open"]).then((result) => {
    let shelfOpen = true;
    if (result["shelf_open"] === false) {
        shelfOpen = false;
    }
    console.log(shelfOpen);

    if (shelfOpen) {
        // document.body.style.height = "calc(100vh - 100px)";
        document.body.append(shelf);
        shelf.appendChild(collapse);
    } else {
        document.body.append(reopen);
    }
})

const links = document.getElementsByTagName("a");
// console.log(links);
const elevated = [];
Array.from(links).forEach((element) => {
    element.addEventListener("click", (_) => record(element));
    // console.log(element);
    elevateLinks(element, elevated);
});

const initData = {'clicks': 0, 'hide': false, 'highlight': true, 'increase': 0, 'decrease': 0}

function record(el) {
    console.log("clicked", el.href);
    chrome.storage.local.get(["click_data"]).then((result) => {
        const clickedURL = new URL(el.href.replace(/\/$/, ""));
        const clickedURLStr = clickedURL.toString();
        const clickedHostname = clickedURL.hostname;
        const clickedHash = clickedURL.hash;

        if (result["click_data"] == null) {
            result["click_data"] = {};
        }
        if (result["click_data"][tabHostname] == null) {
            result["click_data"][tabHostname] = {};
        }
        let tabHostnameData = result["click_data"][tabHostname];

        if (clickedHostname === tabHostname && clickedHash !== "") {
            if (tabHostnameData[clickedHash] == null) {
                tabHostnameData[clickedHash] = initData;
            }
            tabHostnameData[clickedHash]['clicks']++;
        } else {
            if (tabHostnameData[clickedURLStr] == null) {
                tabHostnameData[clickedURLStr] = initData;
            }
            tabHostnameData[clickedURLStr]['clicks']++;
        }

        result["click_data"][tabHostname] = tabHostnameData;
        // console.log(JSON.stringify(result))
        chrome.storage.local.set(result);
    });
}

function elevateLinks(el, elevated) {
    // console.log(el);
    let tabURL;
    try {
        tabURL = new URL(document.location.href.replace(/\/$/, "")); //.split(/[?#]/)[0]
    } catch (e) {
        return;
    }
    const tabHostname = tabURL.hostname;

    chrome.storage.local.get(["click_data"]).then((result) => {
        let clickedURL;
        try {
            clickedURL = new URL(el.href.replace(/\/$/, "")); //.split(/[?#]/)[0]
        } catch (e) {
            return;
        }

        const clickedURLStr = clickedURL.toString();
        const clickedHostname = clickedURL.hostname;
        const clickedHash = clickedURL.hash;
        const key =
            clickedHostname === tabHostname && clickedHash !== ""
                ? clickedHash
                : clickedURLStr;
        if (elevated.includes(key)) {
            return;
        } else {
            elevated.push(key);
        }

        if (result["click_data"] == null) {
            return;
        }
        let tabHostnameData = result["click_data"][tabHostname];
        if (tabHostnameData == null) {
            return;
        }
        const total = Object.values(tabHostnameData).reduce((a, b) => a + b, 0);
        // if (total < 10) {
        //     return;
        // }

        if (tabHostnameData[key] == null) {
            return;
        }
        const numClicks = tabHostnameData[key]['clicks'];

        if (numClicks >= MIN_CLICKS) {
            console.log(key);
            // get parent
            while (el.parentNode.childElementCount === 1) {
                el = el.parentNode;
            }

            // add to shelf
            newEl = prepareElementForShelf(el, numClicks);
            shelf.append(newEl);

            // highlight
            el.style.boxShadow = `0px 0px 0px ${borderSize(
                numClicks
            )}px rgba(255, 216, 77, 0.8)`;
            el.style.background = `rgba(255, 216, 77, ${highlightOpacity(
                numClicks
            )})`;
        }
    });
}

function prepareElementForShelf(element, numClicks) {
    newEl = element.cloneNode(true);
    newEl.id = "";
    container = document.createElement("div");
    container.append(newEl);

    // const styles = window.getComputedStyle(el);
    // let cssText = styles.cssText;
    // if (!cssText) {
    // cssText = Array.from(styles).reduce((str, property) => {
    //     return `${str}${property}:${styles.getPropertyValue(property)};`;
    // }, '');
    // }
    // container.style.cssText = cssText;
    // container.style.visibility = 'visible';

    container.style.boxShadow = `0px 0px 0px ${borderSize(
        numClicks
    )}px rgba(255, 216, 77, 0.8)`;
    container.style.margin = `10px`;
    container.style.display = `inline-block`;
    container.style.borderRadius = `5px`;
    container.style.padding = `5px`;
    return container;
}

const buttons = document.getElementsByTagName("button");
Array.from(buttons).forEach((element) => {
    const buttonId = element.id;
    if (buttonId === "") {
        return;
    }
    element.addEventListener("click", (_) => recordButton(element));
    elevateButton(element);
});
const inputButtons = document.getElementsByTagName("input");
Array.from(inputButtons).forEach((element) => {
    const type = element.type;
    if (type !== "submit" && type !== "button") {
        return;
    }
    const buttonId = element.id;
    if (buttonId === "") {
        return;
    }
    element.addEventListener("click", (_) => recordButton(element));
    elevateButton(element);
});

function recordButton(element) {
    const buttonId = element.id;
    chrome.storage.local.get(["button_data"]).then((result) => {
        if (result["button_data"] == null) {
            result["button_data"] = {};
        }
        if (result["button_data"][tabHostname] == null) {
            result["button_data"][tabHostname] = {};
        }
        let tabHostnameData = result["button_data"][tabHostname];
        if (tabHostnameData[buttonId] == null) {
            tabHostnameData[buttonId] = initData;
        }
        tabHostnameData[buttonId]['counts']++;

        result["button_data"][tabHostname] = tabHostnameData;
        // console.log(JSON.stringify(result));
        chrome.storage.local.set(result);
    });
}

function elevateButton(el) {
    let tabURL;
    try {
        tabURL = new URL(document.location.href.replace(/\/$/, "")); //.split(/[?#]/)[0]
    } catch (e) {
        return;
    }
    const tabHostname = tabURL.hostname;

    chrome.storage.local.get(["button_data"]).then((result) => {
        const buttonId = el.id;
        if (buttonId === "") {
            return;
        }

        if (result["button_data"] == null) {
            return;
        }
        let tabHostnameData = result["button_data"][tabHostname];
        if (tabHostnameData == null) {
            return;
        }
        if (tabHostnameData[buttonId] == null) {
            return;
        }

        // const total = Object.values(tabHostnameData).reduce((a, b) => a + b, 0);
        // if (total < 10) {
        //     return;
        // }

        const numClicks = tabHostnameData[buttonId]['counts'];
        if (numClicks >= MIN_CLICKS) {
            // add to shelf
            newEl = prepareButtonForShelf(el, numClicks);
            shelf.append(newEl);

            // highlight
            el.parentNode.style.boxShadow = `0px 0px 0px ${borderSize(
                numClicks
            )}px rgba(252, 121, 237, 0.8)`;
        }
    });
}

function prepareButtonForShelf(element, numClicks) {
    let text = "";
    if (element.innerText !== "") {
        text = element.innerText;
    } else if (element.value !== "") {
        text = element.value;
    } else if (element.title !== "") {
        text = element.title;
    }

    newEl = document.createElement("button");
    newEl.innerText = text;

    newEl.style.margin = `10px 20px`;
    newEl.style.padding = "10px";
    newEl.style.decoration = "none";
    newEl.style.display = `inline-block`;
    newEl.style.boxShadow = `0px 0px 0px ${borderSize(
        numClicks
    )}px rgba(252, 121, 237, 0.8)`;
    newEl.style.border = "none";
    newEl.style.backgroundColor = "rgba(0, 0, 0, 0)";
    newEl.style.borderRadius = "5px";

    newEl.addEventListener("click", (_) => {
        console.log(element);
        element.click();
    });

    return newEl;
}

function borderSize(numClicks) {
    return Math.min(10, numClicks - MIN_CLICKS + 1);
}

function highlightOpacity(numClicks) {
    return Math.min(numClicks * 0.1, 0.8);
}
