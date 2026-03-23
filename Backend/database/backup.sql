-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               8.0.42 - MySQL Community Server - GPL
-- Server OS:                    Win64
-- HeidiSQL Version:             12.1.0.6537
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Dumping data for table ilcms_db.role: ~3 rows (approximately)
INSERT INTO `role` (`role_id`, `role_name`, `description`) VALUES
	(1, 'Admin', 'System administrator with full access'),
	(2, 'Staff', 'Teaching staff with class management access'),
	(3, 'Sale', 'Sales staff with student directory access');

-- Dumping data for table ilcms_db.user: ~4 rows (approximately)
INSERT INTO `user` (`user_id`, `username`, `full_name`, `password`, `email`, `role_id`, `status`, `created_at`, `password_changed_at`) VALUES
	(1, 'admin', 'System Admin', '$2b$10$6Ycm9NRJaGzIrvA4yU4kreFVo0fkXk/dBpRUQrUEREKVfa2L4WCwy', 'admin@ilcms.local', 1, 'Active', '2026-03-20 15:08:34', NULL),
	(2, 'staff', 'staff', '$2b$10$Vd8eGGNPrXDc0V9QlUfuheibdl6f9/moCoJaph/I98GNb4wzalKQy', 'staff@ilcms.local', 2, 'Active', '2026-03-20 15:27:02', NULL),
	(3, 'sale', 'sale', '$2b$10$dO26nXaZ7yDVKZGpC4qPFuNWwuoLRctZB1gSpeE9PUstoW0xIwmOC', 'sale@ilcms.local', 3, 'Active', '2026-03-20 16:25:38', NULL),
	(5, 'viet', 'viet', '$2b$10$mNhvpSODEKNBiS3N.RgDQOQC4l8pI05yV/yxqXAw3iGrW/4/0Jl7e', 'vietcool0205@gmail.com', 2, 'Active', '2026-03-23 15:03:17', '2026-03-23 15:08:42');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
