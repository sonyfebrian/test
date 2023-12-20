const { Builder, By } = require('selenium-webdriver')
const chrome = require('selenium-webdriver/chrome')


const HOST = 'http://localhost:4567'

const screenSizes = {
	desktop: { width: 1000, height: 800 },
	mobile: { width: 500, height: 600 }
}

describe('Responsive flex website layout', function () {
	let driver

	beforeAll(async () => {
		const options = new chrome.Options().headless()
		driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build()
		await driver.get(HOST)
	})

	afterAll(() => {
		driver.quit()
	})

	for (const screen of Object.keys(screenSizes)) {
		describe(screen, () => {
			beforeEach(() => {
				driver.manage().window().setRect(screenSizes[screen])
			})

			it('should use display flex for layout and keep absolute positioning for template boxes', async () => {
				const layout = await driver.findElement(By.className('layout'))
				const layoutDisplay = await layout.getCssValue('display')
				expect(layoutDisplay).toEqual('flex')

				const boxes = await driver.findElements(By.css('.template .box'))
				for (const box of boxes) {
					const templatePosition = await box.getCssValue('position')
					expect(templatePosition).toEqual('absolute')
				}
			})

			it.each(['header', 'article', 'aside', 'footer'])('should position %s correctly', async (index) => {
				const actual = await driver.findElement(By.css(`.layout .${index}`))
				const template = await driver.findElement(By.css(`.template [data-template-title="${index}"]`))

				const actualRect = await actual.getRect()
				const templateRect = await template.getRect()

				const epsilon = 1
				expect(Math.abs(templateRect.y - actualRect.y)).toBeLessThan(epsilon)
				expect(Math.abs(templateRect.x - actualRect.x)).toBeLessThan(epsilon)

				expect(Math.abs(templateRect.width - actualRect.width)).toBeLessThan(epsilon)
				expect(Math.abs(templateRect.height - actualRect.height)).toBeLessThan(epsilon)
			})
		})
	}
})