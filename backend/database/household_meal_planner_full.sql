-- =========================================================
-- DATABASE EXPORT: household_meal_planner
-- Generated At: 2026-10-24T15:08:54.714Z
-- All-in-one Single File: Schema (22 Tabel) + Seed & Data Aktual
-- Kompatibel: phpMyAdmin, MySQL Workbench, DBeaver, MySQL CLI
-- =========================================================

CREATE DATABASE IF NOT EXISTS `household_meal_planner` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `household_meal_planner`;

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';
SET NAMES utf8mb4;

-- ---------------------------------------------------------
-- Table structure for `dataset_import_jobs`
-- ---------------------------------------------------------
DROP TABLE IF EXISTS `dataset_import_jobs`;
CREATE TABLE `dataset_import_jobs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `dataset_source_id` int DEFAULT NULL,
  `triggered_by` int DEFAULT NULL,
  `filename` varchar(255) DEFAULT NULL,
  `file_size_bytes` bigint DEFAULT NULL,
  `file_format` enum('CSV','JSON','XLSX','OTHER') DEFAULT 'CSV',
  `status` enum('PENDING','PROCESSING','COMPLETED','FAILED','ROLLED_BACK') DEFAULT 'PENDING',
  `total_rows` int DEFAULT '0',
  `processed_rows` int DEFAULT '0',
  `valid_rows` int DEFAULT '0',
  `invalid_rows` int DEFAULT '0',
  `duplicate_rows` int DEFAULT '0',
  `review_rows` int DEFAULT '0',
  `error_summary` json DEFAULT NULL,
  `started_at` datetime DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `dataset_source_id` (`dataset_source_id`),
  KEY `triggered_by` (`triggered_by`),
  CONSTRAINT `dataset_import_jobs_ibfk_1` FOREIGN KEY (`dataset_source_id`) REFERENCES `dataset_sources` (`id`) ON DELETE SET NULL,
  CONSTRAINT `dataset_import_jobs_ibfk_2` FOREIGN KEY (`triggered_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ---------------------------------------------------------
-- Table structure for `dataset_sources`
-- ---------------------------------------------------------
DROP TABLE IF EXISTS `dataset_sources`;
CREATE TABLE `dataset_sources` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `type` enum('RECIPES','NUTRITION','PRICES','EQUIPMENT','OTHER') NOT NULL,
  `description` text,
  `source_url` varchar(500) DEFAULT NULL,
  `license` varchar(200) DEFAULT NULL,
  `version` varchar(50) DEFAULT NULL,
  `notes` text,
  `status` enum('NOT_IMPORTED','IMPORTED','PARTIALLY_IMPORTED','FAILED','ACTIVE') DEFAULT 'NOT_IMPORTED',
  `record_count` int DEFAULT '0',
  `valid_count` int DEFAULT '0',
  `review_count` int DEFAULT '0',
  `invalid_count` int DEFAULT '0',
  `last_imported_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table `dataset_sources` (5 rows)
INSERT INTO `dataset_sources` (`id`, `name`, `slug`, `type`, `description`, `source_url`, `license`, `version`, `notes`, `status`, `record_count`, `valid_count`, `review_count`, `invalid_count`, `last_imported_at`, `created_at`, `updated_at`) VALUES
(1, 'Seed Data Internal (20 Resep)', 'fatrur-seed-v1', 'RECIPES', 'Data seed bawaan aplikasi Fatrur berisi 20 resep Indonesia dasar untuk pengujian awal algoritma MILP dan Rule-Based Filtering.', NULL, 'Internal', 'v1.0', 'Harga dan nutrisi merupakan estimasi untuk pengujian. Bukan data pasar aktual.', 'ACTIVE', 20, 20, 0, 0, NULL, '2026-10-10 10:13:39', '2026-10-10 10:13:39'),
(2, 'Mendeley Indonesian Culinary Recipes v3', 'mendeley-indonesian-recipes-v3', 'RECIPES', 'Dataset analisis nutrisi dan profil makro-mikro resep kuliner Indonesia dari Mendeley Data.', 'https://data.mendeley.com/datasets/8b4ztns76h/3', 'CC BY 4.0', 'v3', 'Perlu verifikasi format file dan kolom sebelum impor. Periksa kelengkapan data nutrisi per resep.', 'NOT_IMPORTED', 0, 0, 0, 0, NULL, '2026-10-10 10:13:39', '2026-10-10 10:13:39'),
(3, 'LorthGyu Indonesian Recipes (HuggingFace)', 'huggingface-lorthgyu-indonesian', 'RECIPES', 'Dataset resep Indonesia dari HuggingFace community.', 'https://huggingface.co/datasets/LorthGyu/indonesian-recipes', 'Unknown — verifikasi sebelum digunakan', 'unknown', 'Perlu validasi lisensi dan pemeriksaan kolom sebelum digunakan dalam produksi.', 'NOT_IMPORTED', 0, 0, 0, 0, NULL, '2026-10-10 10:13:39', '2026-10-10 10:13:39'),
(4, 'TKPI 2020 — Tabel Komposisi Pangan Indonesia', 'kemkes-tkpi-2020', 'NUTRITION', 'Tabel komposisi pangan resmi Kemenkes RI (2020). Nilai gizi per 100g ratusan bahan pangan Indonesia.', 'https://repository.kemkes.go.id/book/668', 'Pemerintah RI — verifikasi ketentuan penggunaan', '2020', 'Sumber nutrisi resmi. Perlu pemetaan nama bahan dari resep ke nama TKPI. Banyak sinonim harus diselesaikan manual.', 'NOT_IMPORTED', 0, 0, 0, 0, NULL, '2026-10-10 10:13:39', '2026-10-10 10:13:39'),
(5, 'Data Harga Pasar (Manual Upload)', 'market-prices-manual', 'PRICES', 'Data harga bahan pangan dikumpulkan secara manual atau dari sumber terpercaya.', NULL, 'Internal', NULL, 'Admin dapat unggah CSV harga. Tanpa metadata lokasi dan tanggal, data tidak boleh digunakan sebagai harga aktual.', 'NOT_IMPORTED', 0, 0, 0, 0, NULL, '2026-10-10 10:13:39', '2026-10-10 10:13:39');

-- ---------------------------------------------------------
-- Table structure for `equipment`
-- ---------------------------------------------------------
DROP TABLE IF EXISTS `equipment`;
CREATE TABLE `equipment` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table `equipment` (20 rows)
INSERT INTO `equipment` (`id`, `name`, `description`, `created_at`) VALUES
(1, 'Kompor Gas', 'Kompor dengan bahan bakar gas', '2026-09-30 06:47:23'),
(2, 'Rice Cooker', 'Alat masak nasi otomatis', '2026-09-30 06:47:23'),
(3, 'Wajan', 'Wajan penggorengan serbaguna', '2026-09-30 06:47:23'),
(4, 'Panci', 'Panci untuk merebus dan memasak sup', '2026-09-30 06:47:23'),
(5, 'Oven', 'Oven untuk memanggang', '2026-09-30 06:47:23'),
(6, 'Blender', 'Blender untuk membuat jus dan saus', '2026-09-30 06:47:23'),
(7, 'Kukusan', 'Alat untuk mengukus makanan', '2026-09-30 06:47:23'),
(8, 'Talenan', 'Alas untuk memotong bahan', '2026-09-30 06:47:23'),
(9, 'Parutan', 'Alat untuk memarut kelapa dan keju', '2026-09-30 06:47:23'),
(10, 'Pressure Cooker', 'Panci tekanan untuk memasak cepat', '2026-09-30 06:47:23'),
(11, 'Kompor Gas', 'Kompor dengan bahan bakar gas', '2026-10-10 09:31:38'),
(12, 'Rice Cooker', 'Alat masak nasi otomatis', '2026-10-10 09:31:38'),
(13, 'Wajan', 'Wajan penggorengan serbaguna', '2026-10-10 09:31:38'),
(14, 'Panci', 'Panci untuk merebus dan memasak sup', '2026-10-10 09:31:38'),
(15, 'Oven', 'Oven untuk memanggang', '2026-10-10 09:31:38'),
(16, 'Blender', 'Blender untuk membuat jus dan saus', '2026-10-10 09:31:38'),
(17, 'Kukusan', 'Alat untuk mengukus makanan', '2026-10-10 09:31:38'),
(18, 'Talenan', 'Alas untuk memotong bahan', '2026-10-10 09:31:38'),
(19, 'Parutan', 'Alat untuk memarut kelapa dan keju', '2026-10-10 09:31:38'),
(20, 'Pressure Cooker', 'Panci tekanan untuk memasak cepat', '2026-10-10 09:31:38');

-- ---------------------------------------------------------
-- Table structure for `family_members`
-- ---------------------------------------------------------
DROP TABLE IF EXISTS `family_members`;
CREATE TABLE `family_members` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `age` int NOT NULL,
  `gender` enum('MALE','FEMALE') NOT NULL,
  `weight` float NOT NULL,
  `height` float NOT NULL,
  `activity_level` enum('SEDENTARY','LIGHTLY_ACTIVE','MODERATELY_ACTIVE','VERY_ACTIVE','EXTRA_ACTIVE') NOT NULL DEFAULT 'MODERATELY_ACTIVE',
  `daily_calories_target` float NOT NULL,
  `daily_protein_target` float NOT NULL,
  `daily_fat_target` float NOT NULL,
  `daily_carbs_target` float NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `family_members_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table `family_members` (3 rows)
