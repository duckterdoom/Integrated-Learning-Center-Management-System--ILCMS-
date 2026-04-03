-- ============================================================
-- ILCMS Database Export
-- Generated: 2026-04-03
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;
CREATE DATABASE IF NOT EXISTS `ilcms_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `ilcms_db`;

-- ── Table: Role ────────────────────────────────────────────
DROP TABLE IF EXISTS `Role`;
CREATE TABLE `Role` (
  `role_id` int NOT NULL AUTO_INCREMENT,
  `role_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`role_id`),
  UNIQUE KEY `uq_role_name` (`role_name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `Role` (`role_id`, `role_name`, `description`) VALUES
  (1, 'Admin', 'System administrator with full access'),
  (2, 'Staff', 'Teaching staff with class management access'),
  (3, 'Sale',  'Sales staff with student directory access');

-- ── Table: User ────────────────────────────────────────────
DROP TABLE IF EXISTS `User`;
CREATE TABLE `User` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role_id` int NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `password_changed_at` datetime DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `uq_username` (`username`),
  UNIQUE KEY `uq_email` (`email`),
  KEY `idx_role_id` (`role_id`),
  CONSTRAINT `fk_user_role` FOREIGN KEY (`role_id`) REFERENCES `Role` (`role_id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Passwords: admin=admin123 | staff=staff123 | sale=sale123 | others=Test@1234
INSERT INTO `User` (`user_id`, `username`, `full_name`, `password`, `email`, `role_id`, `status`, `created_at`, `password_changed_at`) VALUES
  (1, 'admin',   'System Admin',  '$2b$10$6Ycm9NRJaGzIrvA4yU4kreFVo0fkXk/dBpRUQrUEREKVfa2L4WCwy', 'admin@ilcms.local',   1, 'Active', '2026-03-20 08:08:34', NULL),
  (2, 'staff',   'Staff User',    '$2b$10$quYximSF3JPQs8Jdgj544uPCuJ3jv1tgu3KlpAfrruhRqPzxYawg.', 'staff@ilcms.local',   2, 'Active', '2026-03-20 08:27:02', NULL),
  (3, 'sale',    'Sale User',     '$2b$10$dO26nXaZ7yDVKZGpC4qPFuNWwuoLRctZB1gSpeE9PUstoW0xIwmOC', 'sale@ilcms.local',    3, 'Active', '2026-03-20 09:25:38', NULL),
  (5, 'staff01', 'Nguyen Van A',  '$2b$10$0X/BlTlzixCKJXU/GBosmehywILSwTgQQV8kU.OV.SOA7yW3vqYrm', 'staff01@gmail.com',   2, 'Active', '2026-03-23 08:03:17', NULL),
  (6, 'staff02', 'Nguyen Van B',  '$2b$10$xVLz1PAtIq7ZZucQnW5NKOHAETNq7dZ.SxnpSSvsnMsf1VGsgPqr6', 'staff02@gmail.com',   2, 'Active', '2026-03-24 03:29:48', NULL),
  (7, 'staff03', 'Nguyen Van C',  '$2b$10$tj8o963V2F2vFTb9PEkzUu2wdQnBzrKHzL9LRj/7jtfeg3EUOFHvS', 'staff03@gmail.com',   2, 'Active', '2026-03-30 17:37:43', NULL),
  (8, 'staff04', 'Tran Thi D',    '$2b$10$mNhvpSODEKNBiS3N.RgDQOQC4l8pI05yV/yxqXAw3iGrW/4/0Jl7e', 'staff04@gmail.com',   2, 'Active', '2026-03-30 17:38:16', NULL),
  (9, 'staff05', 'Tran Thi E',    '$2b$10$DuDa.bYGrKAIiSDCTmvXzuhn2ixJqAuvchzi42eea8hhk74C/l/Ja', 'staff05@gmail.com',   2, 'Active', '2026-03-30 17:38:53', NULL),
  (10, 'sale01', 'Le Van F',      '$2b$10$wS208qWHm81uMOsKn4DRvO8AlWjrsgR.kPWA7clMVaHGzmqCZ6wWO', 'sale01@gmail.com',    3, 'Active', '2026-03-30 17:40:28', NULL),
  (11, 'sale02', 'Le Thi G',      '$2b$10$uuOv/M6uSqXrEcKpsLIGWucWOyNwav/D42uSnB5urQ0F2TiUXWmna', 'sale02@gmail.com',    3, 'Active', '2026-03-30 17:41:05', NULL);

-- ── Table: PasswordResetRequest ────────────────────────────
DROP TABLE IF EXISTS `PasswordResetRequest`;
CREATE TABLE `PasswordResetRequest` (
  `request_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Pending',
  `requested_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`request_id`),
  KEY `idx_prr_user_id` (`user_id`),
  KEY `idx_prr_status` (`status`),
  CONSTRAINT `fk_prr_user` FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- No data — starts empty for fresh testing

SET FOREIGN_KEY_CHECKS = 1;

-- Export complete.
