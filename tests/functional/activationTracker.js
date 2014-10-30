define([
	"require",
	"intern",
	"intern!object",
	"intern/chai!assert",
	"intern/dojo/node!leadfoot/keys",
	"intern/dojo/node!leadfoot/helpers/pollUntil"
], function (require, intern, registerSuite, assert, keys, pollUntil) {

	registerSuite({
		name: "activationTracker functional tests",

		setup: function () {
			return this.remote
				.get(require.toUrl("./activationTracker.html"))
				.then(pollUntil("return ready || null;", [],
					intern.config.WAIT_TIMEOUT, intern.config.POLL_INTERVAL));
		},

		beforeEach: function () {
			return this.remote.findById("clearButton")
				.click()
				.end()
				.sleep(100);	// because the clear button clears things on a setTimeout()
		},

		basic: function () {
			this.timeout = intern.config.TEST_TIMEOUT;

			return this.remote
				.findById("first").click().end()
				.findById("activeStack").getProperty("value").then(function (activeStack) {
					assert.strictEqual(activeStack, "form", "activeStack #1");
				}).end()
				.findById("log").getProperty("value").then(function (log) {
					assert.strictEqual(log.trim(), "form activated", "log #1");
				}).end()
				.pressKeys(keys.TAB)	// focus another simple input
				.findById("activeStack").getProperty("value").then(function (activeStack) {
					assert.strictEqual(activeStack, "form", "activeStack #2");
				}).end()
				.findById("log").getProperty("value").then(function (log) {
					// Since the deliteful/Form widget didn't leave the focus chain it
					// shouldn't have any more events besides the original.
					assert.strictEqual(log.trim(), "form activated", "log #2");
				}).end()
				.pressKeys(keys.TAB)	// focus combobox
				.findById("activeStack").getProperty("value").then(function (activeStack) {
					assert.strictEqual(activeStack, "form, fieldset1, combobox", "activeStack #3");
				}).end()
				.findById("log").getProperty("value").then(function (log) {
					assert.strictEqual(log.trim(), "form activated\nfieldset1 activated\ncombobox activated", "log #3");
				}).end()
				.findById("combobox").click().end()	// focus combobox again to check for duplicate notifications
				.findById("activeStackChangeNotifications").getProperty("value").then(function (changes) {
					assert.strictEqual(changes, "2", "activeStack changes #1");
				}).end()
				.findById("editor").click().end()
				.findById("activeStack").getProperty("value").then(function (activeStack) {
					assert.strictEqual(activeStack, "form, editor", "activeStack #4");
				}).end()
				.findById("log").getProperty("value").then(function (log) {
					assert.strictEqual(log.trim(), "form activated\nfieldset1 activated\ncombobox activated\n" +
						"combobox deactivated\nfieldset1 deactivated\neditor activated", "log #4");
				}).end()

				// clicking spinner buttons should activate the spinner, even
				// though there's no actual DOM focus event
				.findByCssSelector("fake-spinner .button").click().end()
				.execute("return atLog;").then(function(log){
					console.log("atLog:\n" + log.join("\n"));
				})
				.findById("activeStack").getProperty("value").then(function (activeStack) {
					assert.strictEqual(activeStack, "form, fieldset2, spinner", "activeStack #5");
				}).end();
		},

		dropdown: function () {
			this.timeout = intern.config.TEST_TIMEOUT;

			return this.remote
				.findById("dropdownButton").click().end()
				.findByCssSelector("fake-popup")
					.isDisplayed().then(function (visible) {
						assert(visible, "popup visible");
					})
					.click()
					.end()
				.findById("activeStack").getProperty("value").then(function (activeStack) {
					assert.strictEqual(activeStack, "form, dropdownButton, popup", "activeStack #1");
				}).end();
		}
	});
});