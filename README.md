# storage-frontend

## Requirements
Requires [storage-backend](https://github.com/Toddez/storage-backend) API.

## Installation
``npm install``  
Install node modules

## Running
``npm start``  
Runs development build

``npm run build``  
Builds production build

## Configuration
The following can be configured in an ``.env`` file:
```
REACT_APP_API_URL = url-for-api
```

## Features  
- ### Login/register using:
  - Private id - used to identify user
  - Private key - used to authenticate user and encrypt data
  - 2 factor authentication - required to be added at first login
- ### File explorer
  - Navigation and view of directories
  - Creating/renaming/removing files and directories
  - Uploading files from local machine
  - Uploading files from URL
  - Preview of files
    - Images
    - Markdown
      - Link validation
        - Internal links to other files/directories
        - External links
    - Syntax highlight of code
    - JavaScript execution with output
  - Text editor
    - Syntax highlighting
