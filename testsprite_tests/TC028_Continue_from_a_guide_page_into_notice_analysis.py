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
        # -> navigate
        await page.goto("http://localhost:3000/")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Open the 'SSA-632 guide' page by navigating to /ssa-632-guide.
        await page.goto("http://localhost:3000/ssa-632-guide")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Click the 'Paste it in free' link in the guide callout to start reviewing a notice.
        # Paste it in free link
        elem = page.get_by_role("link", name="Paste it in free")
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> The analysis page is displayed (URL contains '/analyze').
        # Assert-outcome: passed
        # Assert: The browser is on the analysis page URL.
        await expect(page).to_have_url(re.compile("/analyze"), timeout=15000), "The browser is on the analysis page URL."
        
        # --> The paste entry textarea for submitting a notice is present with its placeholder.
        # Assert-outcome: passed
        # Assert: The analysis textarea shows the expected placeholder text.
        await expect(page.get_by_role("textbox", name="Paste the full text of the").nth(0)).to_have_attribute("placeholder", "Paste the full text of the SSA notice here\u2026", timeout=15000), "The analysis textarea shows the expected placeholder text."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    