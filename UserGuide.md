# ZUG-ZWANG Forum

Once you've opened http://localhost:4000/, you'll see the main page of the app.



!\[Main page](frontend/screenshots/main\_page.png "Main page")



On the very beginning, you're just a \*\*guest\*\*, but you still can access other people's posts, profiles and comments and navigate through sidebar by the button on the top left.


To create an account, click on your profile right above and click sign in in the drop down menu.



Sidebar is different for different types of users. Once you login with your new account, you additionally gain access to the Bookmarks and Blocklist tabs. If you login as admin, you can also access the \*\*Admin Panel\*\* where all entities can be viewed and undergo \*\*CRUD\*\* operations.



!\[Sidebars](frontend/screenshots/sidebars.png "Sidebars (guest / user / admin)")



!\[Bookmarked posts](frontend/screenshots/bookmarks.png "Bookmarked posts")



!\[Blocked users](frontend/screenshots/blocked.png "Blocked users")



!\[Admin panel](frontend/screenshots/admin\_panel.png "Admin panel")



On the Home page all \*active\* posts are displayed for a regular user except for the posts of the people you've blocked or the people who are blocking you. You have the ability to like, dislike, comment, share and save them. Each post colorful badge reflecting user's rating:

\*\*\*

0-50: Newbie🟢

50-200: Advanced🔵

200-500: Expert🟠

500+ : Grandmaster🔴

\*\*\*

!For presentation purposes, some test users are given a "\*fake rating\*" to show advanced badge, but on the first like/dislike it will be recalculated to the real one. You can see their rating on badge hover.

To go to a user profile you can click on their avatar or nickname. You can copy link to each user's profile or block/unblock them. Admins can additionally remove person's avatar if it's inappropriate and edit their data or delete user.



!\[Profile page](frontend/screenshots/profile.png "Profile page")

Both main page and profile page provide filtering options. You can select category/categories to show the corresponding posts or sort them by date/popularity. Additionally admins can filter to see all inactive posts.



!\[Filter dropdown](frontend/screenshots/filtering.png "Filter dropdown")

!\[Category filter example](frontend/screenshots/filtering2.png "Category filter example")



You can also use search on the header to search for specific words in posts' title/content or users by username/fullname.



!\[Search results](frontend/screenshots/search.png "Search results")



Of course, every user can create and manage their own posts/comments as well as all comments under \*\*their own\*\* posts, so have fun with that! 

