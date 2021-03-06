define([], function () {
	var registerSuite = intern.getPlugin("interface.object").registerSuite;
	var assert = intern.getPlugin("chai").assert;
	var keys = requirejs.nodeRequire("@theintern/leadfoot/keys").default;
	var pollUntil = requirejs.nodeRequire("@theintern/leadfoot/helpers/pollUntil").default;

	registerSuite("HasDropDown \"open on hover\" functional tests", {
		before: function () {
			return this.remote
				.get("delite/tests/functional/HasDropDownHover.html")
				.then(pollUntil("return ready || null;", [], intern.config.WAIT_TIMEOUT, intern.config.POLL_INTERVAL));
		},

		tests: {
			basic: {
				"simple open and close": function () {
					// note: check specifically for iOS to workaround https://github.com/theintern/leadfoot/issues/62
					if (!this.remote.environmentType.mouseEnabled ||
						this.remote.environmentType.platformName === "iOS") {
						return this.skip("no hover on mobile devices");
					}

					return this.remote
						.findById("fileMenuItem").moveMouseTo().end()
						.sleep(500)
						.findById("fileMenu").isDisplayed().then(function (visible) {
							assert(visible, "file menu visible");
						}).end()
						.findById("editMenuItem").moveMouseTo().end()
						.sleep(500)
						.findById("fileMenu").isDisplayed().then(function (visible) {
							assert(!visible, "file menu hidden");
						}).end()
						.findById("editMenu").isDisplayed().then(function (visible) {
							assert(visible, "edit menu visible");
						}).end()
						.findById("header").moveMouseTo().end()
						.sleep(500)
						.findById("editMenu").isDisplayed().then(function (visible) {
							assert(!visible, "edit menu hidden");
						}).end();
				},

				"nested open and close": function () {
					// note: check specifically for iOS to workaround https://github.com/theintern/leadfoot/issues/62
					if (!this.remote.environmentType.mouseEnabled ||
						this.remote.environmentType.platformName === "iOS") {
						return this.skip("no hover on mobile devices");
					}

					return this.remote
						.findById("fileMenuItem").moveMouseTo().end()
						.sleep(500)
						.findById("fileMenu").isDisplayed().then(function (visible) {
							assert(visible, "file menu visible");
						}).end()
						.findById("recentsMenuItem").moveMouseTo().end()
						.sleep(500)
						.findById("recentsMenu").isDisplayed().then(function (visible) {
							assert(visible, "recents menu shown");
						}).end()
						.findById("favoritesMenuItem").moveMouseTo().end()
						.sleep(500)
						.findById("recentsMenu").isDisplayed().then(function (visible) {
							assert(!visible, "recents menu hidden");
						}).end()
						.findById("favoritesMenu").isDisplayed().then(function (visible) {
							assert(visible, "favorites menu shown");
						}).end()
						.findById("fileMenuItem").moveMouseTo().end()
						.sleep(500)
						.findById("favoritesMenu").isDisplayed().then(function (visible) {
							assert(!visible, "favorites menu hidden");
						}).end()
						.findById("fileMenu").isDisplayed().then(function (visible) {
							assert(visible, "file menu still visible");
						}).end()
						.findById("header").moveMouseTo().end()
						.sleep(500)
						.findById("fileMenu").isDisplayed().then(function (visible) {
							assert(!visible, "file menu hidden");
						}).end();
				}
			},

			behavior: {
				"touch or mouse": function () {
					return this.remote
						.findById("behaviorButton").click().end()
						.findById("behaviorTooltip").isDisplayed().then(function (visible) {
							assert(visible, "tooltip visible");
						}).end()
						.findByCssSelector("#behaviorTooltip .closeButton").click().end()
						.sleep(1000)	// confirm that tooltip doesn't reopen after 500ms on mobile devices
						.findById("behaviorTooltip").isDisplayed().then(function (visible) {
							assert.isFalse(visible, "tooltip hidden");
						}).end();
				},

				keyboard: function () {
					if (this.remote.environmentType.brokenSendKeys || !this.remote.environmentType.nativeEvents) {
						return this.skip("no keyboard support");
					}

					return this.remote
						.findById("inputBeforeBehaviorButton").click().end()
						.execute("return document.activeElement.id;").then(function (id) {
							assert.strictEqual(id, "inputBeforeBehaviorButton", "focused on inputBeforeBehaviorButton");
						})
						.pressKeys(keys.TAB)
						.execute("return document.activeElement.id;").then(function (id) {
							assert.strictEqual(id, "behaviorButton", "tabbed to button");
						})
						.pressKeys(keys.ENTER)
						.findById("behaviorTooltip").isDisplayed().then(function (visible) {
							assert(visible, "tooltip visible");
						}).end()
						.pressKeys(keys.ESCAPE)
						.execute("return document.activeElement.id;").then(function (id) {
							assert.strictEqual(id, "behaviorButton", "focus returned to button");
						});
				}
			}
		}
	});
});
