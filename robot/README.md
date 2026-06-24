# Robot Framework tests for the React app

This directory contains end-to-end (E2E) browser tests for the React application using:

- [Robot Framework](https://robotframework.org/)
- [robotframework-browser](https://github.com/MarketSquare/robotframework-browser)
- Playwright (via Robot Framework Browser)
- [uv](https://docs.astral.sh/uv/) for Python dependency management

## Why this exists

The main app is a React app, but the E2E/acceptance test layer is kept separate in `robot/`.

This gives us:

- readable browser tests written in Robot Framework
- Playwright-powered browser automation
- isolated Python dependencies that do not affect the React app itself

---

## Requirements

You need:

- **Python** (version compatible with `pyproject.toml`)
- **uv**
- **Node.js**

Node is required because `robotframework-browser` uses Playwright under the hood.

---

## Install

From the repo root:

```bash
cd robot
uv sync
uv run rfbrowser init
```

### What these commands do

#### `uv sync`

Creates/updates the virtual environment and installs Python dependencies from `pyproject.toml` / `uv.lock`.

#### `uv run rfbrowser init`

Installs the Playwright/browser side required by `robotframework-browser`.

Run this again if Browser library dependencies change or if you are setting up the project on a new machine/CI environment.

---

## Running the React app

Start the React app in a separate terminal from the repo root, for example:

```bash
npm run dev
```

Make sure the app is running before starting Robot tests.

---

## Running tests

From the `robot/` directory:

### Run all tests

```bash
uv run robot tests
```

### Run a single suite

```bash
uv run robot tests/smoke.robot
```

### Open the test report

After a run, Robot generates:

- `log.html`
- `report.html`
- `output.xml`

Open `report.html` or `log.html` in your browser.

---

## Test configuration

The tests usually target a locally running frontend app, for example:

- Vite: `http://localhost:5173` (this project)
- CRA / Next.js: `http://localhost:3000`

If the app URL changes, update the test variables/resource file accordingly.

---

## Recommended structure for shared setup

A good pattern is to keep browser/app setup in a shared resource file.

### Example `resources/common.resource`

```robot
*** Settings ***
Library    Browser

*** Variables ***
${APP_URL}    http://localhost:5173

*** Keywords ***
Open App
    New Browser    chromium    headless=False
    New Context
    New Page    ${APP_URL}
    Wait For Elements State    body    visible

Close App
    Close Browser
```

### Example `tests/smoke.robot`

```robot
*** Settings ***
Resource    ../resources/common.resource
Test Setup       Open App
Test Teardown    Close App

*** Test Cases ***
Homepage loads
    Get Title
```

---

## Writing stable selectors

For React apps, prefer stable selectors over brittle CSS paths.

Recommended options:

- accessible labels / roles
- visible text when appropriate
- `data-testid` for critical UI elements

### React example

```jsx
<h1 data-testid="page-title">Welcome</h1>
<button data-testid="login-button">Login</button>
```

### Robot example

```robot
Get Text    [data-testid="page-title"]    ==    Welcome
Click       [data-testid="login-button"]
```

---

## Common commands

From `robot/`:

### Install/update dependencies

```bash
uv sync
```

### Install Browser/Playwright support

```bash
uv run rfbrowser init
```

### To run all tests

```bash
uv run robot tests
```

### Run one file

```bash
uv run robot tests/smoke.robot
```

---

## Troubleshooting

### `Browser` library is installed but tests fail to launch a browser

Run:

```bash
uv run rfbrowser init
```

This is required to install the Playwright/browser side of the stack.

### App is running on the wrong port

Update the `${APP_URL}` value in your resource file or test variables.

---

## CI notes

In CI, the basic flow is:

```bash
cd robot
uv sync
uv run rfbrowser init
uv run robot tests
```

You’ll also need the frontend app available for the tests to hit, either by:

- starting it during CI, or
- pointing tests at a deployed test environment
