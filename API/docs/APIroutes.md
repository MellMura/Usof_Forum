# API DOCUMENTATION

**Base URL**: http://localhost:4000
Should be included before all of your requests.

**FOR USERS**:

# Auth Module

* POST /api/auth/register
  Registers a new user
  required parameters: \[login, password, passwordConfirm, email, full\_name]
  optional: status (can be user or admin, user by default)
* POST /api/auth/login
  Allows to log in if the user is registered
  required parameters: \[login, email, password]
  ! Requires your email to verified (*see at the and of the Auth Module*)
  ! if you use curl, don't forget to include **cookies.txt** from now on if you don't wont to log inn again for each action:
  curl -c cookies.txt -X POST http://localhost:4000/api/auth/login
* POST /api/auth/logout
  Logs out current session if it exists.
* POST /api/auth/password-reset
  Allows to send the reset password request, for testing gives a reset token that expires in 30 minutes
  required parameters: \[email (registered one)]
* POST /api/auth/password-reset/:confirm\_token
  Allows to reset the password in the database using the previously received not expired token
  required parameters: \[password, passwordConfirm]
* POST /api/auth/verify-email/send
  Sends an email verification link on a given email
  required parameters: \[email (registered one)]
* POST /api/auth/verify-email/:token
  Confirms email with a token received on verify-email/send or registration
  required parameters: your created token

# User Module

* GET /api/users
  Shows all existing users
  Auth is *not* required
* GET /api/users/:user\_id
  Shows info about a specific user if they exist
  Auth is *not* required
  required parameters: user\_id (integer)
* PATCH /api/users/avatar
  Uploads or changes current user's avatar
  Auth is required
  required parameters: \[avatar (full path to picture)]
  example:
  curl -b cookies.txt -X PATCH http://localhost:4000/api/users/avatar -F "avatar=@/home/user/userprofile.jpg" (if you file is saved to home)
* PATCH /api/users/:user\_id
  Updates current user info
  Auth is required
  allowed parameters: \[login, full\_name, email]

**ADDITIONAL**

* POST /api/users/:user\_id/block
  Blocks specific user to stop seeing their posts or comments and hide your own from them
  Auth is required
  required parameters: user\_id (integer)
* DELETE /api/users/:user\_id/block
  Unblocks specific user
  Auth is required
  required parameters: user\_id (integer)

# Post Module

* GET /api/posts
  Lists all posts except the posts from the blocked users or the users who blocked you with optional filters, sorting and pagination. Doesn't show inactive posts
  Auth is *not* required
  query params (optional):
  page, limit - pagination
  sort - likes (default) or date
  order - asc or desc (default desc)
  categories - comma-separated category names or IDs
  date\_from, date\_to - limit by created date

  example:
  http://localhost:4000/api/posts?page=1\&limit=5\&sort=likes\&order=asc
  http://localhost:4000/api/posts?sort=date\&order=desc
  http://localhost:4000/api/posts?categories=1,2

* GET /api/posts/:post\_id
  Shows a specific post by ID. Doesn't show inactive posts and posts made by users on the blocklist
  Auth is *not* required
  required parameters: post\_id (integer)
* POST /api/posts
  Creates a new post
  Auth is required
  required parameters: \[title, content, categories(names separated by comma)]
  optional parameters: \[status(active by default) and locked(0/false by default)]
* GET /api/posts/:post\_id/comments
  Gets all comments for a specific post except inactive and from blocked authors
  Auth is *not* required
  required parameters: post\_id (integer)
* POST /api/posts/:post\_id/comments
  Creates comment under a specific post
  Auth is required
  required parameters: \[content (shorter than 5000 symbols)]
* GET /api/posts/:post\_id/categories
  Gets all categories of a specific post
  Auth is *not* required
  required parameters: post\_id (integer)
* GET /api/posts/:post\_id/like
  Gets like/dislike counts for a post
  Auth is *not* required
  required parameters: post\_id (integer)
* POST /api/posts/:post\_id/like
  Creates a single like or dislike under a specific post
  Auth is required
  required parameters: post\_id (integer)

  optional: \[type(like/dislike, like on default if not given)]

* PATCH /api/posts/:post\_id
  Updates post info !Only for your own posts
  Auth is required
  allowed parameters: \[title, content, categories(names separated by ,), locked (to restrict some actions)]
* DELETE /api/posts/:post\_id
  Delete post completely !Only for your own posts
  Auth is required
  required parameters: post\_id (integer)
* DELETE /api/posts/:post\_id/like
  Delete your own reaction (like/dislike) under a post
  Auth is required
  required parameters: post\_id (integer)

  **ADDITIONAL**

