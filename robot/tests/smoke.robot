*** Settings ***
Library    Browser

*** Variables ***
${APP_URL}    http://localhost:5173

*** Test Cases ***
Homepage loads
    New Browser    chromium    headless=False
    New Context
    New Page    ${APP_URL}

    Wait For Elements State    body    visible
    Get Title

    Close Browser