# TODO

### Make extension usable on browsers that does not allow the usage of `alert()` from background script

- Currently, this extension will try to send calculated result from background to content script injected in tab, then return/display the result in `alert()` from content script
- if content script was not injected in tab, it will return the result in `alert()` from background script.
- This will not work on firefox as `alert()` is not allowed to be used in background script, and some sites does not allow the injection of content script
