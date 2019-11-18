//UCF Decision Check
//Written by Jacob Kanfer

function delay(time) {
   return new Promise(function(resolve) {
       setTimeout(resolve, time)
   })
}

async function OCR(path){
  var Tesseract = require('tesseract.js')
  return Tesseract.recognize(path, {lang:'eng'})
}

function textMeDecision(content){
  var request = require('request')

  //Defines TextBelt variables
  var userPhoneNumber = '' //Enter phone number to send admission status too
  var textBeltAPIKey = '' //Enter api key

  //Sends post request to send text message
  request.post('https://textbelt.com/text', {
    form: {
      phone: userPhoneNumber,
      message: content,
      key: textBeltAPIKey,
    },
  }, function(err, httpResponse, body) {
    if (err) {
      console.error('Error:', err)
      return
    }
    console.log(JSON.parse(body))
  })
}

function checkDecisionText(decisionText){
  //Checks if accepted, waitlisted, denied, or not received yet
  if (decisionText.match(/congratulations/i)){
    textMeDecision('Congratulations!! You have been accepted to UCF')
    decisionReceived = true
  }
  else if (decisionText.match(/waitlist/i)) {
    textMeDecision('You have been placed on the waitlist for UCF')
    decisionReceived = true
  }
  else if(decisionText.match(/denied/i)){
    textMeDecision('You have been denied by UCF')
    decisionReceived = true
  }
  else{
    textMeDecision('Decision Not Out Yet')
    decisionReceived = false
  }
  return decisionReceived
}

async function CheckDecision(puppeteer, i, browser){
  //Loads browser in headless mode (Path set for MacOS)
  var browser = await puppeteer.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', slowMo: '10'})

  //Creates incognito browser instance
  const newContext = await browser.createIncognitoBrowserContext()

  //Defines UCF Login
  var username = '' //Enter UCF username
  var password = '' //Enter UCF password

  //Launches new chrome tab
  const page = await browser.newPage()
  await page.setViewport({width:1200, height:814});

  //Launches UCF main page
  await page.goto('https://www.ucf.edu/')

  //Clicks on sign in element
  await page.evaluate(() => {
      document.querySelector('#ucfhb-signon-logo').click()
      document.querySelector('#ucfhb-myucf').click()
    })

  //Loops if not logged in
  while (true){
    //Types in UCF Username
    await page.waitForSelector('.panel #username')
    await page.click('#username')
    await page.type('#username', username)

    //Types in UCF password
    await page.keyboard.press('Tab')
    await page.type('#password', password)

    //Clicks login Button
    await page.keyboard.press('Enter')

    //Enables request interception
    await page.setRequestInterception(true)
    page.on('request', request => {
      //Checks if navigation is requested
      if (!request.isNavigationRequest()) {
        request.continue()
        return
      }
      //Adds refer header for login redirect
      const headers = request.headers()
      headers['referer'] = 'https://idp-prod.cc.ucf.edu/idp/profile/SAML2/Redirect/SSO?execution=e2s1'
      request.continue({ headers })
    })
    //Checks if login was successful
    await page.waitForNavigation()
    const title = await page.title()
    if (title!=='UCF Federated Identity'){
      break
    }
  }
  //Opens Admission Status Page
  await page.goto('https://my.ucf.edu/psp/IHPROD/EMPLOYEE/CSPROD/c/CF_ADM_CUSTOM.CF_HA_UGRD_APPSTAT.GBL?FolderPath=PORTAL_ROOT_OBJECT.FX_STUDENT_SLFSRV_MENU_90.FX_HE90_UNDERGRAD.FX90_UGRD_APPSTATUS&IsFolder=false&IgnoreParamTempl=FolderPath%2cIsFolder')

  //Screenshots decision
  const path = './Decision.jpg'
  await page.screenshot({ path: path, type: 'jpeg', clip: { x: 180, y: 140, width: 700, height: 250} })
  
   //Closes the browser
  browser.close()
  
   //Uses OCR to get decision text
  var rawOCRtext = await OCR(path)
  //Checks the decision text for status
  var decisionReceived = checkDecisionText(Object.values(rawOCRtext)[0])

  //Returns if the decision was received or not
  return decisionReceived
}

(async () => {
  //Defines puppeteer params
  const puppeteer = require('puppeteer-extra')
  const devices = require('puppeteer/DeviceDescriptors')
  const pluginStealth = require('puppeteer-extra-plugin-stealth')
  puppeteer.use(pluginStealth())

  //Loop to run every 12 hours to check for decision status if not already recieved
  var decisionReceived=false
  var i = 1
  while(decisionReceived!==true){
    var browser = browser + i.toString()
    var decisionReceived = await CheckDecision(puppeteer, i, browser)
    i++
    delay(43200000)
  }
})()