INSERT INTO `family_members` (`id`, `user_id`, `name`, `age`, `gender`, `weight`, `height`, `activity_level`, `daily_calories_target`, `daily_protein_target`, `daily_fat_target`, `daily_carbs_target`, `created_at`, `updated_at`) VALUES
(2, 9, 'ayah', 24, 'MALE', 80, 165, 'MODERATELY_ACTIVE', 2660, 64, 73.9, 365.8, '2026-10-24 13:44:03', '2026-10-24 13:44:03'),
(3, 9, 'ibu', 25, 'FEMALE', 45, 158, 'MODERATELY_ACTIVE', 1785, 36, 49.6, 245.4, '2026-10-24 13:45:09', '2026-10-24 13:45:09'),
(4, 9, 'anak', 1, 'MALE', 12, 80, 'SEDENTARY', 744, 9.6, 20.7, 102.3, '2026-10-24 13:45:41', '2026-10-24 13:45:41');

-- ---------------------------------------------------------
-- Table structure for `ingredient_mappings`
-- ---------------------------------------------------------
DROP TABLE IF EXISTS `ingredient_mappings`;
CREATE TABLE `ingredient_mappings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `source_name` varchar(200) NOT NULL,
  `source_id` int DEFAULT NULL,
  `mapped_ingredient_id` int DEFAULT NULL,
  `confidence` float DEFAULT '0',
  `method` enum('EXACT','FUZZY','MANUAL','UNMATCHED') DEFAULT 'FUZZY',
  `status` enum('PENDING','APPROVED','REJECTED','NEEDS_REVIEW') DEFAULT 'PENDING',
  `reviewed_by` int DEFAULT NULL,
  `reviewed_at` datetime DEFAULT NULL,
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_source_mapping` (`source_name`(100),`source_id`),
  KEY `source_id` (`source_id`),
  KEY `mapped_ingredient_id` (`mapped_ingredient_id`),
  KEY `reviewed_by` (`reviewed_by`),
  CONSTRAINT `ingredient_mappings_ibfk_1` FOREIGN KEY (`source_id`) REFERENCES `dataset_sources` (`id`) ON DELETE SET NULL,
  CONSTRAINT `ingredient_mappings_ibfk_2` FOREIGN KEY (`mapped_ingredient_id`) REFERENCES `ingredients` (`id`) ON DELETE SET NULL,
  CONSTRAINT `ingredient_mappings_ibfk_3` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ---------------------------------------------------------
