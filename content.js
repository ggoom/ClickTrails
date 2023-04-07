// const url = chrome.runtime.getURL('./data/new_data.json');

// fetch(url)
//     .then((response) => response.json()) //assuming file contains json
//     .then((json) => chrome.storage.local.set(json));

const MIN_CLICKS = 0;
const tabURL = new URL(document.location.href.replace(/\/$/, "")); //.split(/[?#]/)[0]
const tabHostname = tabURL.hostname;

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

            // highlight
            el.style.boxShadow = `inset 0px 0px 0px 2px rgba(255, 216, 77, ${highlightOpacity(
                numClicks
            )})`;
            el.style.background = `rgba(255, 232, 150, ${highlightOpacity(
                numClicks
            )})`;
            el.style.position = 'relative';

            // Number of clicks bubble
            // fetch(chrome.runtime.getURL('./components/number.html')).then(r => r.text()).then(html => {
            //     let wrapper = document.createElement('div');
            //     wrapper.style.position = 'absolute';
            //     wrapper.style.bottom = '0px';
            //     wrapper.style.right = '0px';
            //     wrapper.innerHTML = html;
            //     wrapper.childNodes[0].insertAdjacentHTML('beforeend', `<div>${numClicks}</div>`);
            //     el.insertAdjacentElement('beforeend', wrapper);
            // });
        }
    });
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
        tabHostnameData[buttonId]['clicks']++;

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

        const numClicks = tabHostnameData[buttonId]['clicks'];
        if (numClicks >= MIN_CLICKS) {
            // highlight
            el.style.boxShadow = `0px 0px 0px ${borderSize(
                numClicks
            )}px rgba(252, 121, 237, ${highlightOpacity(
                numClicks
            )})`;
        }
    });
}

function borderSize(numClicks) {
    return 3;
    // return Math.min(10, numClicks - MIN_CLICKS + 1);
}

function highlightOpacity(numClicks) {
    return Math.min(numClicks * 0.1, 0.8);
}
