# ZUG-ZWANG API

**Zugzwang API** is a backend part of a future forum created specifically for Chess enjoyers from Chess enjoyers. It was made to provide a platform for experience and knowledge exchange and take up a certain niche for a wonderful community of chess geeks.

This API is build using MVC architectural pattern to effectively work with requests connected to
- users
- posts
- categories
- comments
- likes
- bookmarks
- blocklists

***

# Used Tech Stack
- Node.js + Express (*main code and server creation*)
- MySQL (*database handling*)
- AdminJS (*for implementing an admin panel via opensource service*)
- Express-session (*for controlling user sessions*)
- Cookie-parser (*for handling data saved via cookies*)
- Nodemailer (*for sending password reset and email verification emails*)
- Multer (*for uploading files*)

! Everything will be installed automatically on set-up, the only thing you need to have is **Node.js version 20+ (tested with node v20.19.5-v22)**, **npm version 11+ (tested with npm v11.6.1 & **MySQL server version 8+**

*Quick check in your Terminal*
`node -v`
`npm -v`
`mysql --version` (need to be installed as mysql-server manually with a created root user)
 
**If you don't have it or have the wrong versions**
Use nvm or download and install it directly from browser here: 
[Link](https://nodejs.org/en/blog/release/v22.20.0)

here is a tutorial for nvm install: [Link](https://github.com/nvm-sh/nvm?tab=readme-ov-file)
and MySQL: [Link](https://documentation.ubuntu.com/server/how-to/databases/install-mysql/)
***

# How to set-up and run the application?
In your Terminal:
1. Clone the repository via `git clone ssh://git@git.green-lms.app:22022/challenge-370/mkopniak-6197.git`
2. Enter the project directory `cd mkopniak-6197`
3. Create an .env file in the root directory of the project and drop the following text inside (*only for quick testing, will be removed in later versions*):
***
APP_BASE_URL=http://localhost:4000
SESSION_SECRET=secret-password-for-admin-control

#For e-mail confirmation via SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
EMAIL_FROM="Support" <no-reply@example.com>

#For database setup
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=zug_zwang
DB_USER=mkopniak
DB_PASS=12345678

INIT_DB_USER=root
INIT_DB_PASS=

SKIP_TEST=0
***
**SMTP_USER** should contain your gmail account
**SMTP_PASS** is gmail app password
!If you don't know what this is:
[Link](https://support.google.com/mail/answer/185833?hl=en)
**INIT_DB_PASS** should be your real DB password for your root user
**SKIP_TEST** can be changed to 1 if you don't want to prepopulate database with premade test data
(*The file would probably be hidden by your system by default, press ctrl+h to see) 
3. Run `npm install` (*that should install all of dependencies automatically*)
4. Run `npm run start` to start the server

You should get something like
*OK. Server running on http://localhost:4000*
if setup was successful.

Open this link only if you want to access the admin panel. All normal user API requests
can be done manually via **curl HTTP requests** or special testing softwares like **Postman**
[Link](https://www.postman.com/api-platform/api-testing/)

!If you get something else after npm run start, check if your INIT_DB_PASS matches your actual root mysql pass
!Don't forget to check out **TestData.sql** if you want to work with premade entries in the database.

**To see the list of all avaliable API routes check out docs/APIroutes.md**

# Credits
The API was built and tested with the help of
**Post API Testing**
&
**AdminJS open-source Admin Panel by SoftwareBrothers**
[Link](https://github.com/SoftwareBrothers/adminjs)
