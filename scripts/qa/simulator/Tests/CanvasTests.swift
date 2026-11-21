import XCTest
final class CanvasTests: XCTestCase {
    func testScrollingWithSafariControls() throws {
        let safari = XCUIApplication(bundleIdentifier: "com.apple.mobilesafari")
        safari.activate()
        for text in ["Continue", "Not Now", "Start Browsing", "Done"] {
            let button = safari.buttons[text].firstMatch
            if button.exists && button.isHittable { button.tap() }
        }
        let web = safari.webViews.firstMatch
        XCTAssertTrue(web.waitForExistence(timeout: 35))
        let first = web.staticTexts.containing(NSPredicate(format: "label CONTAINS %@", "Review inquiry")).firstMatch
        XCTAssertTrue(first.waitForExistence(timeout: 30))
        func capture(_ name: String) throws {
            Thread.sleep(forTimeInterval: 1)
            _ = try Data(contentsOf: URL(string: "http://127.0.0.1:4173/capture/" + name)!)
        }
        try capture("before-swipe")
        let lower = web.coordinate(withNormalizedOffset: CGVector(dx: 0.55, dy: 0.82))
        let upper = web.coordinate(withNormalizedOffset: CGVector(dx: 0.55, dy: 0.22))
        lower.press(forDuration: 0.05, thenDragTo: upper)
        try capture("after-swipe")
        upper.press(forDuration: 0.05, thenDragTo: lower)
        try capture("reverse-swipe")
    }
}
