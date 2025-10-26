# ZUG-ZWANG Forum

**ZUGZWANG.com** is a thematic forum created specifically for Chess enjoyers by Chess enjoyers. It was made to provide a platform for communication and knowledge exchange and take up a certain niche for a wonderful community of chess geeks.

This Website is built using a self-designed API and React tools to provide a nice "wrapper" to the functionality of the service both for admins, users and guests. Since ZugZwang is a forum, the service provides the functionality to

- create own posts & comments
- manage account
- browse various categories and profiles
- interact with shared posts

To make the experience comfortable and make it personalized, ZugZwang.com also provides search and filtering options so you always stay in your comfort zone if you want to.

***
# Used Tech Stack
**Backend**
- Node.js + Express (*main code and server creation*)
- MySQL2 (*database handling*)
- bcryptjs (*for password hashing*)
- Express-session (*for controlling user sessions*)
- Cookie-parser (*for handling data saved via cookies*)
- Nodemailer (*for sending password reset and email verification emails*)
- Multer (*for uploading files*)
- cors (*for connecting resources from frontend to backend*)
- dotenv (*for .env configuration*)
**Frontend**
- React 19 Framework + React DOM (*for the single page app UI*)
- Redux Toolkit, React-Redux + Redux Thunk (*for state management and saving*)

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
1. Clone the repository via `git clone ssh://git@git.green-lms.app:22022/challenge-370/mkopniak-6297.git`
2. Enter the project directory `cd mkopniak-6297`
3. Create an .env file in the root directory of the project and drop the following text inside:
---
APP_BASE_URL=http://localhost:4000

JWT_SECRET=
JWT_REFRESH_SECRET=

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
---
**JWT_SECRET** & **JWT_REFRESH_SECRET** should be a random **secure** sequence of words
**SMTP_USER** should contain your gmail account
**SMTP_PASS** is gmail app password
!If you don't know what this is:
[Link](https://support.google.com/mail/answer/185833?hl=en)
**INIT_DB_PASS** should be your real DB password for your root user
**SKIP_TEST** can be changed to 1 if you don't want to prepopulate database with premade test data
(*The file would probably be hidden by your system by default, press ctrl+h to see*)
3. Run `npm install` in the **frontend** directory (*that might take some time, but it'll install react*)
4. Run `npm install` in the **root** directory
5. Run `npm run start` in the **root** directory to start both server and the build of the frontend.

You should get something like
*OK. Server running on http://localhost:4000*
if setup was successful.
Follow this link and you're there.

***
!If you get something else after npm run start, check if your INIT_DB_PASS matches your actual root mysql pass
!Don't forget to check out **API/TestData.sql** if you want to work with premade entries in the database.

---
If you want to log in as an **admin**, input
login: TestAdmin1
email: admin1@example.com
password: password123
---

!!If you want to learn more about navigating on the site itself, checkout the **UserGuide.md**!