-- Table structure for `ingredient_nutrition`
-- ---------------------------------------------------------
DROP TABLE IF EXISTS `ingredient_nutrition`;
CREATE TABLE `ingredient_nutrition` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ingredient_id` int NOT NULL,
  `calories` float NOT NULL DEFAULT '0',
  `protein` float NOT NULL DEFAULT '0',
  `fat` float NOT NULL DEFAULT '0',
  `carbs` float NOT NULL DEFAULT '0',
  `source_id` int DEFAULT NULL,
  `per_unit_weight` float DEFAULT NULL,
  `data_status` enum('SEED','VERIFIED','ESTIMATED','MISSING') DEFAULT 'SEED',
  `missing_fields` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ingredient_id` (`ingredient_id`),
  CONSTRAINT `ingredient_nutrition_ibfk_1` FOREIGN KEY (`ingredient_id`) REFERENCES `ingredients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table `ingredient_nutrition` (60 rows)
INSERT INTO `ingredient_nutrition` (`id`, `ingredient_id`, `calories`, `protein`, `fat`, `carbs`, `source_id`, `per_unit_weight`, `data_status`, `missing_fields`) VALUES
(1, 1, 3.6, 0.07, 0.005, 0.79, 1, NULL, 'SEED', NULL),
(2, 2, 2.15, 0.185, 0.14, 0, 1, NULL, 'SEED', NULL),
(3, 3, 70, 6, 5, 0.4, 1, NULL, 'SEED', NULL),
(4, 4, 0.76, 0.08, 0.045, 0.019, 1, NULL, 'SEED', NULL),
(5, 5, 1.99, 0.19, 0.077, 0.099, 1, NULL, 'SEED', NULL),
(6, 6, 0.23, 0.029, 0.004, 0.036, 1, NULL, 'SEED', NULL),
(7, 7, 0.19, 0.026, 0.003, 0.033, 1, NULL, 'SEED', NULL),
(8, 8, 0.41, 0.009, 0.002, 0.096, 1, NULL, 'SEED', NULL),
(9, 9, 0.77, 0.02, 0.001, 0.17, 1, NULL, 'SEED', NULL),
(10, 10, 8.8, 0, 1, 0, 1, NULL, 'SEED', NULL),
(11, 11, 0.4, 0.011, 0.001, 0.09, 1, NULL, 'SEED', NULL),
(12, 12, 1.49, 0.063, 0.005, 0.331, 1, NULL, 'SEED', NULL),
(13, 13, 0.31, 0.015, 0.003, 0.06, 1, NULL, 'SEED', NULL),
(14, 14, 0.18, 0.009, 0.002, 0.039, 1, NULL, 'SEED', NULL),
(15, 15, 2.62, 0.028, 0, 0.64, 1, NULL, 'SEED', NULL),
(16, 16, 0, 0, 0, 0, 1, NULL, 'SEED', NULL),
(17, 17, 3.87, 0, 0, 1, 1, NULL, 'SEED', NULL),
(18, 18, 2.3, 0.023, 0.241, 0.06, 1, NULL, 'SEED', NULL),
(19, 19, 2.17, 0.424, 0.03, 0, 1, NULL, 'SEED', NULL),
(20, 20, 0.85, 0.18, 0.009, 0.009, 1, NULL, 'SEED', NULL),
(21, 21, 2.5, 0.26, 0.15, 0, 1, NULL, 'SEED', NULL),
(22, 22, 0.55, 0.05, 0.03, 0.02, 1, NULL, 'SEED', NULL),
(23, 23, 1.38, 0.045, 0.02, 0.277, 1, NULL, 'SEED', NULL),
(24, 24, 0.25, 0.013, 0.001, 0.059, 1, NULL, 'SEED', NULL),
(25, 25, 0.32, 0.018, 0.003, 0.073, 1, NULL, 'SEED', NULL),
(26, 26, 0.8, 0.018, 0.008, 0.178, 1, NULL, 'SEED', NULL),
(27, 27, 3.12, 0.094, 0.1, 0.674, 1, NULL, 'SEED', NULL),
(28, 28, 2.98, 0.124, 0.178, 0.55, 1, NULL, 'SEED', NULL),
(29, 29, 105, 1.3, 0.4, 27, 1, NULL, 'SEED', NULL),
(30, 30, 3.89, 0.17, 0.07, 0.66, 1, NULL, 'SEED', NULL),
(31, 31, 3.6, 0.07, 0.005, 0.79, 1, NULL, 'SEED', NULL),
(32, 32, 2.15, 0.185, 0.14, 0, 1, NULL, 'SEED', NULL),
(33, 33, 70, 6, 5, 0.4, 1, NULL, 'SEED', NULL),
(34, 34, 0.76, 0.08, 0.045, 0.019, 1, NULL, 'SEED', NULL),
(35, 35, 1.99, 0.19, 0.077, 0.099, 1, NULL, 'SEED', NULL),
(36, 36, 0.23, 0.029, 0.004, 0.036, 1, NULL, 'SEED', NULL),
(37, 37, 0.19, 0.026, 0.003, 0.033, 1, NULL, 'SEED', NULL),
(38, 38, 0.41, 0.009, 0.002, 0.096, 1, NULL, 'SEED', NULL),
(39, 39, 0.77, 0.02, 0.001, 0.17, 1, NULL, 'SEED', NULL),
(40, 40, 8.8, 0, 1, 0, 1, NULL, 'SEED', NULL),
(41, 41, 0.4, 0.011, 0.001, 0.09, 1, NULL, 'SEED', NULL),
(42, 42, 1.49, 0.063, 0.005, 0.331, 1, NULL, 'SEED', NULL),
(43, 43, 0.31, 0.015, 0.003, 0.06, 1, NULL, 'SEED', NULL),
(44, 44, 0.18, 0.009, 0.002, 0.039, 1, NULL, 'SEED', NULL),
(45, 45, 2.62, 0.028, 0, 0.64, 1, NULL, 'SEED', NULL),
(46, 46, 0, 0, 0, 0, 1, NULL, 'SEED', NULL),
(47, 47, 3.87, 0, 0, 1, 1, NULL, 'SEED', NULL),
(48, 48, 2.3, 0.023, 0.241, 0.06, 1, NULL, 'SEED', NULL),
(49, 49, 2.17, 0.424, 0.03, 0, 1, NULL, 'SEED', NULL),
(50, 50, 0.85, 0.18, 0.009, 0.009, 1, NULL, 'SEED', NULL),
(51, 51, 2.5, 0.26, 0.15, 0, 1, NULL, 'SEED', NULL),
(52, 52, 0.55, 0.05, 0.03, 0.02, 1, NULL, 'SEED', NULL),
(53, 53, 1.38, 0.045, 0.02, 0.277, 1, NULL, 'SEED', NULL),
(54, 54, 0.25, 0.013, 0.001, 0.059, 1, NULL, 'SEED', NULL),
(55, 55, 0.32, 0.018, 0.003, 0.073, 1, NULL, 'SEED', NULL),
(56, 56, 0.8, 0.018, 0.008, 0.178, 1, NULL, 'SEED', NULL),
(57, 57, 3.12, 0.094, 0.1, 0.674, 1, NULL, 'SEED', NULL),
(58, 58, 2.98, 0.124, 0.178, 0.55, 1, NULL, 'SEED', NULL),
(59, 59, 105, 1.3, 0.4, 27, 1, NULL, 'SEED', NULL),
(60, 60, 3.89, 0.17, 0.07, 0.66, 1, NULL, 'SEED', NULL);

-- ---------------------------------------------------------
-- Table structure for `ingredient_prices`
-- ---------------------------------------------------------
DROP TABLE IF EXISTS `ingredient_prices`;
CREATE TABLE `ingredient_prices` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ingredient_id` int NOT NULL,
  `price` float NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `source_id` int DEFAULT NULL,
  `market_area` varchar(100) DEFAULT NULL,
  `price_date` date DEFAULT NULL,
  `data_status` enum('SEED','VALID','ESTIMATED','MISSING') DEFAULT 'SEED',
  PRIMARY KEY (`id`),
  KEY `ingredient_id` (`ingredient_id`),
  CONSTRAINT `ingredient_prices_ibfk_1` FOREIGN KEY (`ingredient_id`) REFERENCES `ingredients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table `ingredient_prices` (60 rows)
INSERT INTO `ingredient_prices` (`id`, `ingredient_id`, `price`, `created_at`, `updated_at`, `source_id`, `market_area`, `price_date`, `data_status`) VALUES
(1, 1, 0.15, '2026-09-30 06:47:24', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED'),
(2, 2, 0.35, '2026-09-30 06:47:24', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED'),
(3, 3, 2000, '2026-09-30 06:47:24', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED'),
(4, 4, 0.08, '2026-09-30 06:47:24', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED'),
(5, 5, 0.06, '2026-09-30 06:47:24', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED'),
(6, 6, 0.03, '2026-09-30 06:47:24', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED'),
(7, 7, 0.025, '2026-09-30 06:47:24', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED'),
(8, 8, 0.04, '2026-09-30 06:47:24', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED'),
(9, 9, 0.07, '2026-09-30 06:47:24', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED'),
(10, 10, 0.02, '2026-09-30 06:47:24', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED'),
(11, 11, 0.08, '2026-09-30 06:47:24', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED'),
(12, 12, 0.06, '2026-09-30 06:47:24', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED'),
(13, 13, 0.05, '2026-09-30 06:47:24', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED'),
(14, 14, 0.04, '2026-09-30 06:47:24', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED'),
(15, 15, 0.03, '2026-09-30 06:47:24', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED'),
(16, 16, 0.005, '2026-09-30 06:47:24', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED'),
(17, 17, 0.01, '2026-09-30 06:47:24', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED'),
(18, 18, 0.015, '2026-09-30 06:47:24', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED'),
(19, 19, 0.2, '2026-09-30 06:47:24', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED'),
(20, 20, 0.45, '2026-09-30 06:47:24', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED'),
(21, 21, 0.65, '2026-09-30 06:47:24', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED'),
(22, 22, 0.07, '2026-09-30 06:47:24', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED'),
(23, 23, 0.1, '2026-09-30 06:47:24', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED'),
(24, 24, 0.02, '2026-09-30 06:47:24', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED'),
(25, 25, 0.04, '2026-09-30 06:47:24', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED'),
(26, 26, 0.05, '2026-09-30 06:47:24', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED'),
(27, 27, 0.04, '2026-09-30 06:47:24', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED'),
(28, 28, 0.06, '2026-09-30 06:47:24', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED'),
(29, 29, 2000, '2026-09-30 06:47:24', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED'),
(30, 30, 0.12, '2026-09-30 06:47:24', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED'),
(31, 31, 0.15, '2026-10-10 09:31:38', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED'),
(32, 32, 0.35, '2026-10-10 09:31:38', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED'),
(33, 33, 2000, '2026-10-10 09:31:38', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED'),
(34, 34, 0.08, '2026-10-10 09:31:38', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED'),
(35, 35, 0.06, '2026-10-10 09:31:38', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED'),
(36, 36, 0.03, '2026-10-10 09:31:38', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED'),
(37, 37, 0.025, '2026-10-10 09:31:38', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED'),
(38, 38, 0.04, '2026-10-10 09:31:38', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED'),
(39, 39, 0.07, '2026-10-10 09:31:38', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED'),
(40, 40, 0.02, '2026-10-10 09:31:38', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED'),
(41, 41, 0.08, '2026-10-10 09:31:38', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED'),
(42, 42, 0.06, '2026-10-10 09:31:38', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED'),
(43, 43, 0.05, '2026-10-10 09:31:38', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED'),
(44, 44, 0.04, '2026-10-10 09:31:38', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED'),
(45, 45, 0.03, '2026-10-10 09:31:38', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED'),
(46, 46, 0.005, '2026-10-10 09:31:38', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED'),
(47, 47, 0.01, '2026-10-10 09:31:38', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED'),
(48, 48, 0.015, '2026-10-10 09:31:38', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED'),
(49, 49, 0.2, '2026-10-10 09:31:38', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED'),
(50, 50, 0.45, '2026-10-10 09:31:38', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED'),
(51, 51, 0.65, '2026-10-10 09:31:38', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED'),
(52, 52, 0.07, '2026-10-10 09:31:38', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED'),
(53, 53, 0.1, '2026-10-10 09:31:38', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED'),
(54, 54, 0.02, '2026-10-10 09:31:38', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED'),
(55, 55, 0.04, '2026-10-10 09:31:38', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED'),
(56, 56, 0.05, '2026-10-10 09:31:38', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED'),
(57, 57, 0.04, '2026-10-10 09:31:38', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED'),
(58, 58, 0.06, '2026-10-10 09:31:38', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED'),
(59, 59, 2000, '2026-10-10 09:31:38', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED'),
(60, 60, 0.12, '2026-10-10 09:31:38', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED');

-- ---------------------------------------------------------
-- Table structure for `ingredients`
-- ---------------------------------------------------------
DROP TABLE IF EXISTS `ingredients`;
CREATE TABLE `ingredients` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `category` varchar(50) DEFAULT NULL,
  `unit` varchar(20) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `source_id` int DEFAULT NULL,
  `source_ref_id` varchar(100) DEFAULT NULL,
  `aliases` json DEFAULT NULL,
  `data_status` enum('SEED','VALID','NEEDS_REVIEW','INVALID') DEFAULT 'SEED',
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table `ingredients` (60 rows)
INSERT INTO `ingredients` (`id`, `name`, `category`, `unit`, `created_at`, `updated_at`, `source_id`, `source_ref_id`, `aliases`, `data_status`, `is_active`) VALUES
(1, 'Beras', 'Karbohidrat', 'g', '2026-09-30 06:47:23', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED', 1),
(2, 'Ayam', 'Protein', 'g', '2026-09-30 06:47:24', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED', 1),
(3, 'Telur', 'Protein', 'pcs', '2026-09-30 06:47:24', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED', 1),
(4, 'Tahu', 'Protein', 'g', '2026-09-30 06:47:24', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED', 1),
(5, 'Tempe', 'Protein', 'g', '2026-09-30 06:47:24', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED', 1),
(6, 'Bayam', 'Sayuran', 'g', '2026-09-30 06:47:24', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED', 1),
(7, 'Kangkung', 'Sayuran', 'g', '2026-09-30 06:47:24', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED', 1),
(8, 'Wortel', 'Sayuran', 'g', '2026-09-30 06:47:24', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED', 1),
(9, 'Kentang', 'Karbohidrat', 'g', '2026-09-30 06:47:24', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED', 1),
(10, 'Minyak Goreng', 'Bumbu', 'ml', '2026-09-30 06:47:24', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED', 1),
(11, 'Bawang Merah', 'Bumbu', 'g', '2026-09-30 06:47:24', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED', 1),
(12, 'Bawang Putih', 'Bumbu', 'g', '2026-09-30 06:47:24', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED', 1),
(13, 'Cabai Merah', 'Bumbu', 'g', '2026-09-30 06:47:24', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED', 1),
(14, 'Tomat', 'Sayuran', 'g', '2026-09-30 06:47:24', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED', 1),
(15, 'Kecap Manis', 'Bumbu', 'ml', '2026-09-30 06:47:24', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED', 1),
(16, 'Garam', 'Bumbu', 'g', '2026-09-30 06:47:24', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED', 1),
(17, 'Gula Pasir', 'Bumbu', 'g', '2026-09-30 06:47:24', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED', 1),
(18, 'Santan', 'Bahan Pelengkap', 'ml', '2026-09-30 06:47:24', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED', 1),
(19, 'Ikan Teri', 'Protein', 'g', '2026-09-30 06:47:24', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED', 1),
(20, 'Udang', 'Protein', 'g', '2026-09-30 06:47:24', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED', 1),
(21, 'Daging Sapi', 'Protein', 'g', '2026-09-30 06:47:24', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED', 1),
(22, 'Tahu Sutera', 'Protein', 'g', '2026-09-30 06:47:24', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED', 1),
(23, 'Mie Telur', 'Karbohidrat', 'g', '2026-09-30 06:47:24', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED', 1),
(24, 'Kol/Kubis', 'Sayuran', 'g', '2026-09-30 06:47:24', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED', 1),
(25, 'Daun Bawang', 'Sayuran', 'g', '2026-09-30 06:47:24', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED', 1),
(26, 'Jahe', 'Bumbu', 'g', '2026-09-30 06:47:24', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED', 1),
(27, 'Kunyit', 'Bumbu', 'g', '2026-09-30 06:47:24', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED', 1),
(28, 'Ketumbar', 'Bumbu', 'g', '2026-09-30 06:47:24', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED', 1),
(29, 'Pisang', 'Buah', 'pcs', '2026-09-30 06:47:24', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED', 1),
(30, 'Oat', 'Karbohidrat', 'g', '2026-09-30 06:47:24', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED', 1),
(31, 'Beras', 'Karbohidrat', 'g', '2026-10-10 09:31:38', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED', 1),
(32, 'Ayam', 'Protein', 'g', '2026-10-10 09:31:38', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED', 1),
(33, 'Telur', 'Protein', 'pcs', '2026-10-10 09:31:38', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED', 1),
(34, 'Tahu', 'Protein', 'g', '2026-10-10 09:31:38', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED', 1),
(35, 'Tempe', 'Protein', 'g', '2026-10-10 09:31:38', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED', 1),
(36, 'Bayam', 'Sayuran', 'g', '2026-10-10 09:31:38', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED', 1),
(37, 'Kangkung', 'Sayuran', 'g', '2026-10-10 09:31:38', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED', 1),
(38, 'Wortel', 'Sayuran', 'g', '2026-10-10 09:31:38', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED', 1),
(39, 'Kentang', 'Karbohidrat', 'g', '2026-10-10 09:31:38', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED', 1),
(40, 'Minyak Goreng', 'Bumbu', 'ml', '2026-10-10 09:31:38', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED', 1),
(41, 'Bawang Merah', 'Bumbu', 'g', '2026-10-10 09:31:38', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED', 1),
(42, 'Bawang Putih', 'Bumbu', 'g', '2026-10-10 09:31:38', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED', 1),
(43, 'Cabai Merah', 'Bumbu', 'g', '2026-10-10 09:31:38', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED', 1),
(44, 'Tomat', 'Sayuran', 'g', '2026-10-10 09:31:38', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED', 1),
(45, 'Kecap Manis', 'Bumbu', 'ml', '2026-10-10 09:31:38', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED', 1),
(46, 'Garam', 'Bumbu', 'g', '2026-10-10 09:31:38', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED', 1),
(47, 'Gula Pasir', 'Bumbu', 'g', '2026-10-10 09:31:38', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED', 1),
(48, 'Santan', 'Bahan Pelengkap', 'ml', '2026-10-10 09:31:38', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED', 1),
(49, 'Ikan Teri', 'Protein', 'g', '2026-10-10 09:31:38', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED', 1),
(50, 'Udang', 'Protein', 'g', '2026-10-10 09:31:38', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED', 1),
(51, 'Daging Sapi', 'Protein', 'g', '2026-10-10 09:31:38', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED', 1),
(52, 'Tahu Sutera', 'Protein', 'g', '2026-10-10 09:31:38', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED', 1),
(53, 'Mie Telur', 'Karbohidrat', 'g', '2026-10-10 09:31:38', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED', 1),
(54, 'Kol/Kubis', 'Sayuran', 'g', '2026-10-10 09:31:38', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED', 1),
(55, 'Daun Bawang', 'Sayuran', 'g', '2026-10-10 09:31:38', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED', 1),
(56, 'Jahe', 'Bumbu', 'g', '2026-10-10 09:31:38', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED', 1),
(57, 'Kunyit', 'Bumbu', 'g', '2026-10-10 09:31:38', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED', 1),
(58, 'Ketumbar', 'Bumbu', 'g', '2026-10-10 09:31:38', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED', 1),
(59, 'Pisang', 'Buah', 'pcs', '2026-10-10 09:31:38', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED', 1),
(60, 'Oat', 'Karbohidrat', 'g', '2026-10-10 09:31:38', '2026-10-10 10:13:39', 1, NULL, NULL, 'SEED', 1);

-- ---------------------------------------------------------
-- Table structure for `meal_plan_items`
-- ---------------------------------------------------------
DROP TABLE IF EXISTS `meal_plan_items`;
CREATE TABLE `meal_plan_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `meal_plan_id` int NOT NULL,
  `recipe_id` int NOT NULL,
  `day_date` date NOT NULL,
  `meal_slot` enum('BREAKFAST','LUNCH','DINNER','SNACK') NOT NULL,
  PRIMARY KEY (`id`),
  KEY `meal_plan_id` (`meal_plan_id`),
  KEY `recipe_id` (`recipe_id`),
  CONSTRAINT `meal_plan_items_ibfk_1` FOREIGN KEY (`meal_plan_id`) REFERENCES `meal_plans` (`id`) ON DELETE CASCADE,
  CONSTRAINT `meal_plan_items_ibfk_2` FOREIGN KEY (`recipe_id`) REFERENCES `recipes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ---------------------------------------------------------
-- Table structure for `meal_plans`
-- ---------------------------------------------------------
DROP TABLE IF EXISTS `meal_plans`;
CREATE TABLE `meal_plans` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `total_budget` float DEFAULT NULL,
  `estimated_cost` float DEFAULT NULL,
  `status` enum('ACTIVE','COMPLETED','CANCELLED') DEFAULT 'ACTIVE',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `meal_plans_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ---------------------------------------------------------
