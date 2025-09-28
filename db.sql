-- MariaDB dump 10.19  Distrib 10.5.29-MariaDB, for Linux (aarch64)
--
-- Host: localhost    Database: poc
-- ------------------------------------------------------
-- Server version       10.5.29-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `feeds_file`
--

DROP TABLE IF EXISTS `feeds_file`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `feeds_file` (
  `feeds_date` char(10) NOT NULL COMMENT 'Feeds Date (yyyymmdd)',
  `feeds_file` varchar(30) NOT NULL COMMENT 'File Name in Feeds',
  `filing_size` int(11) DEFAULT NULL COMMENT 'Filing Size in bytes',
  `header_1000` varchar(1000) DEFAULT NULL COMMENT 'First 1000 characters of file''s SGML header',
  `adsh` char(20) NOT NULL COMMENT 'Accession Number with dashes',
  `accession_number` BIGINT UNSIGNED NOT NULL COMMENT 'Accession Number as int (dashes removed)',
  `filing_date` char(10) DEFAULT NULL COMMENT 'Filing Date from header',
  `form_type` VARCHAR(50) DEFAULT NULL COMMENT 'Form Type (principal) from header',
  `is_correspondence` tinyint(1) DEFAULT NULL COMMENT 'Is Correspndance',
  `is_deletion` tinyint(1) DEFAULT NULL COMMENT 'Is Deletion',
  `is_correction` tinyint(1) DEFAULT NULL COMMENT 'Is Correction',
  `is_private_to_public` tinyint(1) DEFAULT NULL COMMENT 'Is Private to Public',
  `create_time` datetime DEFAULT current_timestamp() COMMENT 'Create Time',
  PRIMARY KEY (`feeds_date`,`feeds_file`),
  KEY `udx_feeds_file_adsh` (`adsh`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci COMMENT='Feeds Files found by downloading, unzippeding and processing the daily archive';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `feeds_file_cik`
--

DROP TABLE IF EXISTS `feeds_file_cik`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `feeds_file_cik` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Primary Key as int reduced index size + keeps order found',
  `feeds_date` char(10) DEFAULT NULL COMMENT 'Feeds Date (yyyymmdd)',
  `feeds_file` varchar(30) DEFAULT NULL COMMENT 'File Name of untarred feeds source file',
  `cik` int(11) DEFAULT NULL COMMENT 'CIK from header',
  `filer_type` CHAR(1) DEFAULT 'F' COMMENT 'F|R|I filer|reporter|issuer',
  `entity_name` varchar(255) DEFAULT NULL COMMENT 'Entity Name from header',
  PRIMARY KEY (`id`),
  UNIQUE KEY `udx_feeds_file_cik` (`feeds_date`,`feeds_file`,`cik`,`filer_type`), /*not sure if filer_type is needed */
  KEY `idx_feeds_file_cik` (`cik`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci COMMENT='insert in order found';
/*!40101 SET character_set_client = @saved_cs_client */;

DROP TABLE IF EXISTS `feeds_file_series`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `feeds_file_series` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Primary Key as int reduced index size + keeps order found',
  `feeds_date` char(10) DEFAULT NULL COMMENT 'Feeds Date ISO 8601 ',
  `feeds_file` varchar(30) DEFAULT NULL COMMENT 'File Name of untarred feeds source file in Feeds',
  `cik` int(11) DEFAULT NULL COMMENT 'CIK from header',
  `series_id` int(11) DEFAULT NULL COMMENT 'Series ID from header',
  `series_name` varchar(255) DEFAULT NULL COMMENT 'Series Name from header',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_feeds_file_series` (`feeds_date`,`feeds_file`,`cik`,`series_id`),
  KEY `idx_feeds_series_series_id` (`series_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci COMMENT='insert in order found';



DROP TABLE IF EXISTS `feeds_file_class`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `feeds_file_class` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Primary Key as int reduces index size + keeps order found',
  `feeds_date` char(10) DEFAULT NULL COMMENT 'Feeds Date (yyyymmdd)',
  `feeds_file` varchar(30) DEFAULT NULL COMMENT 'File Name of untarred feeds source file in Feeds',
  `cik` int(11) DEFAULT NULL COMMENT 'CIK from associated with the series in header',
  `series_id` int(11) DEFAULT NULL COMMENT 'Series ID from header',
  `class_id` int(11) DEFAULT NULL COMMENT 'Class ID from header',
  `class_name` varchar(255) DEFAULT NULL COMMENT 'Series Name from header',
  PRIMARY KEY (`id`),
  UNIQUE KEY `udx_feeds_file_class` (`feeds_date`,`feeds_file`,`cik`,`series_id`,`class_id`),
  KEY `idx_feeds_class_class_id` (`class_id`),
  KEY `idx_feeds_class_series_id` (`series_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci COMMENT='insert in order found';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `feeds_file_document`
--

DROP TABLE IF EXISTS `feeds_file_document`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `feeds_file_document` (
  `feeds_date` char(10) DEFAULT NULL COMMENT 'Feeds Date (yyyymmdd) multipart Primary Key',
  `feeds_file` varchar(30) DEFAULT NULL COMMENT 'File Name of untarred feeds source file. multipart Primary Key',
  `sequence` smallint(6) NOT NULL COMMENT 'multipart Primary Key',
  `file_name` varchar(255) NOT NULL COMMENT 'as stored on disk',
  `file_type` varchar(255) DEFAULT NULL,
  `file_description` varchar(255) DEFAULT NULL,
  `file_size` int(11) DEFAULT NULL COMMENT 'multipart Primary Key',
  `file_ext` varchar(10) DEFAULT NULL COMMENT 'index',
  `time_stamp` datetime DEFAULT current_timestamp()  COMMENT 'Create Time',
  PRIMARY KEY (`feeds_date`,`feeds_file`,`sequence`),
  UNIQUE KEY `udx_filing_doc_file_name` (`feeds_file`,`feeds_date`,`file_name`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `feeds_file_series`
--


/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-09-27 20:43:22
