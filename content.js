// ### Code to replace local storage data ###
// const url = chrome.runtime.getURL('./data/new_data2.json');

// fetch(url)
//     .then((response) => response.json()) //assuming file contains json
//     .then((json) => chrome.storage.local.set(json));
// ### End code ###

const tabURL = new URL(document.location.href.replace(/\/$/, "")); //.split(/[?#]/)[0]
const tabHostname = tabURL.hostname.replace(/^www\./,'');

chrome.storage.local
    .get(["click_data", "button_data", "history", "settings"])
    .then((result) => {
        if (
            Object.keys(result).length === 0 ||
            result["settings"][tabHostname] === undefined ||
            result["settings"][tabHostname]["active"] === true
        ) {
            // Initialize local storage
            if (result["click_data"] == null) {
                result["click_data"] = {};
            }
            if (result["click_data"][tabHostname] == null) {
                result["click_data"][tabHostname] = {};
            }
            if (result["button_data"] == null) {
                result["button_data"] = {};
            }
            if (result["button_data"][tabHostname] == null) {
                result["button_data"][tabHostname] = {};
            }
            if (result["history"] == null) {
                result["history"] = {};
            }
            if (result["history"][tabHostname] == null) {
                result["history"][tabHostname] = {
                    click_data: {},
                    button_data: {},
                };
            }
            if (result["settings"] == null) {
                result["settings"] = {};
            }
            if (result["settings"][tabHostname] == null) {
                result["settings"][tabHostname] = {
                    active: true,
                    mode: 1,
                };
            }
            chrome.storage.local.set(result);

            // LINKS
            const links = document.getElementsByTagName("a");

            const elevated = [];
            Array.from(links).forEach((element) => {
                element.addEventListener("click", (_) => recordLink(element, elevated));
                elevateLinks(element, elevated);
            });

            // BUTTONS
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
        }
    });

const initData = { clicks: 0 };

function recordLink(el, elevated) {
    chrome.storage.local
        .get(["click_data", "history", "settings"])
        .then((result) => {
            const mode = result["settings"][tabHostname]["mode"];
            if (mode === 0) {
                // 0 is off
                return;
            }

            const clickedURL = new URL(el.href.replace(/\/$/, ""));
            const clickedURLStr = clickedURL.toString();
            const clickedHostname = clickedURL.hostname;
            const clickedHash = clickedURL.hash;

            let tabHostnameData = result["click_data"][tabHostname];
            const clicked =
                clickedHostname === tabHostname && clickedHash !== ""
                    ? clickedHash
                    : clickedURLStr;
            if (tabHostnameData[clicked] == null) {
                tabHostnameData[clicked] = initData;
            }
            tabHostnameData[clicked]["clicks"] += mode;
            result["click_data"][tabHostname] = tabHostnameData;

            let history = result["history"][tabHostname]["click_data"];
            if (history[clicked] == null) {
                history[clicked] = [];
            }
            history[clicked].push(mode);
            result["history"][tabHostname]["click_data"] = history;
            chrome.storage.local.set(result);
            elevateLinks(el, elevated);
        });
}