* POST /api/posts/:post\_id/bookmark
  Adds specific post to saved(bookmarked) once
  Auth is required
  required parameters: post\_id (integer)
* DELETE /api/posts/:post\_id/bookmark
  Removes specific post from saved(bookmarked)
  Auth is required
  required parameters: post\_id (integer)

  # Comment Module

* GET /api/comments/:comment\_id
  Shows a specific comment by ID. Doesn't show inactive comments and comments made by users on the blocklist
  Auth is *not* required
  required parameters: comment\_id (integer)
* POST /api/comments/:comment\_id/like
  Creates a single like or dislike under a specific comment
  Auth is required
  required parameters: comment\_id (integer)

&nbsp;  optional: \[type(like/dislike, like on default if not given)]

* GET /api/comments/:comment\_id/like
  Gets like/dislike counts for a comment
  Auth is *not* required
  required parameters: comment\_id (integer)
* PATCH /api/comments/:comment\_id
  Updates comment info !Only for your own comments
  Auth is required
  allowed parameters: \[content, locked (to restrict some actions)]
* DELETE /api/comments/:comment\_id
  Delete comment completely !Only for your own comments or comments under your posts
  Auth is required
  required parameters: comment\_id (integer)
* DELETE /api/comments/:comment\_id/like
  Delete your own reaction (like/dislike) under a comment
  Auth is required
  required parameters: comment\_id (integer)

  # Category Module

* GET /api/categories
  Lists all existing categories
  Auth is *not* required
* GET /api/categories/:category\_id
  Shows a specific category by ID
  Auth is *not* required
  required parameters: category\_id (integer)
* GET /api/categories/:category\_id/posts
  Shows all posts under a category with optional filters, sorting and pagination. Doesn't show inactive posts
  Auth is *not* required
  query params (optional):
  page, limit - pagination
  sort - likes (default) or date
  order - asc or desc (default desc)
  date\_from, date\_to - limit by created date

  example:
  http://localhost:4000/api/categories/:category\_id/posts?page=1\&limit=5\&sort=likes\&order=asc
  http://localhost:4000/api/categories/:category\_id/posts?sort=date\&order=desc

  # Blocklist Module

* GET /api/blocks
  Shows all users you've blocked
  Auth is required

  # Bookmark Module

* GET /api/bookmarks
  Shows all bookmarks you've saved
  Auth is required

  **FOR ADMINS** (routes or parameters allowed only for status=admin)

  # User Module

* POST /api/users
  Creates a new user
  required parameters: \[login, email, password, full\_name, passwordConfirm]
  optional: \[status (can be user or admin, user by default)]
  !Rating is always 0 by default on creation but can later be updated via patch
* PATCH /api/users/:user\_id
  Updates chosen user info
  allowed parameters: \[login, full\_name, email, rating, status(user/admin)]
* DELETE /api/users/:user\_id/avatar
  Removes user avatar from the database
  required parameters: user\_id
* DELETE /api/users/:user\_id
  Deletes specific user completely
  required parameters: user\_id

  # Post Module

* GET /api/posts
  Lists all posts including inactive ones with possible use of filters, sorting and pagination. Doesn't show inactive posts
  query params (optional):
  page, limit - pagination
  sort - likes (default) or date
  order - asc or desc (default desc)
  categories - comma-separated category names or IDs
  date\_from, date\_to - limit by created date

  example:
  http://localhost:4000/api/posts?page=1\&limit=5\&sort=likes\&order=asc
  http://localhost:4000/api/posts?sort=date\&order=desc
  http://localhost:4000/api/posts?categories=1,2

* PATCH /api/posts/:post\_id/admin
  Updates info of a chosen post
  allowed parameters: \[categories(names separated by ,), locked(to restrict some actions), status(active/inactive)]
* DELETE /api/posts/:post\_id
  Delete chosen post completely
  required parameters: post\_id (integer)

  # Comment Module

* GET /api/posts/:post\_id/comments
  Gets all comments for a specific post even inactive ones
  required parameters: post\_id (integer)
* PATCH /api/comments/:comment\_id/admin
  Updates comment info
  allowed parameters: \[locked(to restrict some actions), status(active/inactive)]
* DELETE /api/comments/:comment\_id
  Deletes chosen comment completely
  required parameters: comment\_id (integer)

  # Category Module

* POST /api/categories
  Creates new category
  required parameters: \[name, description]
* PATCH /api/categories/:category\_id
  Updates an existing category
  allowed parameters: \[name, description]
* DELETE /api/categories/:category\_id
  Deletes an existing category completely