-- Table structure for `optimization_runs`
-- ---------------------------------------------------------
DROP TABLE IF EXISTS `optimization_runs`;
CREATE TABLE `optimization_runs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `budget` float DEFAULT NULL,
  `period_days` int DEFAULT NULL,
  `candidate_recipes_count` int DEFAULT NULL,
  `status` enum('OPTIMAL','FEASIBLE','INFEASIBLE','UNBOUNDED','ERROR','PROCESSING') NOT NULL,
  `objective_value` float DEFAULT NULL,
  `processing_time_ms` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `optimization_runs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table `optimization_runs` (5 rows)
INSERT INTO `optimization_runs` (`id`, `user_id`, `budget`, `period_days`, `candidate_recipes_count`, `status`, `objective_value`, `processing_time_ms`, `created_at`) VALUES
(5, 9, 1000000, 7, 0, 'INFEASIBLE', NULL, 137, '2026-10-24 13:48:06'),
(6, 9, 1000000, 7, 0, 'INFEASIBLE', NULL, 89, '2026-10-24 13:52:49'),
(7, 9, 1000000, 3, 0, 'INFEASIBLE', NULL, 81, '2026-10-24 13:52:59'),
(8, 9, 1000000, 7, 0, 'INFEASIBLE', NULL, 69, '2026-10-24 13:54:31'),
(9, 9, 1000000, 7, 11, 'FEASIBLE', 0.0474816, 138, '2026-10-24 13:55:57');

