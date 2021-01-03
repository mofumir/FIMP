function handleNotify(request, sender, sendResponse) {
    alert(request.message)
    sendResponse("success")
}

browser.runtime.onMessage.addListener(handleNotify)