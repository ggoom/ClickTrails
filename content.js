// ### Code to replace local storage data ###
// const url = chrome.runtime.getURL('./data/new_data2.json');

// fetch(url)
//     .then((response) => response.json()) //assuming file contains json
//     .then((json) => chrome.storage.local.set(json));
// ### End code ###

const tabURL = new URL(document.location.href.replace(/\/$/, "")); //.split(/[?#]/)[0]
const tabHostname = tabURL.hostname;

chrome.storage.local
    .get(["click_data", "button_data", "mode", "history", "settings"])
    .then((result) => {
        if (
            result["settings"][tabHostname] == null ||
            result["settings"][tabHostname]["active"] === true
        ) {
            // Initialize local storage
            if (result["mode"] == null) {
                result["mode"] = "radioTrailMode";
            }
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
            if (result["settings"][tabHostname] == null) {
                result["settings"][tabHostname] = {
                    active: true,
                };
            }
            chrome.storage.local.set(result);
            const initData = { clicks: 0, mode: 1 };

            const links = document.getElementsByTagName("a");

            const elevated = [];
            Array.from(links).forEach((element) => {
                element.addEventListener("click", (_) => record(element));
                elevateLinks(element, elevated);
            });

            function record(el) {
                const mode = result["mode"];
                if (mode === "radioOff") {
                    return;
                }
                const modeNum = mode === "radioTrailMode" ? 1 : -1;

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
                tabHostnameData[clicked]["clicks"] += modeNum;
                result["click_data"][tabHostname] = tabHostnameData;

                let history = result["history"][tabHostname]["click_data"];
                if (history[clicked] == null) {
                    history[clicked] = [];
                }
                history[clicked].push(modeNum);
                result["history"][tabHostname]["click_data"] = history;
                chrome.storage.local.set(result);
            }

            function elevateLinks(el, elevated) {
                let tabURL;
                try {
                    tabURL = new URL(document.location.href.replace(/\/$/, "")); //.split(/[?#]/)[0]
                } catch (e) {
                    return;
                }
                const tabHostname = tabURL.hostname;

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
                if (elevated.includes(clicked)) {
                    return;
                } else {
                    elevated.push(clicked);
                }

                // const total = Object.values(tabHostnameData).reduce((a, b) => a + b, 0);
                // if (total < 10) {
                //     return;
                // }

                if (tabHostnameData[clicked] == null) {
                    return;
                }
                const numClicks = tabHostnameData[clicked]["clicks"];

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
                }
            }

            // ### BUTTONS ###

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
                const mode = result["mode"];
                if (mode === "radioOff") {
                    return;
                }
                const modeNum = mode === "radioTrailMode" ? 1 : -1;

                let tabHostnameData = result["button_data"][tabHostname];
                if (tabHostnameData[buttonId] == null) {
                    tabHostnameData[buttonId] = initData;
                }

                tabHostnameData[buttonId]["clicks"] += modeNum;
                result["button_data"][tabHostname] = tabHostnameData;

                let history = result["history"][tabHostname]["button_data"];
                if (history[buttonId] == null) {
                    history[buttonId] = [];
                }
                history[buttonId].push(modeNum);
                result["history"][tabHostname]["button_data"] = history;
                chrome.storage.local.set(result);
            }

            function elevateButton(el) {
                let tabURL;
                try {
                    tabURL = new URL(document.location.href.replace(/\/$/, "")); //.split(/[?#]/)[0]
                } catch (e) {
                    return;
                }
                const tabHostname = tabURL.hostname;

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
                }
            }

            function borderSize(numClicks) {
                return 3;
            }

            function highlightOpacity(numClicks) {
                return Math.min(numClicks * 0.1 + 0.1, 0.9);
            }

            function disengageOpacity(numClicks) {
                return Math.max(1.0 + numClicks * 0.1 - 0.1, 0.1);
            }
        }
    });
