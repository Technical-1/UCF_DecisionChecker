# UCF Decision Checker

A Node.js script that polls UCF's admissions portal every 12 hours and texts you the moment your decision is posted.

I wrote this in November 2019 while waiting on my own UCF undergraduate admission decision. It's the **first project I ever pushed to GitHub** and the one that kicked off everything I've built since — I genuinely could not stand the idea of refreshing a PeopleSoft portal on a schedule when a computer could do it for me. It has not been touched in over six years and is preserved here as-is; the code is a snapshot of how I thought about automation at the very beginning.

## What it does

1. Launches headless Chrome via Puppeteer with the stealth plugin
2. Logs into `my.ucf.edu` through UCF's SAML identity provider
3. Navigates to the undergraduate admission status page
4. Screenshots a fixed region of the decision panel
5. Pre-processes the image with OpenCV (gaussian blur + greyscale) and runs Tesseract OCR
6. Matches the extracted text for "congratulations" / "waitlist" / "denied"
7. Sends an SMS via TextBelt with the result
8. Sleeps 12 hours and repeats until a decision is detected

## Tech Stack

- **Runtime**: Node.js
- **Browser automation**: `puppeteer-extra` + `puppeteer-extra-plugin-stealth`
- **OCR**: `tesseract.js`
- **Image preprocessing**: `opencv4nodejs`
- **SMS gateway**: TextBelt (HTTP API)
- **HTTP client**: `request`

## Getting Started

### Prerequisites

- Node.js (the script was written and tested on Node 10/12-era runtimes; modern Node may need shim work on `opencv4nodejs`)
- Google Chrome installed at `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome` (macOS path is hard-coded — adjust for Linux/Windows)
- A TextBelt API key and the phone number you want texted
- Your UCF NID and password

### Install

```bash
npm install puppeteer puppeteer-extra puppeteer-extra-plugin-stealth tesseract.js opencv4nodejs request
```

### Configure

Open `Checker.js` and fill in:

```js
var userPhoneNumber = ''   // line 26 — phone number for SMS
var textBeltAPIKey  = ''   // line 27 — TextBelt API key
var username        = ''   // line 74 — UCF NID
var password        = ''   // line 75 — UCF password
```

### Run

```bash
node Checker.js
```

The script blocks and loops on its own — leave it running until you get a text.

## Project Structure

```
UCF_DecisionChecker/
├── Checker.js   # Single-file script — login, screenshot, OCR, SMS, polling loop
└── README.md
```

## Status

Archived. Built in 2019, not maintained. Dependency versions, the UCF portal markup, and the SAML flow have all moved on. The repo is kept as the origin point of my automation work — see `.portfolio/` for the engineering write-up.

## License

Unlicensed — personal project, all rights reserved by default. Read it, learn from it; don't ship it.

## Author

Jacob Kanfer — [GitHub](https://github.com/Technical-1)
