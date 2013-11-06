/**
 * iOS Clipboard plugin for PhoneGap
 *
 */


window.clipboardPluginCopy = function(str, success, fail) {
	cordova.exec(success, fail, "ClipboardPlugin", "setText", [str]);
};

window.clipboardPluginPaste = function(success, fail) {
	cordova.exec(success, fail, "ClipboardPlugin", "getText", []);
};