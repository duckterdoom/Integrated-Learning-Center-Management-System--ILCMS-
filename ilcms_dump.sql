-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: ilcms_db
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `ilcms_db`
--

/*!40000 DROP DATABASE IF EXISTS `ilcms_db`*/;

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `ilcms_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `ilcms_db`;

--
-- Table structure for table `class`
--

DROP TABLE IF EXISTS `class`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `class` (
  `class_id` int NOT NULL AUTO_INCREMENT,
  `course_id` int NOT NULL,
  `class_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `teacher_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `capacity` int NOT NULL DEFAULT '30',
  `status` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Waiting for Activation',
  `created_by` int DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`class_id`),
  KEY `idx_class_course` (`course_id`),
  KEY `fk_class_creator` (`created_by`),
  CONSTRAINT `fk_class_course` FOREIGN KEY (`course_id`) REFERENCES `course` (`course_id`),
  CONSTRAINT `fk_class_creator` FOREIGN KEY (`created_by`) REFERENCES `user` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `class`
--

LOCK TABLES `class` WRITE;
/*!40000 ALTER TABLE `class` DISABLE KEYS */;
INSERT INTO `class` VALUES (1,1,'ENG-2026-01','Nguyen Thi Lan','2026-01-10','2026-04-10',25,'Active',NULL,'2026-04-07 08:39:14'),(2,1,'ENG-2026-02','Tran Van Minh','2026-02-15','2026-05-15',20,'Active',NULL,'2026-04-07 08:39:14'),(3,1,'ENG-2026-03','Le Thi Hoa','2026-04-20','2026-07-20',30,'Waiting for Activation',NULL,'2026-04-07 08:39:14'),(4,2,'MATH-2026-01','Pham Van Duc','2026-02-01','2026-05-01',20,'Active',NULL,'2026-04-07 08:39:14'),(5,2,'MATH-2026-02','Hoang Thi Mai','2026-04-10','2026-07-10',25,'Waiting for Activation',NULL,'2026-04-07 08:39:14'),(6,3,'PROG-2026-01','Nguyen Van Khoa','2026-03-01','2026-06-01',30,'Active',NULL,'2026-04-07 08:39:14'),(7,3,'PROG-2026-02','Bui Thi Thu','2026-05-01','2026-08-01',28,'Waiting for Activation',NULL,'2026-04-07 08:39:14'),(8,4,'DSA-2026-01','Vo Minh Tuan','2026-05-01','2026-08-01',20,'Waiting for Activation',NULL,'2026-04-07 08:39:14'),(9,5,'EOB-2026-01','Nguyen Thi Lan','2026-03-20','2026-06-20',20,'Active',NULL,'2026-04-07 08:39:14'),(10,5,'EOB-2026-02','Tran Thi Bich','2026-05-10','2026-08-10',18,'Waiting for Activation',NULL,'2026-04-07 08:39:14'),(11,8,'COM-2025-01','Le Van Phong','2025-09-01','2026-01-01',30,'Finish',NULL,'2026-04-07 08:39:14'),(12,8,'COM-2025-02','Pham Thi Ngoc','2025-10-01','2026-02-01',25,'Finish',NULL,'2026-04-07 08:39:14');
/*!40000 ALTER TABLE `class` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `course`
--

DROP TABLE IF EXISTS `course`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `course` (
  `course_id` int NOT NULL AUTO_INCREMENT,
  `course_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `tuition_fee` decimal(15,2) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `status` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Wait for active',
  PRIMARY KEY (`course_id`),
  UNIQUE KEY `uq_course_name` (`course_name`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course`
--

LOCK TABLES `course` WRITE;
/*!40000 ALTER TABLE `course` DISABLE KEYS */;
INSERT INTO `course` VALUES (1,'English for Beginners','Foundation English course covering basic grammar, vocabulary, and everyday conversation. Suitable for those starting from scratch.','2026-04-07 08:39:14',3500000.00,'2026-01-10','2026-06-10','Active'),(2,'Advanced Mathematics','In-depth mathematics covering calculus, linear algebra, and statistics for university preparation.','2026-04-07 08:39:14',4200000.00,'2026-02-01','2026-08-01','Active'),(3,'Programming Fundamentals','Introduction to programming using Python. Covers variables, loops, functions, and basic data structures.','2026-04-07 08:39:14',5000000.00,'2026-03-01','2026-09-01','Active'),(4,'Data Science & AI','Comprehensive course on data analysis, machine learning, and AI fundamentals using Python and real-world datasets.','2026-04-07 08:39:14',7500000.00,'2026-04-15','2026-10-15','Wait for active'),(5,'EOB - English for Business','Business English course focusing on professional communication, report writing, and presentation skills.','2026-04-07 08:39:14',4800000.00,'2026-03-20','2026-09-20','Active'),(6,'IELTS Preparation','Intensive IELTS preparation covering all four skills: Listening, Reading, Writing, and Speaking. Target band 6.5+.','2026-04-07 08:39:14',6000000.00,'2026-05-01','2026-11-01','Wait for active'),(7,'Web Development Bootcamp','Full-stack web development with HTML, CSS, JavaScript, React, and Node.js. Includes real project portfolio.','2026-04-07 08:39:14',8000000.00,'2026-06-01','2026-12-01','Wait for active'),(8,'Communication Skills','Practical course to develop interpersonal communication, public speaking, and team collaboration skills.','2026-04-07 08:39:14',3000000.00,'2025-09-01','2026-03-01','Finish');
/*!40000 ALTER TABLE `course` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `passwordresetrequest`
--

DROP TABLE IF EXISTS `passwordresetrequest`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `passwordresetrequest` (
  `request_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Pending',
  `requested_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`request_id`),
  KEY `idx_prr_user_id` (`user_id`),
  KEY `idx_prr_status` (`status`),
  CONSTRAINT `fk_prr_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `passwordresetrequest`
--

LOCK TABLES `passwordresetrequest` WRITE;
/*!40000 ALTER TABLE `passwordresetrequest` DISABLE KEYS */;
INSERT INTO `passwordresetrequest` VALUES (1,2,'Resolved','2026-04-01 16:04:01'),(2,2,'Resolved','2026-04-01 16:09:50');
/*!40000 ALTER TABLE `passwordresetrequest` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role`
--

DROP TABLE IF EXISTS `role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role` (
  `role_id` int NOT NULL AUTO_INCREMENT,
  `role_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`role_id`),
  UNIQUE KEY `uq_role_name` (`role_name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role`
--

LOCK TABLES `role` WRITE;
/*!40000 ALTER TABLE `role` DISABLE KEYS */;
INSERT INTO `role` VALUES (1,'Admin','System administrator with full access'),(2,'Staff','Teaching staff with class management access'),(3,'Sale','Sales staff with student directory access');
/*!40000 ALTER TABLE `role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
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
  KEY `fk_user_role` (`role_id`),
  CONSTRAINT `fk_user_role` FOREIGN KEY (`role_id`) REFERENCES `role` (`role_id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'admin','System Admin','$2b$10$6Ycm9NRJaGzIrvA4yU4kreFVo0fkXk/dBpRUQrUEREKVfa2L4WCwy','admin@ilcms.local',1,'Active','2026-03-20 15:08:34',NULL),(2,'staff','staff','$2b$10$sqQGhtmctw1SyMGASg2Cj.bn/cnfKnBCMABsEwtsaC/EQfo0jm00q','staff@ilcms.local',2,'Active','2026-03-20 15:27:02','2026-04-05 20:35:15'),(3,'sale','sale','$2b$10$dO26nXaZ7yDVKZGpC4qPFuNWwuoLRctZB1gSpeE9PUstoW0xIwmOC','sale@ilcms.local',3,'Active','2026-03-20 16:25:38',NULL),(5,'viet','viet','$2b$10$mNhvpSODEKNBiS3N.RgDQOQC4l8pI05yV/yxqXAw3iGrW/4/0Jl7e','vietcool0205@gmail.com',2,'Active','2026-03-23 15:03:17','2026-03-23 15:08:42'),(6,'staff01','ABC','$2b$10$wS208qWHm81uMOsKn4DRvO8AlWjrsgR.kPWA7clMVaHGzmqCZ6wWO','abc@gmail.com',3,'Active','2026-03-23 23:58:12','2026-03-24 00:12:03'),(7,'staff02','staff02','$2b$10$DuDa.bYGrKAIiSDCTmvXzuhn2ixJqAuvchzi42eea8hhk74C/l/Ja','staff02@ilcms.local',2,'Active','2026-03-24 10:29:48',NULL),(9,'staff03','Nguyen Van A','$2b$10$0X/BlTlzixCKJXU/GBosmehywILSwTgQQV8kU.OV.SOA7yW3vqYrm','staff03@gmail.com',2,'Active','2026-03-31 00:37:43',NULL),(10,'staff04','Nguyen Van B','$2b$10$xVLz1PAtIq7ZZucQnW5NKOHAETNq7dZ.SxnpSSvsnMsf1VGsgPqr6','staff04@gmail.com',2,'Active','2026-03-31 00:38:16',NULL),(11,'staff05','Nguyen Van C','$2b$10$tj8o963V2F2vFTb9PEkzUu2wdQnBzrKHzL9LRj/7jtfeg3EUOFHvS','staff05@gmail.com',2,'Active','2026-03-31 00:38:53',NULL),(12,'staff06','bwiuduwbdwiu','$2b$10$vFVF/5Q3fLdOWIGBs/QeEuBuB.Id3dpV5vUSdbqlSPLCwjc9PN05u','bdwd@gmail.com',2,'Active','2026-03-31 00:40:28',NULL),(13,'staff07','bdwidwq','$2b$10$uuOv/M6uSqXrEcKpsLIGWucWOyNwav/D42uSnB5urQ0F2TiUXWmna','wbwqd@gmail.com',2,'Active','2026-03-31 00:41:05',NULL),(14,'staff08','bwbuiwd','$2b$10$4fytlZPyIFe95CfaigcdEuQVt.FZCu1W45lM0Xk4x4rKXWTwX1JFq','cunui@gmail.com',2,'Active','2026-03-31 00:41:25',NULL),(15,'staff09','byuubdwwd','$2b$10$K.MFtyUPwoqlufUy2E.FMOZb0NAWpD608vXFQ1JVVLyBYcWSghHDG','dbdwd@gmail.com',2,'Active','2026-03-31 00:42:21',NULL),(16,'staff10','beeuew','$2b$10$GB0pqI8z91vuDVEbfRjZ.OjaTTXtBB2NwZ52HUAnbCOq4NhRSS8Bq','uiwdnwd@gmail.com',2,'Active','2026-03-31 00:42:40',NULL),(17,'staff11','neuednweid','$2b$10$xiPkI4UTuQUQzz8O3gDjbeVKt3hW1c7is5agUzhibwbY7D2U0mN.O','dnwdni@gmail.com',2,'Active','2026-03-31 00:43:10',NULL),(18,'staff12','newendiwe','$2b$10$vRot8EmLhAViH.1yYdPc8Ocl2tfzDezB9pm9kDo6AtzLa7SBBp.1W','dwuidnwq@gmail.com',2,'Active','2026-03-31 00:43:44',NULL),(19,'staff13','uiendwwnwq','$2b$10$LM8.Pc7GtwrQwZxh5Fxweey7cV5beGuYvDo8beodsiVlPNhWzj7WC','ndwwdwqoi@gmail.com',2,'Active','2026-03-31 00:44:05',NULL),(20,'staff14','ndwdws','$2b$10$qWv5NBNQgLaIl1CujfUnbO/7632WOmxeVq/mWLYtcSx/UCvjC3wCe','ndwdio@gmail.com',2,'Active','2026-03-31 00:44:25',NULL),(21,'staff15','bundwqwq','$2b$10$m9nvdhiiYc/q31zFIc.xs.HBuWsDNUySRD5HfP7sSvG3WBwEqNKg.','undwniw@gmail.com',2,'Active','2026-03-31 00:44:46',NULL);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'ilcms_db'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-07  8:39:49