-- ---------------------------------------------------------
-- Table structure for `recipe_equipment`
-- ---------------------------------------------------------
DROP TABLE IF EXISTS `recipe_equipment`;
CREATE TABLE `recipe_equipment` (
  `id` int NOT NULL AUTO_INCREMENT,
  `recipe_id` int NOT NULL,
  `equipment_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `recipe_id` (`recipe_id`),
  KEY `equipment_id` (`equipment_id`),
  CONSTRAINT `recipe_equipment_ibfk_1` FOREIGN KEY (`recipe_id`) REFERENCES `recipes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `recipe_equipment_ibfk_2` FOREIGN KEY (`equipment_id`) REFERENCES `equipment` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table `recipe_equipment` (42 rows)
INSERT INTO `recipe_equipment` (`id`, `recipe_id`, `equipment_id`) VALUES
(1, 1, 2),
(2, 2, 1),
(3, 2, 3),
(4, 3, 1),
(5, 3, 3),
(6, 4, 1),
(7, 4, 3),
(8, 4, 4),
(9, 5, 1),
(10, 5, 3),
(11, 6, 1),
(12, 6, 4),
(13, 7, 1),
(14, 7, 4),
(15, 8, 1),
(16, 8, 3),
(17, 9, 1),
(18, 9, 3),
(19, 10, 1),
(20, 10, 3),
(21, 11, 1),
(22, 11, 3),
(23, 11, 4),
(24, 12, 1),
(25, 12, 4),
(26, 13, 1),
(27, 13, 3),
(28, 14, 1),
(29, 14, 4),
(30, 15, 1),
(31, 15, 3),
(32, 15, 7),
(33, 16, 1),
(34, 16, 3),
(35, 17, 1),
(36, 17, 3),
(37, 18, 1),
(38, 18, 4),
(39, 19, 1),
(40, 19, 3),
(41, 20, 1),
(42, 20, 3);

-- ---------------------------------------------------------
-- Table structure for `recipe_ingredients`
-- ---------------------------------------------------------
DROP TABLE IF EXISTS `recipe_ingredients`;
CREATE TABLE `recipe_ingredients` (
  `id` int NOT NULL AUTO_INCREMENT,
  `recipe_id` int NOT NULL,
  `ingredient_id` int NOT NULL,
  `quantity` float NOT NULL,
  `unit` varchar(20) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `recipe_id` (`recipe_id`),
  KEY `ingredient_id` (`ingredient_id`),
  CONSTRAINT `recipe_ingredients_ibfk_1` FOREIGN KEY (`recipe_id`) REFERENCES `recipes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `recipe_ingredients_ibfk_2` FOREIGN KEY (`ingredient_id`) REFERENCES `ingredients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=126 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table `recipe_ingredients` (125 rows)
INSERT INTO `recipe_ingredients` (`id`, `recipe_id`, `ingredient_id`, `quantity`, `unit`) VALUES
(1, 1, 1, 400, 'g'),
(2, 2, 1, 200, 'g'),
(3, 2, 3, 2, 'pcs'),
(4, 2, 11, 30, 'g'),
(5, 2, 12, 10, 'g'),
(6, 2, 13, 10, 'g'),
(7, 2, 15, 20, 'ml'),
(8, 2, 10, 30, 'ml'),
(9, 2, 16, 5, 'g'),
(10, 3, 2, 500, 'g'),
(11, 3, 15, 60, 'ml'),
(12, 3, 11, 50, 'g'),
(13, 3, 12, 20, 'g'),
(14, 3, 26, 15, 'g'),
(15, 3, 17, 10, 'g'),
(16, 3, 10, 30, 'ml'),
(17, 3, 16, 5, 'g'),
(18, 4, 3, 4, 'pcs'),
(19, 4, 13, 50, 'g'),
(20, 4, 11, 40, 'g'),
(21, 4, 12, 15, 'g'),
(22, 4, 14, 50, 'g'),
(23, 4, 10, 40, 'ml'),
(24, 4, 16, 5, 'g'),
(25, 5, 7, 300, 'g'),
(26, 5, 11, 30, 'g'),
(27, 5, 12, 10, 'g'),
(28, 5, 13, 20, 'g'),
(29, 5, 10, 20, 'ml'),
(30, 5, 16, 3, 'g'),
(31, 6, 8, 150, 'g'),
(32, 6, 9, 200, 'g'),
(33, 6, 24, 100, 'g'),
(34, 6, 25, 30, 'g'),
(35, 6, 11, 30, 'g'),
(36, 6, 12, 10, 'g'),
(37, 6, 16, 5, 'g'),
(38, 7, 2, 400, 'g'),
(39, 7, 27, 15, 'g'),
(40, 7, 26, 20, 'g'),
(41, 7, 11, 60, 'g'),
(42, 7, 12, 20, 'g'),
(43, 7, 25, 30, 'g'),
(44, 7, 16, 8, 'g'),
(45, 8, 5, 300, 'g'),
(46, 8, 12, 15, 'g'),
(47, 8, 27, 5, 'g'),
(48, 8, 10, 100, 'ml'),
(49, 8, 16, 5, 'g'),
(50, 9, 4, 250, 'g'),
(51, 9, 8, 100, 'g'),
(52, 9, 24, 100, 'g'),
(53, 9, 11, 30, 'g'),
(54, 9, 12, 10, 'g'),
(55, 9, 10, 30, 'ml'),
(56, 9, 16, 5, 'g'),
(57, 10, 8, 100, 'g'),
(58, 10, 24, 150, 'g'),
(59, 10, 25, 40, 'g'),
(60, 10, 12, 15, 'g'),
(61, 10, 10, 30, 'ml'),
(62, 10, 16, 5, 'g'),
(63, 10, 17, 5, 'g'),
(64, 11, 23, 200, 'g'),
(65, 11, 3, 2, 'pcs'),
(66, 11, 24, 80, 'g'),
(67, 11, 25, 20, 'g'),
(68, 11, 11, 25, 'g'),
(69, 11, 12, 10, 'g'),
(70, 11, 15, 20, 'ml'),
(71, 11, 10, 30, 'ml'),
(72, 11, 16, 3, 'g'),
(73, 12, 6, 250, 'g'),
(74, 12, 11, 20, 'g'),
(75, 12, 16, 4, 'g'),
(76, 13, 2, 600, 'g'),
(77, 13, 27, 10, 'g'),
(78, 13, 28, 10, 'g'),
(79, 13, 12, 20, 'g'),
(80, 13, 26, 10, 'g'),
(81, 13, 10, 200, 'ml'),
(82, 13, 16, 8, 'g'),
(83, 14, 21, 400, 'g'),
(84, 14, 15, 60, 'ml'),
(85, 14, 9, 200, 'g'),
(86, 14, 11, 50, 'g'),
(87, 14, 12, 15, 'g'),
(88, 14, 26, 10, 'g'),
(89, 14, 17, 10, 'g'),
(90, 14, 10, 30, 'ml'),
(91, 14, 16, 8, 'g'),
(92, 15, 9, 400, 'g'),
(93, 15, 3, 2, 'pcs'),
(94, 15, 25, 20, 'g'),
(95, 15, 12, 10, 'g'),
(96, 15, 10, 100, 'ml'),
(97, 15, 16, 5, 'g'),
(98, 16, 2, 500, 'g'),
(99, 16, 18, 400, 'ml'),
(100, 16, 27, 10, 'g'),
(101, 16, 26, 15, 'g'),
(102, 16, 11, 60, 'g'),
(103, 16, 12, 20, 'g'),
(104, 16, 28, 10, 'g'),
(105, 16, 16, 8, 'g'),
(106, 17, 19, 150, 'g'),
(107, 17, 11, 30, 'g'),
(108, 17, 12, 10, 'g'),
(109, 17, 13, 20, 'g'),
(110, 17, 10, 60, 'ml'),
(111, 17, 16, 3, 'g'),
(112, 18, 30, 100, 'g'),
(113, 18, 29, 2, 'pcs'),
(114, 18, 17, 10, 'g'),
(115, 19, 3, 3, 'pcs'),
(116, 19, 11, 15, 'g'),
(117, 19, 25, 10, 'g'),
(118, 19, 10, 20, 'ml'),
(119, 19, 16, 3, 'g'),
(120, 20, 6, 200, 'g'),
(121, 20, 4, 200, 'g'),
(122, 20, 11, 25, 'g'),
(123, 20, 12, 10, 'g'),
(124, 20, 10, 25, 'ml'),
(125, 20, 16, 4, 'g');

-- ---------------------------------------------------------
-- Table structure for `recipes`
-- ---------------------------------------------------------
DROP TABLE IF EXISTS `recipes`;
CREATE TABLE `recipes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `description` text,
  `category` varchar(50) DEFAULT NULL,
  `meal_type` enum('BREAKFAST','LUNCH','DINNER','SNACK','ANY') DEFAULT 'ANY',
  `servings` int NOT NULL DEFAULT '1',
  `cooking_time` int NOT NULL DEFAULT '0',
  `difficulty` enum('EASY','MEDIUM','HARD') DEFAULT 'MEDIUM',
  `instructions` text,
  `total_calories` float DEFAULT '0',
  `total_protein` float DEFAULT '0',
  `total_fat` float DEFAULT '0',
  `total_carbs` float DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `source_id` int DEFAULT NULL,
  `source_ref_id` varchar(100) DEFAULT NULL,
  `data_status` enum('SEED','VALID','NEEDS_REVIEW','INVALID','IMPORTED') DEFAULT 'SEED',
  `nutrition_completeness` enum('FULL','PARTIAL','MISSING') DEFAULT 'FULL',
  `price_completeness` enum('FULL','PARTIAL','MISSING') DEFAULT 'FULL',
  `is_active` tinyint(1) DEFAULT '1',
  `image_url` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table `recipes` (20 rows)
INSERT INTO `recipes` (`id`, `name`, `description`, `category`, `meal_type`, `servings`, `cooking_time`, `difficulty`, `instructions`, `total_calories`, `total_protein`, `total_fat`, `total_carbs`, `created_at`, `updated_at`, `source_id`, `source_ref_id`, `data_status`, `nutrition_completeness`, `price_completeness`, `is_active`, `image_url`) VALUES
(1, 'Nasi Putih', 'Nasi putih yang pulen dan lembut', 'Karbohidrat', 'ANY', 4, 30, 'EASY', '1. Cuci beras hingga bersih. 2. Masukkan ke rice cooker dengan air secukupnya. 3. Tekan tombol cook dan tunggu hingga matang.', 360, 7, 0.5, 79, '2026-09-30 06:47:24', '2026-10-10 10:13:39', 1, NULL, 'SEED', 'FULL', 'FULL', 1, NULL),
(2, 'Nasi Goreng Spesial', 'Nasi goreng dengan telur dan bumbu khas Indonesia', 'Nasi', 'ANY', 2, 20, 'EASY', '1. Panaskan minyak di wajan. 2. Tumis bawang merah, bawang putih, dan cabai. 3. Masukkan telur, orak-arik. 4. Masukkan nasi, aduk rata. 5. Tambahkan kecap manis dan garam. 6. Sajikan panas.', 603.2, 13.835, 20.555, 89.105, '2026-09-30 06:47:24', '2026-10-10 10:13:39', 1, NULL, 'SEED', 'FULL', 'FULL', 1, NULL),
(3, 'Ayam Kecap', 'Ayam masak kecap yang lezat dan gurih', 'Lauk', 'LUNCH', 4, 40, 'MEDIUM', '1. Potong ayam menjadi beberapa bagian. 2. Tumis bawang merah, bawang putih, jahe. 3. Masukkan ayam, aduk hingga berubah warna. 4. Tambahkan kecap manis, gula, garam. 5. Masak hingga matang dan kuah mengental.', 399.175, 24.065, 25.0675, 15.5475, '2026-09-30 06:47:24', '2026-10-10 10:13:39', 1, NULL, 'SEED', 'FULL', 'FULL', 1, NULL),
(4, 'Telur Balado', 'Telur rebus dengan sambal balado pedas khas Padang', 'Lauk', 'ANY', 3, 25, 'EASY', '1. Rebus telur hingga matang, kupas. 2. Goreng telur sebentar. 3. Haluskan cabai, bawang merah, bawang putih, tomat. 4. Tumis bumbu halus. 5. Masukkan telur, aduk rata.', 231.617, 8.86167, 20.1217, 5.03833, '2026-09-30 06:47:24', '2026-10-10 10:13:39', 1, NULL, 'SEED', 'FULL', 'FULL', 1, NULL),
(5, 'Tumis Kangkung', 'Sayur kangkung tumis bawang dan terasi', 'Sayur', 'ANY', 3, 15, 'EASY', '1. Cuci kangkung bersih. 2. Panaskan minyak. 3. Tumis bawang merah, bawang putih, cabai. 4. Masukkan kangkung. 5. Tambahkan garam, aduk hingga layu.', 88.7, 3.02, 7.01333, 5.70333, '2026-09-30 06:47:24', '2026-10-10 10:13:39', 1, NULL, 'SEED', 'FULL', 'FULL', 1, NULL),
(6, 'Sayur Sop', 'Sup sayuran segar yang hangat dan bergizi', 'Sayur', 'LUNCH', 4, 30, 'EASY', '1. Didihkan air. 2. Masukkan bawang merah, bawang putih. 3. Tambahkan wortel dan kentang, masak 10 menit. 4. Masukkan kol dan daun bawang. 5. Bumbui dengan garam.', 69.25, 2.0375, 0.1925, 15.625, '2026-09-30 06:47:24', '2026-10-10 10:13:39', 1, NULL, 'SEED', 'FULL', 'FULL', 1, NULL),
(7, 'Soto Ayam', 'Soto ayam kuning berkuah bening khas Jawa', 'Sup', 'BREAKFAST', 4, 60, 'MEDIUM', '1. Rebus ayam dengan bumbu kuning (kunyit, jahe, bawang). 2. Angkat ayam, suwir-suwir. 3. Saring kaldu. 4. Masukkan kembali ayam suwir. 5. Sajikan dengan bihun dan pelengkap.', 246.55, 19.5575, 14.4775, 6.97, '2026-09-30 06:47:24', '2026-10-10 10:13:39', 1, NULL, 'SEED', 'FULL', 'FULL', 1, NULL),
(8, 'Tempe Goreng', 'Tempe goreng crispy bumbu bawang', 'Lauk', 'ANY', 4, 15, 'EASY', '1. Iris tempe sesuai selera. 2. Haluskan bawang putih dan kunyit. 3. Lumuri tempe dengan bumbu. 4. Goreng dalam minyak panas hingga kecoklatan.', 378.737, 14.6038, 30.9188, 9.50875, '2026-09-30 06:47:24', '2026-10-10 10:13:39', 1, NULL, 'SEED', 'FULL', 'FULL', 1, NULL),
(9, 'Tahu Sayur', 'Tumis tahu dengan sayuran segar', 'Sayur', 'ANY', 3, 20, 'EASY', '1. Goreng tahu sebentar. 2. Tumis bawang merah dan bawang putih. 3. Masukkan wortel dan kol. 4. Tambahkan tahu. 5. Bumbui garam.', 182.3, 7.72, 13.8767, 8.75333, '2026-09-30 06:47:24', '2026-10-10 10:13:39', 1, NULL, 'SEED', 'FULL', 'FULL', 1, NULL),
(10, 'Capcay', 'Tumis sayuran campur ala chinese food', 'Sayur', 'DINNER', 4, 20, 'EASY', '1. Panaskan minyak. 2. Tumis bawang. 3. Masukkan wortel, kol, daun bawang berurutan. 4. Bumbui dengan garam dan sedikit gula. 5. Sajikan segera.', 99.25, 1.12875, 7.63625, 7.83375, '2026-09-30 06:47:24', '2026-10-10 10:13:39', 1, NULL, 'SEED', 'FULL', 'FULL', 1, NULL),
(11, 'Mie Goreng', 'Mie goreng dengan telur dan sayuran', 'Mie', 'ANY', 2, 20, 'EASY', '1. Rebus mie hingga al dente, tiriskan. 2. Tumis bawang, masukkan telur. 3. Masukkan mie dan sayuran. 4. Bumbui kecap dan garam. 5. Sajikan panas.', 391.85, 11.9325, 22.1075, 40.37, '2026-09-30 06:47:24', '2026-10-10 10:13:39', 1, NULL, 'SEED', 'FULL', 'FULL', 1, NULL),
(12, 'Sayur Bayam', 'Bayam bening berkuah bening yang menyehatkan', 'Sayur', 'ANY', 3, 15, 'EASY', '1. Didihkan air. 2. Masukkan bawang merah iris. 3. Masukkan bayam. 4. Tambahkan garam. 5. Masak sebentar, jangan terlalu lama.', 21.8333, 2.49, 0.34, 3.6, '2026-09-30 06:47:24', '2026-10-10 10:13:39', 1, NULL, 'SEED', 'FULL', 'FULL', 1, NULL),
(13, 'Ayam Goreng', 'Ayam goreng krispy dengan bumbu rempah', 'Lauk', 'ANY', 4, 45, 'MEDIUM', '1. Lumuri ayam dengan bumbu kunyit, ketumbar, garam. 2. Diamkan 30 menit. 3. Goreng dalam minyak panas hingga matang dan kecoklatan.', 787.2, 28.655, 71.74, 5.16, '2026-09-30 06:47:24', '2026-10-10 10:13:39', 1, NULL, 'SEED', 'FULL', 'FULL', 1, NULL),
(14, 'Semur Daging', 'Daging sapi masak semur dengan kecap manis', 'Lauk', 'LUNCH', 4, 90, 'HARD', '1. Potong daging. 2. Tumis bumbu. 3. Masukkan daging hingga berubah warna. 4. Tambahkan kecap manis, kentang. 5. Masak dengan air hingga empuk.', 416.062, 27.8388, 22.6012, 23.4112, '2026-09-30 06:47:24', '2026-10-10 10:13:39', 1, NULL, 'SEED', 'FULL', 'FULL', 1, NULL),
(15, 'Perkedel Kentang', 'Perkedel kentang goreng yang gurih dan lezat', 'Lauk', 'ANY', 4, 35, 'MEDIUM', '1. Kukus/rebus kentang, haluskan. 2. Campur dengan bawang putih, daun bawang, garam. 3. Bentuk bulat pipih. 4. Celup ke kocokan telur. 5. Goreng hingga kecoklatan.', 337.325, 5.2475, 27.6275, 18.3925, '2026-09-30 06:47:24', '2026-10-10 10:13:39', 1, NULL, 'SEED', 'FULL', 'FULL', 1, NULL),
(16, 'Opor Ayam', 'Ayam masak santan kuning khas Lebaran', 'Lauk', 'LUNCH', 4, 60, 'MEDIUM', '1. Haluskan bumbu opor. 2. Tumis bumbu halus hingga harum. 3. Masukkan ayam. 4. Tuang santan. 5. Masak hingga matang dan kuah mengental.', 530.45, 26.5175, 42.365, 12.7325, '2026-09-30 06:47:24', '2026-10-10 10:13:39', 1, NULL, 'SEED', 'FULL', 'FULL', 1, NULL),
(17, 'Ikan Teri Kacang', 'Ikan teri goreng dengan bumbu bawang', 'Lauk', 'ANY', 4, 20, 'EASY', '1. Cuci ikan teri bersih. 2. Goreng hingga kering. 3. Tumis bawang, cabai. 4. Masukkan teri goreng. 5. Aduk rata.', 221.65, 16.215, 16.16, 1.8025, '2026-09-30 06:47:24', '2026-10-10 10:13:39', 1, NULL, 'SEED', 'FULL', 'FULL', 1, NULL),
(18, 'Oatmeal Pisang', 'Oatmeal sehat dengan irisan pisang untuk sarapan', 'Sarapan', 'BREAKFAST', 2, 10, 'EASY', '1. Masak oat dengan air/susu hingga mengental. 2. Tambahkan sedikit gula. 3. Sajikan dengan irisan pisang di atas.', 318.85, 9.8, 3.9, 65, '2026-09-30 06:47:24', '2026-10-10 10:13:39', 1, NULL, 'SEED', 'FULL', 'FULL', 1, NULL),
(19, 'Telur Dadar', 'Telur dadar simple dengan bumbu bawang dan daun bawang', 'Lauk', 'BREAKFAST', 2, 10, 'EASY', '1. Kocok telur dengan garam. 2. Tambahkan bawang merah cincang dan daun bawang. 3. Goreng di wajan dengan sedikit minyak.', 197.6, 9.1725, 17.5225, 1.64, '2026-09-30 06:47:24', '2026-10-10 10:13:39', 1, NULL, 'SEED', 'FULL', 'FULL', 1, NULL),
(20, 'Tumis Bayam Tahu', 'Tumis bayam dan tahu yang sehat dan bergizi', 'Sayur', 'DINNER', 3, 15, 'EASY', '1. Goreng tahu sebentar. 2. Tumis bawang dan bawang putih. 3. Masukkan tahu dan bayam. 4. Bumbui garam, aduk hingga layu.', 147.633, 7.56833, 11.625, 5.52, '2026-09-30 06:47:25', '2026-10-10 10:13:39', 1, NULL, 'SEED', 'FULL', 'FULL', 1, NULL);

-- ---------------------------------------------------------
-- Table structure for `shopping_list_items`
-- ---------------------------------------------------------
DROP TABLE IF EXISTS `shopping_list_items`;
CREATE TABLE `shopping_list_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `shopping_list_id` int NOT NULL,
  `ingredient_id` int NOT NULL,
  `quantity` float NOT NULL,
  `unit` varchar(20) NOT NULL,
  `estimated_cost` float DEFAULT NULL,
  `status` enum('PENDING','PURCHASED') DEFAULT 'PENDING',
  PRIMARY KEY (`id`),
  KEY `shopping_list_id` (`shopping_list_id`),
  KEY `ingredient_id` (`ingredient_id`),
  CONSTRAINT `shopping_list_items_ibfk_1` FOREIGN KEY (`shopping_list_id`) REFERENCES `shopping_lists` (`id`) ON DELETE CASCADE,
  CONSTRAINT `shopping_list_items_ibfk_2` FOREIGN KEY (`ingredient_id`) REFERENCES `ingredients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ---------------------------------------------------------
-- Table structure for `shopping_lists`
-- ---------------------------------------------------------
DROP TABLE IF EXISTS `shopping_lists`;
CREATE TABLE `shopping_lists` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `meal_plan_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `meal_plan_id` (`meal_plan_id`),
  CONSTRAINT `shopping_lists_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `shopping_lists_ibfk_2` FOREIGN KEY (`meal_plan_id`) REFERENCES `meal_plans` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ---------------------------------------------------------
-- Table structure for `unit_conversions`
-- ---------------------------------------------------------
DROP TABLE IF EXISTS `unit_conversions`;
CREATE TABLE `unit_conversions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `from_unit` varchar(30) NOT NULL,
  `to_unit` varchar(30) NOT NULL,
  `factor` float NOT NULL,
  `ingredient_id` int DEFAULT NULL,
  `notes` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_conversion` (`from_unit`,`to_unit`,`ingredient_id`),
  KEY `ingredient_id` (`ingredient_id`),
  CONSTRAINT `unit_conversions_ibfk_1` FOREIGN KEY (`ingredient_id`) REFERENCES `ingredients` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table `unit_conversions` (9 rows)
INSERT INTO `unit_conversions` (`id`, `from_unit`, `to_unit`, `factor`, `ingredient_id`, `notes`) VALUES
(1, 'kg', 'g', 1000, NULL, '1 kg = 1000 g'),
(2, 'g', 'kg', 0.001, NULL, '1 g = 0.001 kg'),
(3, 'mg', 'g', 0.001, NULL, '1 mg = 0.001 g'),
(4, 'L', 'ml', 1000, NULL, '1 L = 1000 ml'),
(5, 'ml', 'L', 0.001, NULL, '1 ml = 0.001 L'),
(6, 'sdm', 'ml', 15, NULL, '1 sdm ≈ 15 ml'),
(7, 'sdt', 'ml', 5, NULL, '1 sdt ≈ 5 ml'),
(8, 'gelas', 'ml', 240, NULL, '1 gelas = 240 ml'),
(9, 'cangkir', 'ml', 250, NULL, '1 cangkir = 250 ml');

-- ---------------------------------------------------------
-- Table structure for `user_budgets`
-- ---------------------------------------------------------
DROP TABLE IF EXISTS `user_budgets`;
CREATE TABLE `user_budgets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `amount` float NOT NULL,
  `period` enum('DAILY','WEEKLY','MONTHLY','CUSTOM') NOT NULL,
  `days` int NOT NULL DEFAULT '7',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `user_budgets_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table `user_budgets` (1 rows)
INSERT INTO `user_budgets` (`id`, `user_id`, `amount`, `period`, `days`, `created_at`, `updated_at`) VALUES
(3, 9, 1000000, 'WEEKLY', 7, '2026-10-24 13:47:31', '2026-10-24 13:47:31');

-- ---------------------------------------------------------
-- Table structure for `user_equipment`
-- ---------------------------------------------------------
DROP TABLE IF EXISTS `user_equipment`;
CREATE TABLE `user_equipment` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `equipment_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `equipment_id` (`equipment_id`),
  CONSTRAINT `user_equipment_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_equipment_ibfk_2` FOREIGN KEY (`equipment_id`) REFERENCES `equipment` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table `user_equipment` (9 rows)
INSERT INTO `user_equipment` (`id`, `user_id`, `equipment_id`, `created_at`) VALUES
(11, 9, 6, '2026-10-24 13:49:45'),
(12, 9, 5, '2026-10-24 13:49:48'),
(13, 9, 17, '2026-10-24 13:49:49'),
(14, 9, 19, '2026-10-24 13:49:53'),
(15, 9, 20, '2026-10-24 13:49:55'),
(16, 9, 8, '2026-10-24 13:49:58'),
(17, 9, 18, '2026-10-24 13:55:45'),
(18, 9, 3, '2026-10-24 13:55:47'),
(19, 9, 1, '2026-10-24 13:55:49');

-- ---------------------------------------------------------
-- Table structure for `user_inventory`
-- ---------------------------------------------------------
DROP TABLE IF EXISTS `user_inventory`;
CREATE TABLE `user_inventory` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `ingredient_id` int NOT NULL,
  `quantity` float NOT NULL,
  `unit` varchar(20) NOT NULL,
  `expiration_date` date DEFAULT NULL,
  `minimum_stock` float DEFAULT '0',
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `ingredient_id` (`ingredient_id`),
  CONSTRAINT `user_inventory_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_inventory_ibfk_2` FOREIGN KEY (`ingredient_id`) REFERENCES `ingredients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table `user_inventory` (9 rows)
INSERT INTO `user_inventory` (`id`, `user_id`, `ingredient_id`, `quantity`, `unit`, `expiration_date`, `minimum_stock`, `notes`, `created_at`, `updated_at`) VALUES
(28, 9, 1, 5000, 'g', NULL, 0, NULL, '2026-10-24 13:47:38', '2026-10-24 13:47:38'),
(29, 9, 40, 2000, 'ml', NULL, 0, NULL, '2026-10-24 13:47:38', '2026-10-24 13:47:38'),
(30, 9, 23, 1000, 'g', NULL, 0, NULL, '2026-10-24 13:47:38', '2026-10-24 13:47:38'),
(31, 9, 11, 250, 'g', NULL, 0, NULL, '2026-10-24 13:47:38', '2026-10-24 13:47:38'),
(32, 9, 12, 350, 'g', NULL, 0, NULL, '2026-10-24 13:47:38', '2026-10-24 13:55:04'),
(33, 9, 46, 250, 'g', NULL, 0, NULL, '2026-10-24 13:47:38', '2026-10-24 13:47:38'),
(34, 9, 2, 500, 'g', '2026-10-29 17:00:00', 0, NULL, '2026-10-24 13:49:13', '2026-10-24 13:49:13'),
(35, 9, 36, 5000, 'g', NULL, 0, NULL, '2026-10-24 13:55:16', '2026-10-24 13:55:16'),
(36, 9, 13, 500, 'g', NULL, 0, NULL, '2026-10-24 13:55:30', '2026-10-24 13:55:30');

-- ---------------------------------------------------------
-- Table structure for `user_preferences`
-- ---------------------------------------------------------
DROP TABLE IF EXISTS `user_preferences`;
CREATE TABLE `user_preferences` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `ingredient_id` int NOT NULL,
  `preference_type` enum('FAVORITE','AVOID') NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `ingredient_id` (`ingredient_id`),
  CONSTRAINT `user_preferences_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_preferences_ibfk_2` FOREIGN KEY (`ingredient_id`) REFERENCES `ingredients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table `user_preferences` (1 rows)
INSERT INTO `user_preferences` (`id`, `user_id`, `ingredient_id`, `preference_type`, `created_at`) VALUES
(1, 9, 32, 'FAVORITE', '2026-10-24 13:53:42');

-- ---------------------------------------------------------
-- Table structure for `users`
-- ---------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('USER','ADMIN') DEFAULT 'USER',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table `users` (5 rows)
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `created_at`, `updated_at`) VALUES
(1, 'Admin Demo', 'admin@demo.com', '$2b$10$FLq4PxwYWmBjGt1wdt/fq.JizEE1HbZt4pE6gc9yBVvyqGwGAqTKO', 'ADMIN', '2026-09-30 06:31:05', '2026-09-30 06:31:05'),
(6, 'wowo', 'bakarhutan@gmail.com', '$2b$10$hpaUZU2tC0iwoBnIZC1EKeHL2Zkp9XIUlzLZdPFWlF2FuSiow2Nxm', 'USER', '2026-10-19 14:54:19', '2026-10-19 14:54:19'),
(7, 'wowogemoy', 'bakarhutan1@gmail.com', '$2b$10$bf0fxPI8IocHOwzHV3MZcOBOLTHpNd6t6Nm/oEfijSJFXsQCiSK66', 'USER', '2026-10-20 00:39:24', '2026-10-20 00:39:24'),
(8, 'Budi Santoso', 'budi@example.com', '$2b$10$SuKmBRKYMl5N/MoZO3TFIea0WyLrqk42tvJDfhYR5AQPVexW8ywue', 'USER', '2026-10-20 10:30:38', '2026-10-20 10:30:38'),
(9, 'zikra', 'azzikrra@gmail.com', '$2b$10$2IXwwlMgvwFHqsaFK2Bu9.NDCi/FDzro19x1j8gDv4K0I.unlveQW', 'USER', '2026-10-24 13:42:22', '2026-10-24 13:42:22');

SET FOREIGN_KEY_CHECKS = 1;
-- =========================================================
-- End of Database Export
-- =========================================================
