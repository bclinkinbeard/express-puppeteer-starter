const express = require('express')
const router = express.Router()
const puppeteer = require('puppeteer')

async function initPuppeteer() {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })
  const page = await browser.newPage()
  return { browser, page }
}

async function goToURL(page, url, options = { waitUntil: 'load' }) {
  console.time(`Go to ${url}`)
  const u = url.startsWith('http') ? url : 'http://' + url
  await page.goto(u, options)
  console.timeEnd(`Go to ${url}`)
}

async function getScreenshotBuffer(page) {
  const bufferPromise = await page.screenshot()

  return bufferPromise
}

async function getScreenshotFromURL(url, width = 800, height = 400) {
  const { browser, page } = await initPuppeteer()
  page.setViewport({ width, height })
  await goToURL(page, url)
  const bufferPromise = await getScreenshotBuffer(page)
  await browser.close()
  return bufferPromise
}

async function getScreenshotOfElementFromURL(
  url,
  selector,
  width = 800,
  height = 400,
) {
  const { browser, page } = await initPuppeteer()
  page.setViewport({ width, height })
  await goToURL(page, url)
  const target = await page.waitForSelector(selector)
  const bufferPromise = await target.screenshot()
  await browser.close()
  return bufferPromise
}

router.get('/page', async function(req, res) {
  const url = req.query.url || 'https://benclinkinbeard.com/d3in5days'
  const { w = 800, h = 400 } = req.query
  const imageBuffer = await getScreenshotFromURL(url, +w, +h)

  await res.type('png').end(imageBuffer, 'binary')
})

router.get('/el', async function(req, res) {
  const url = req.query.url || 'https://benclinkinbeard.com/d3in5days'
  const selector = req.query.selector || '#export-container'
  const { w = 800, h = 400 } = req.query
  const imageBuffer = await getScreenshotOfElementFromURL(url, selector, +w, +h)

  await res.type('png').end(imageBuffer, 'binary')
})

module.exports = router
