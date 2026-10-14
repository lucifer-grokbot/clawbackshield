import asyncio
import re
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None

    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()

        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",
                "--disable-dev-shm-usage",
                "--ipc=host",
                "--single-process"
            ],
        )

        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        # Wider default timeout to match the agent's DOM-stability budget;
        # auto-waiting Playwright APIs (expect, locator.wait_for) inherit this.
        context.set_default_timeout(15000)

        # Open a new page in the browser context
        page = await context.new_page()

        # Interact with the page elements to simulate user flow
        # -> Open the 'Waiver by phone' guide page (navigate to /waiver-by-phone) so the call-to-action can be located.
        await page.goto("http://localhost:3000/waiver-by-phone")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Click the 'Paste it in free' link in the yellow callout to start the notice analysis flow.
        # Paste it in free link
        elem = page.get_by_role("link", name="Paste it in free")
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> The notice-review paste area is visible with the expected placeholder.
        await page.get_by_role("textbox", name="Paste the full text of the").nth(0).scroll_into_view_if_needed()
        # Assert-outcome: passed
        # Assert: The notice paste textarea is visible with its placeholder.
        await expect(page.get_by_role("textbox", name="Paste the full text of the").nth(0)).to_be_visible(timeout=15000), "The notice paste textarea is visible with its placeholder."
        
        # --> Clicking the guide CTA navigated to the notice-review URL (/analyze).
        # Assert-outcome: passed
        # Assert: The current URL contains '/analyze', indicating the notice-review page is displayed.
        await expect(page).to_have_url(re.compile("/analyze"), timeout=15000), "The current URL contains '/analyze', indicating the notice-review page is displayed."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    