function elevateLinks(el, elevated) {
    chrome.storage.local.get(["click_data"]).then((result) => {
        let tabURL;
        try {
            tabURL = new URL(document.location.href.replace(/\/$/, "")); //.split(/[?#]/)[0]
        } catch (e) {
            return;
        }
        const tabHostname = tabURL.hostname.replace(/^www\./,'');

        let tabHostnameData = result["click_data"][tabHostname];
        let clickedURL;
        try {
            clickedURL = new URL(el.href.replace(/\/$/, "")); //.split(/[?#]/)[0]
        } catch (e) {
            return;
        }

        const clickedURLStr = clickedURL.toString();
        const clickedHostname = clickedURL.hostname;
        const clickedHash = clickedURL.hash;
        const clicked =
            clickedHostname === tabHostname && clickedHash !== ""
                ? clickedHash
                : clickedURLStr;
        // if (elevated.includes(clicked)) {
        //     return;
        // } else {
        //     elevated.push(clicked);
        // }

        // const total = Object.values(tabHostnameData).reduce((a, b) => a + b, 0);
        // if (total < 10) {
        //     return;
        // }

        if (tabHostnameData[clicked] == null) {
            return;
        }
        const numClicks = tabHostnameData[clicked]["clicks"];
        console.log(numClicks);
        if (numClicks > 0) {
            // get parent
            // while (el.parentNode.childElementCount === 1) {
            //     el = el.parentNode;
            // }

            // highlight
            el.style.boxShadow = `inset 0px 0px 0px 2px rgba(255, 216, 77, ${highlightOpacity(
                numClicks
            )})`;
            // el.style.background = `rgba(255, 232, 150, ${highlightOpacity(
            //     numClicks
            // )})`;

            // Number of clicks bubble
            // el.style.position = "relative";
            // fetch(chrome.runtime.getURL('./components/number.html')).then(r => r.text()).then(html => {
            //     let wrapper = document.createElement('div');
            //     wrapper.style.position = 'absolute';
            //     wrapper.style.bottom = '0px';
            //     wrapper.style.right = '0px';
            //     wrapper.innerHTML = html;
            //     wrapper.childNodes[0].insertAdjacentHTML('beforeend', `<div>${numClicks}</div>`);
            //     el.insertAdjacentElement('beforeend', wrapper);
            // });
        } else if (numClicks < 0) {
            el.style.opacity = disengageOpacity(numClicks);
        } else {
            el.style.opacity = 1.0;
            el.style.boxShadow = "none";
        }
    });
}

function recordButton(element) {
    chrome.storage.local
        .get(["button_data", "history", "settings"])
        .then((result) => {
            const buttonId = element.id;
            const mode = result["settings"][tabHostname]["mode"];
            if (mode === 0) {
                // 0 is off
                return;
            }

            let tabHostnameData = result["button_data"][tabHostname];
            if (tabHostnameData[buttonId] == null) {
                tabHostnameData[buttonId] = initData;
            }

            tabHostnameData[buttonId]["clicks"] += mode;
            result["button_data"][tabHostname] = tabHostnameData;

            let history = result["history"][tabHostname]["button_data"];
            if (history[buttonId] == null) {
                history[buttonId] = [];
            }
            history[buttonId].push(mode);
            result["history"][tabHostname]["button_data"] = history;
            chrome.storage.local.set(result);
            
            elevateButton(element);
        });
}

function elevateButton(el) {
    chrome.storage.local.get(["button_data"]).then((result) => {
        let tabURL;
        try {
            tabURL = new URL(document.location.href.replace(/\/$/, "")); //.split(/[?#]/)[0]
        } catch (e) {
            return;
        }
        const tabHostname = tabURL.hostname.replace(/^www\./,'');

        const buttonId = el.id;
        if (buttonId === "") {
            return;
        }

        if (result["button_data"] == null) {
            return;
        }
        let tabHostnameData = result["button_data"][tabHostname];
        if (tabHostnameData[buttonId] == null) {
            return;
        }

        // const total = Object.values(tabHostnameData).reduce((a, b) => a + b, 0);
        // if (total < 10) {
        //     return;
        // }

        const numClicks = tabHostnameData[buttonId]["clicks"];
        if (numClicks > 0) {
            // highlight
            el.style.boxShadow = `0px 0px 0px ${borderSize(
                numClicks
            )}px rgba(252, 121, 237, ${highlightOpacity(numClicks)})`;
        } else if (numClicks < 0) {
            el.style.opacity = disengageOpacity(numClicks);
        }  else {
            el.style.opacity = 1.0;
            el.style.boxShadow = "none";
        }
    });
}

function borderSize(numClicks) {
    return 3;
}

function highlightOpacity(numClicks) {
    return Math.min(numClicks * 0.1 + 0.2, 1.0);
}

function disengageOpacity(numClicks) {
    return Math.max(0.8 + numClicks * 0.1, 0.0);
}
