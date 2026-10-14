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
        
        # -> Open the 'Help' page by navigating to /help and load its content.
        await page.goto("http://localhost:3000/help")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # --> Assertions to verify final state
        
        # --> The help page shows the disclaimer that ClawbackShield is not a law firm.
        # Assert-outcome: passed
        # Assert: The help page shows the 'not a law firm' disclaimer.
        await expect(page.locator("form").nth(0)).to_contain_text("I understand ClawbackShield is not a law firm", timeout=15000), "The help page shows the 'not a law firm' disclaimer."
        
        # --> The request-for-help form is present with the primary button 'Request help with my case' visible.
        # Assert-outcome: passed
        # Assert: The primary action button 'Request help with my case' is visible.
        await expect(page.get_by_role("button").nth(0)).to_have_text("Request help with my case", timeout=15000), "The primary action button 'Request help with my case' is visible."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    