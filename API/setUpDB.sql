CREATE DATABASE IF NOT EXISTS zug_zwang;

USE zug_zwang;

CREATE USER IF NOT EXISTS 'mkopniak'@'127.0.0.1' IDENTIFIED BY '12345678';
GRANT ALL PRIVILEGES ON zug_zwang.* TO 'mkopniak'@'127.0.0.1';
FLUSH PRIVILEGES;

CREATE USER IF NOT EXISTS 'mkopniak'@'localhost' IDENTIFIED BY '12345678';
ALTER USER 'mkopniak'@'localhost' IDENTIFIED WITH mysql_native_password BY '12345678';
GRANT ALL PRIVILEGES ON zug_zwang.* TO 'mkopniak'@'localhost';
FLUSH PRIVILEGES;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    login VARCHAR(20) NOT NULL UNIQUE,
    password VARCHAR(60) NOT NULL,
    full_name VARCHAR(60) NOT NULL,
    email VARCHAR(40) NOT NULL UNIQUE,
    email_verified TINYINT(1) NOT NULL DEFAULT 0,
    pic_url VARCHAR(255),
    rating INT NOT NULL DEFAULT 0,
    elo INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status ENUM('admin', 'user') NOT NULL DEFAULT 'user'
);

CREATE TABLE IF NOT EXISTS user_blocks (
    blocker_id INT NOT NULL,
    blocked_id INT NOT NULL,
    PRIMARY KEY (blocker_id, blocked_id),
    FOREIGN KEY (blocker_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (blocked_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reset_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(255) DEFAULT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    used TINYINT(1) NOT NULL DEFAULT 0,
    INDEX i_reset_tokens_token (token),
    INDEX i_reset_tokens_user (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(300)
);

CREATE TABLE IF NOT EXISTS posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    author_id   INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    content TEXT(20000) NOT NULL,
    locked TINYINT(1) NOT NULL DEFAULT 0,
    INDEX i_posts_author (author_id),
    INDEX i_posts_created (created_at),
    INDEX i_posts_status (status),
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS post_categories (
    post_id INT NOT NULL,
    category_id INT NOT NULL,
    PRIMARY KEY (post_id, category_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS comments(
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    parent_id INT NULL,
    author_id INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    content VARCHAR(5000) NOT NULL,
    locked TINYINT(1) NOT NULL DEFAULT 0,
    INDEX i_comments_post (post_id),
    INDEX i_comments_parent (parent_id),
    INDEX i_comments_author (author_id),
    INDEX i_comments_created (created_at),

    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE  ON UPDATE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE  ON UPDATE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS post_likes(
    author VARCHAR(20) NOT NULL,
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    type ENUM('like', 'dislike') NOT NULL DEFAULT 'like',
    PRIMARY KEY (post_id, user_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS comment_likes (
    comment_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    type ENUM('like', 'dislike') NOT NULL DEFAULT 'like',
    PRIMARY KEY (comment_id, user_id),
    FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS post_bookmarks (
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    author  VARCHAR(20) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (post_id, user_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
