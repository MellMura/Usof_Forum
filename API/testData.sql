/* ============================
   PREMADE TEST DATA FOR THE DB
   ============================ */

-- Users
-- Password is a hash of a default 'password123' password. You may reset it if you want
INSERT INTO users (id, login, password, full_name, email, email_verified, pic_url, rating, status)
VALUES
  (1, 'TestAdmin1', '$2b$12$ABQswzRZyKZUjsueTDrL1uUxx8e4u4uKTWFW0tik/1sYEjbDVnrQe', 'Admin One',  'admin1@example.com', 1, NULL, 100, 'admin'),
  (2, 'TestAdmin2', '$2b$12$ABQswzRZyKZUjsueTDrL1uUxx8e4u4uKTWFW0tik/1sYEjbDVnrQe', 'Admin Two',  'admin2@example.com', 1, NULL, 80,  'admin'),
  (3, 'TestUser1',  '$2b$12$ABQswzRZyKZUjsueTDrL1uUxx8e4u4uKTWFW0tik/1sYEjbDVnrQe', 'User One',   'user1@example.com',  1, NULL, 20,  'user'),
  (4, 'TestUser2',  '$2b$12$ABQswzRZyKZUjsueTDrL1uUxx8e4u4uKTWFW0tik/1sYEjbDVnrQe', 'User Two',   'user2@example.com',  0, NULL, 15,  'user'),
  (5, 'TestUser3',  '$2b$12$ABQswzRZyKZUjsueTDrL1uUxx8e4u4uKTWFW0tik/1sYEjbDVnrQe', 'User Three', 'user3@example.com',  1, NULL, 5,   'user')
ON DUPLICATE KEY UPDATE login=VALUES(login);

-- Categories
INSERT INTO categories (id, name, description) VALUES
  (1, 'General', 'General chess discussion'),
  (2, 'News', 'Chess news and updates'),
  (3, 'Strategy', 'Great-to-know practices'),
  (4, 'Tactics', 'Everything about effective openings and puzzles'),
  (5, 'Endgames', 'Endgame theory and practice')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Posts (both locked and unlocked, active and inactive)
INSERT INTO posts (id, author_id, title, status, content, locked)
VALUES
  (1, 1, 'Welcome to ZugZwang', 'active', 'This is a first post on this forum created by your one and only admin team!', 0),
  (2, 2, 'Forum Rules & Etiquette', 'active', 'Please be nice and dont make others hate you on the first day', 1),
  (3, 3, 'My First Tournament', 'inactive', 'I played my first tournament and got the first place, counting from the end of the winners table...', 0),
  (4, 4, 'Help with Sicilian Najdorf','active', 'Looking for good study resources and not some AI explanations.', 0),
  (5, 5, 'Endgame Study #1', 'active', 'Trapping the king is the most important.', 1),
  (6, 3, 'Daily Tactics Thread', 'inactive', 'Post your favorite puzzles here.', 1)
ON DUPLICATE KEY UPDATE title=VALUES(title), status=VALUES(status), content=VALUES(content), locked=VALUES(locked);

-- Post + Categories (each post linked to 1–2 categories)
INSERT INTO post_categories (post_id, category_id) VALUES
  (1,1),(1,2),
  (2,1),
  (3,2),
  (4,3),(4,4),
  (5,5),
  (6,4)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id);

-- Comments (both locked and unlocked, active and inactive)
INSERT INTO comments (id, post_id, parent_id, author_id, status, content, locked)
VALUES
  (1, 1, NULL, 3, 'active', 'Great to be here!', 0),
  (2, 1, NULL, 4, 'active', 'Excited for puzzles. Keep up the good work', 0),
  (3, 2, NULL, 5, 'active', 'Thanks for the rules.', 0),
  (4, 3, NULL, 1, 'inactive', 'We will review this post soon. Please read the pdf', 0),
  (5, 4, NULL, 2, 'active', 'Check the classic books.', 1),
  (6, 5, NULL, 3, 'active', 'Nice endgame theme.', 0),
  (7, 6, NULL, 4, 'inactive', 'I love daily tactics!', 0),
  (8, 1, 1, 5, 'active', 'I could not agree more, omg...', 0),
  (9, 1, 8, 3, 'active', 'I have no idea what are we going to start with', 0),
  (10, 4, NULL, 1, 'active', 'Which "classic books" do you recommend specifically?', 0),
  (11, 4, 10, 2, 'active', 'Start with Chess for Noobs exclusive edition.', 0),
  (12, 2, 3, 2, 'active', 'More rules coming up. Anything unclear so far?', 0),
  (13, 5, 6, 4, 'active', 'Interesting endgame theme—got any Lichess studies to share?', 0)
ON DUPLICATE KEY UPDATE parent_id = VALUES(parent_id), status=VALUES(status), content=VALUES(content), locked=VALUES(locked);

-- Post likes
INSERT INTO post_likes (post_id, user_id, author, type)
VALUES
  (1,3,'TestUser1','like'),
  (1,4,'TestUser2','like'),
  (1,5,'TestUser3','like'),
  (2,3,'TestUser1','dislike'),
  (4,1,'TestAdmin1','like'),
  (4,2,'TestAdmin2','like'),
  (5,3,'TestUser1','like'),
  (5,4,'TestUser2','dislike'),
  (6,5,'TestUser3','like')
ON DUPLICATE KEY UPDATE type=VALUES(type);

-- Comment likes
INSERT INTO comment_likes (comment_id, user_id, type)
VALUES
  (1,1,'like'),
  (1,2,'like'),
  (2,3,'like'),
  (3,4,'like'),
  (4,5,'dislike'),
  (5,3,'like'),
  (6,2,'like')
ON DUPLICATE KEY UPDATE type=VALUES(type);

-- Bookmarks
INSERT INTO post_bookmarks (post_id, user_id, author)
VALUES
  (1,3,'TestUser1'),
  (1,4,'TestUser2'),
  (4,3,'TestUser1'),
  (5,5,'TestUser3'),
  (2,1,'TestAdmin1'),
  (3,2,'TestAdmin2')
ON DUPLICATE KEY UPDATE author=VALUES(author);

-- User blocks
-- example: TestUser1 blocks TestUser2; TestUser2 blocks TestUser3, etc.
INSERT INTO user_blocks (blocker_id, blocked_id)
VALUES
  (3,4),
  (4,5),
  (5,3),
  (1,5),
  (2,4)
ON DUPLICATE KEY UPDATE blocked_id=VALUES(blocked_id);
