# Movie App - README
## Overview
This is a Node.js application built using the Express framework. The application integrates with the OMDb API to fetch movie data and uses MongoDB Atlas as the database. It also includes features for sending emails via Nodemailer and managing sessions with a secret string. All sensitive data is stored in a .env file for security.

## Table of Contents
1. [Prerequisites](#Prerequisites)
2. [Installation](#Installation)
3. [Configuration](#Configuration)
4. [Running the Application](#running-the-application)

### Prerequisites
Before you begin, ensure you have met the following requirements:

* Node.js and npm installed on your machine.
* A MongoDB Atlas account and a cluster set up. Set it up here.
* An OMDb API key. Get it here.
* An email address and app password for Nodemailer. Set it up here.

### Installation
Clone the repository from GitHub:

```bash
git clone https://github.com/yourusername/your-repository.git
cd your-repository
```

Install the dependencies:

```bash
npm install
```

### Configuration
Create a .env file in the root directory of your project:

```bash
touch .env
```

Add the following environment variables to the .env file:

```makefile
PORT=3000
dbUSER=your_db_username
dbPASSWORD=your_db_password
dbNAME=your_db_name
SECRET_STRING=your_session_secret_string
OMDB_API_KEY=your_omdb_api_key
SERVICE=Gmail
MAIL=your_email_address
PASS=your_email_password
```

Configure your MongoDB Atlas connection string:
Replace <username>, <password>, and <dbname> with your MongoDB Atlas cluster credentials and database name.

```php
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/<dbname>?retryWrites=true&w=majority
```
### Running the Application
Make sure you have nodemon installed globally if you want to use it to run the application:

```bash
npm install -g nodemon
```
Run the application with nodemon:

```bash
npm start
```
If you do not have nodemon installed or prefer not to use it, you can start the application manually with:

```bash
node app.js
```

The application will be accessible at http://localhost:3000.