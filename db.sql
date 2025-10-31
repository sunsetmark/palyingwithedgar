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
  `adsh` char(20) NOT NULL COMMENT 'Accession Number with dashes',
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
  `cik` BIGINT UNSIGNED DEFAULT NULL COMMENT 'CIK from header',
  `filer_type` VARCHAR(2) COMMENT 'F|R|I|SC|D|S|FF|IE|FB|U  for filer|reporter|issuer|subject_company|DEPOSITOR|SECURITIZER|FILED-FOR|ISSUING_ENTITY|FILED-BY|ISSUER|UNDERWRITER',
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
  `is_new` tinyint(6) DEFAULT 0 NOT NULL COMMENT ' 1= new else existing',
  `cik` BIGINT UNSIGNED DEFAULT NULL COMMENT 'CIK from header',
  `series_id` int(11) UNSIGNED DEFAULT NULL COMMENT 'Series ID from header',
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
  `cik` BIGINT UNSIGNED DEFAULT NULL COMMENT 'CIK from associated with the series in header',
  `series_id` int(11)UNSIGNED DEFAULT NULL COMMENT 'Series ID from header',
  `class_id` int(11) UNSIGNED DEFAULT NULL COMMENT 'Class ID from header',
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
  `file_size` int(11) DEFAULT NULL COMMENT 'file size on disk',
  `file_size_raw` int(11) DEFAULT NULL COMMENT 'file size in dissem file',
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

-- ============================================================================
-- EDGAR Submission Tables DDL
-- ============================================================================
-- This file contains the Data Definition Language (DDL) for storing EDGAR
-- submission metadata from ${feedDate}_${adsh}.nc.json files.
--
-- These tables store the CURRENT state of submissions, not the history.
-- All submission_* tables include 'created' and 'modified' timestamp fields.
-- ============================================================================

-- ============================================================================
-- REFERENCE TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- state_country_ref: Location codes mapping EDGAR codes to ISO standards
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS state_country_ref;
CREATE TABLE state_country_ref (
    edgar_code VARCHAR(2) NOT NULL PRIMARY KEY,
    iso_country CHAR(3),
    state_prov_code VARCHAR(2),
    country_name VARCHAR(100) NOT NULL,
    state_prov_name VARCHAR(100),
    created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert US States
INSERT INTO state_country_ref (edgar_code, iso_country, state_prov_code, country_name, state_prov_name) VALUES
('AL', 'USA', 'AL', 'United States', 'Alabama'),
('AK', 'USA', 'AK', 'United States', 'Alaska'),
('AZ', 'USA', 'AZ', 'United States', 'Arizona'),
('AR', 'USA', 'AR', 'United States', 'Arkansas'),
('CA', 'USA', 'CA', 'United States', 'California'),
('CO', 'USA', 'CO', 'United States', 'Colorado'),
('CT', 'USA', 'CT', 'United States', 'Connecticut'),
('DE', 'USA', 'DE', 'United States', 'Delaware'),
('DC', 'USA', 'DC', 'United States', 'District of Columbia'),
('FL', 'USA', 'FL', 'United States', 'Florida'),
('GA', 'USA', 'GA', 'United States', 'Georgia'),
('HI', 'USA', 'HI', 'United States', 'Hawaii'),
('ID', 'USA', 'ID', 'United States', 'Idaho'),
('IL', 'USA', 'IL', 'United States', 'Illinois'),
('IN', 'USA', 'IN', 'United States', 'Indiana'),
('IA', 'USA', 'IA', 'United States', 'Iowa'),
('KS', 'USA', 'KS', 'United States', 'Kansas'),
('KY', 'USA', 'KY', 'United States', 'Kentucky'),
('LA', 'USA', 'LA', 'United States', 'Louisiana'),
('ME', 'USA', 'ME', 'United States', 'Maine'),
('MD', 'USA', 'MD', 'United States', 'Maryland'),
('MA', 'USA', 'MA', 'United States', 'Massachusetts'),
('MI', 'USA', 'MI', 'United States', 'Michigan'),
('MN', 'USA', 'MN', 'United States', 'Minnesota'),
('MS', 'USA', 'MS', 'United States', 'Mississippi'),
('MO', 'USA', 'MO', 'United States', 'Missouri'),
('MT', 'USA', 'MT', 'United States', 'Montana'),
('NE', 'USA', 'NE', 'United States', 'Nebraska'),
('NV', 'USA', 'NV', 'United States', 'Nevada'),
('NH', 'USA', 'NH', 'United States', 'New Hampshire'),
('NJ', 'USA', 'NJ', 'United States', 'New Jersey'),
('NM', 'USA', 'NM', 'United States', 'New Mexico'),
('NY', 'USA', 'NY', 'United States', 'New York'),
('NC', 'USA', 'NC', 'United States', 'North Carolina'),
('ND', 'USA', 'ND', 'United States', 'North Dakota'),
('OH', 'USA', 'OH', 'United States', 'Ohio'),
('OK', 'USA', 'OK', 'United States', 'Oklahoma'),
('OR', 'USA', 'OR', 'United States', 'Oregon'),
('PA', 'USA', 'PA', 'United States', 'Pennsylvania'),
('RI', 'USA', 'RI', 'United States', 'Rhode Island'),
('SC', 'USA', 'SC', 'United States', 'South Carolina'),
('SD', 'USA', 'SD', 'United States', 'South Dakota'),
('TN', 'USA', 'TN', 'United States', 'Tennessee'),
('TX', 'USA', 'TX', 'United States', 'Texas'),
('X1', 'USA', NULL, 'United States', 'United States'),
('UT', 'USA', 'UT', 'United States', 'Utah'),
('VT', 'USA', 'VT', 'United States', 'Vermont'),
('VA', 'USA', 'VA', 'United States', 'Virginia'),
('WA', 'USA', 'WA', 'United States', 'Washington'),
('WV', 'USA', 'WV', 'United States', 'West Virginia'),
('WI', 'USA', 'WI', 'United States', 'Wisconsin'),
('WY', 'USA', 'WY', 'United States', 'Wyoming');

-- Insert Canadian Provinces
INSERT INTO state_country_ref (edgar_code, iso_country, state_prov_code, country_name, state_prov_name) VALUES
('A0', 'CAN', 'AB', 'Canada', 'Alberta'),
('A1', 'CAN', 'BC', 'Canada', 'British Columbia'),
('A2', 'CAN', 'MB', 'Canada', 'Manitoba'),
('A3', 'CAN', 'NB', 'Canada', 'New Brunswick'),
('A4', 'CAN', 'NL', 'Canada', 'Newfoundland'),
('A5', 'CAN', 'NS', 'Canada', 'Nova Scotia'),
('A6', 'CAN', 'ON', 'Canada', 'Ontario'),
('A7', 'CAN', 'PE', 'Canada', 'Prince Edward Island'),
('A8', 'CAN', 'QC', 'Canada', 'Quebec'),
('A9', 'CAN', 'SK', 'Canada', 'Saskatchewan'),
('B0', 'CAN', 'YT', 'Canada', 'Yukon'),
('Z4', 'CAN', NULL, 'Canada', 'Canada (Federal Level)');

-- Insert Other Countries
INSERT INTO state_country_ref (edgar_code, iso_country, state_prov_code, country_name, state_prov_name) VALUES
('B2', 'AFG', NULL, 'Afghanistan', NULL),
('Y6', 'ALA', NULL, 'Aland Islands', NULL),
('B3', 'ALB', NULL, 'Albania', NULL),
('B4', 'DZA', NULL, 'Algeria', NULL),
('B5', 'ASM', NULL, 'American Samoa', NULL),
('B6', 'AND', NULL, 'Andorra', NULL),
('B7', 'AGO', NULL, 'Angola', NULL),
('1A', 'AIA', NULL, 'Anguilla', NULL),
('B8', 'ATA', NULL, 'Antarctica', NULL),
('B9', 'ATG', NULL, 'Antigua and Barbuda', NULL),
('C1', 'ARG', NULL, 'Argentina', NULL),
('1B', 'ARM', NULL, 'Armenia', NULL),
('1C', 'ABW', NULL, 'Aruba', NULL),
('C3', 'AUS', NULL, 'Australia', NULL),
('C4', 'AUT', NULL, 'Austria', NULL),
('1D', 'AZE', NULL, 'Azerbaijan', NULL),
('C5', 'BHS', NULL, 'Bahamas', NULL),
('C6', 'BHR', NULL, 'Bahrain', NULL),
('C7', 'BGD', NULL, 'Bangladesh', NULL),
('C8', 'BRB', NULL, 'Barbados', NULL),
('1F', 'BLR', NULL, 'Belarus', NULL),
('C9', 'BEL', NULL, 'Belgium', NULL),
('D1', 'BLZ', NULL, 'Belize', NULL),
('G6', 'BEN', NULL, 'Benin', NULL),
('D0', 'BMU', NULL, 'Bermuda', NULL),
('D2', 'BTN', NULL, 'Bhutan', NULL),
('D3', 'BOL', NULL, 'Bolivia', NULL),
('1E', 'BIH', NULL, 'Bosnia and Herzegovina', NULL),
('B1', 'BWA', NULL, 'Botswana', NULL),
('D4', 'BVT', NULL, 'Bouvet Island', NULL),
('D5', 'BRA', NULL, 'Brazil', NULL),
('D6', 'IOT', NULL, 'British Indian Ocean Territory', NULL),
('D9', 'BRN', NULL, 'Brunei Darussalam', NULL),
('E0', 'BGR', NULL, 'Bulgaria', NULL),
('X2', 'BFA', NULL, 'Burkina Faso', NULL),
('E2', 'BDI', NULL, 'Burundi', NULL),
('E3', 'KHM', NULL, 'Cambodia', NULL),
('E4', 'CMR', NULL, 'Cameroon', NULL),
('E8', 'CPV', NULL, 'Cape Verde', NULL),
('E9', 'CYM', NULL, 'Cayman Islands', NULL),
('F0', 'CAF', NULL, 'Central African Republic', NULL),
('F2', 'TCD', NULL, 'Chad', NULL),
('F3', 'CHL', NULL, 'Chile', NULL),
('F4', 'CHN', NULL, 'China', NULL),
('F6', 'CXR', NULL, 'Christmas Island', NULL),
('F7', 'CCK', NULL, 'Cocos (Keeling) Islands', NULL),
('F8', 'COL', NULL, 'Colombia', NULL),
('F9', 'COM', NULL, 'Comoros', NULL),
('G0', 'COG', NULL, 'Congo', NULL),
('Y3', 'COD', NULL, 'Congo, The Democratic Republic of the', NULL),
('G1', 'COK', NULL, 'Cook Islands', NULL),
('G2', 'CRI', NULL, 'Costa Rica', NULL),
('L7', 'CIV', NULL, 'Cote d\'Ivoire', NULL),
('1M', 'HRV', NULL, 'Croatia', NULL),
('G3', 'CUB', NULL, 'Cuba', NULL),
('G4', 'CYP', NULL, 'Cyprus', NULL),
('2N', 'CZE', NULL, 'Czech Republic', NULL),
('G7', 'DNK', NULL, 'Denmark', NULL),
('1G', 'DJI', NULL, 'Djibouti', NULL),
('G9', 'DMA', NULL, 'Dominica', NULL),
('G8', 'DOM', NULL, 'Dominican Republic', NULL),
('H1', 'ECU', NULL, 'Ecuador', NULL),
('H2', 'EGY', NULL, 'Egypt', NULL),
('H3', 'SLV', NULL, 'El Salvador', NULL),
('H4', 'GNQ', NULL, 'Equatorial Guinea', NULL),
('1J', 'ERI', NULL, 'Eritrea', NULL),
('1H', 'EST', NULL, 'Estonia', NULL),
('H5', 'ETH', NULL, 'Ethiopia', NULL),
('H7', 'FLK', NULL, 'Falkland Islands (Malvinas)', NULL),
('H6', 'FRO', NULL, 'Faroe Islands', NULL),
('H8', 'FJI', NULL, 'Fiji', NULL),
('H9', 'FIN', NULL, 'Finland', NULL),
('I0', 'FRA', NULL, 'France', NULL),
('I3', 'GUF', NULL, 'French Guiana', NULL),
('I4', 'PYF', NULL, 'French Polynesia', NULL),
('2C', 'ATF', NULL, 'French Southern Territories', NULL),
('I5', 'GAB', NULL, 'Gabon', NULL),
('I6', 'GMB', NULL, 'Gambia', NULL),
('2Q', 'GEO', NULL, 'Georgia', NULL),
('2M', 'DEU', NULL, 'Germany', NULL),
('J0', 'GHA', NULL, 'Ghana', NULL),
('J1', 'GIB', NULL, 'Gibraltar', NULL),
('J3', 'GRC', NULL, 'Greece', NULL),
('J4', 'GRL', NULL, 'Greenland', NULL),
('J5', 'GRD', NULL, 'Grenada', NULL),
('J6', 'GLP', NULL, 'Guadeloupe', NULL),
('GU', 'GUM', NULL, 'Guam', NULL),
('J8', 'GTM', NULL, 'Guatemala', NULL),
('Y7', 'GGY', NULL, 'Guernsey', NULL),
('J9', 'GIN', NULL, 'Guinea', NULL),
('S0', 'GNB', NULL, 'Guinea-Bissau', NULL),
('K0', 'GUY', NULL, 'Guyana', NULL),
('K1', 'HTI', NULL, 'Haiti', NULL),
('K4', 'HMD', NULL, 'Heard Island and McDonald Islands', NULL),
('X4', 'VAT', NULL, 'Holy See (Vatican City State)', NULL),
('K2', 'HND', NULL, 'Honduras', NULL),
('K3', 'HKG', NULL, 'Hong Kong', NULL),
('K5', 'HUN', NULL, 'Hungary', NULL),
('K6', 'ISL', NULL, 'Iceland', NULL),
('K7', 'IND', NULL, 'India', NULL),
('K8', 'IDN', NULL, 'Indonesia', NULL),
('K9', 'IRN', NULL, 'Iran, Islamic Republic of', NULL),
('L0', 'IRQ', NULL, 'Iraq', NULL),
('L2', 'IRL', NULL, 'Ireland', NULL),
('Y8', 'IMN', NULL, 'Isle of Man', NULL),
('L3', 'ISR', NULL, 'Israel', NULL),
('L6', 'ITA', NULL, 'Italy', NULL),
('L8', 'JAM', NULL, 'Jamaica', NULL),
('M0', 'JPN', NULL, 'Japan', NULL),
('Y9', 'JEY', NULL, 'Jersey', NULL),
('M2', 'JOR', NULL, 'Jordan', NULL),
('1P', 'KAZ', NULL, 'Kazakhstan', NULL),
('M3', 'KEN', NULL, 'Kenya', NULL),
('J2', 'KIR', NULL, 'Kiribati', NULL),
('M4', 'PRK', NULL, 'Korea, Democratic People\'s Republic of', NULL),
('M5', 'KOR', NULL, 'Korea, Republic of', NULL),
('M6', 'KWT', NULL, 'Kuwait', NULL),
('1N', 'KGZ', NULL, 'Kyrgyzstan', NULL),
('M7', 'LAO', NULL, 'Lao People\'s Democratic Republic', NULL),
('1R', 'LVA', NULL, 'Latvia', NULL),
('M8', 'LBN', NULL, 'Lebanon', NULL),
('M9', 'LSO', NULL, 'Lesotho', NULL),
('N0', 'LBR', NULL, 'Liberia', NULL),
('N1', 'LBY', NULL, 'Libyan Arab Jamahiriya', NULL),
('N2', 'LIE', NULL, 'Liechtenstein', NULL),
('1Q', 'LTU', NULL, 'Lithuania', NULL),
('N4', 'LUX', NULL, 'Luxembourg', NULL),
('N5', 'MAC', NULL, 'Macau', NULL),
('1U', 'MKD', NULL, 'Macedonia, The Former Yugoslav Republic of', NULL),
('N6', 'MDG', NULL, 'Madagascar', NULL),
('N7', 'MWI', NULL, 'Malawi', NULL),
('N8', 'MYS', NULL, 'Malaysia', NULL),
('N9', 'MDV', NULL, 'Maldives', NULL),
('O0', 'MLI', NULL, 'Mali', NULL),
('O1', 'MLT', NULL, 'Malta', NULL),
('1T', 'MHL', NULL, 'Marshall Islands', NULL),
('O2', 'MTQ', NULL, 'Martinique', NULL),
('O3', 'MRT', NULL, 'Mauritania', NULL),
('O4', 'MUS', NULL, 'Mauritius', NULL),
('2P', 'MYT', NULL, 'Mayotte', NULL),
('O5', 'MEX', NULL, 'Mexico', NULL),
('1K', 'FSM', NULL, 'Micronesia, Federated States of', NULL),
('1S', 'MDA', NULL, 'Moldova, Republic of', NULL),
('O9', 'MCO', NULL, 'Monaco', NULL),
('P0', 'MNG', NULL, 'Mongolia', NULL),
('Z5', 'MNE', NULL, 'Montenegro', NULL),
('P1', 'MSR', NULL, 'Montserrat', NULL),
('P2', 'MAR', NULL, 'Morocco', NULL),
('P3', 'MOZ', NULL, 'Mozambique', NULL),
('E1', 'MMR', NULL, 'Myanmar', NULL),
('T6', 'NAM', NULL, 'Namibia', NULL),
('P5', 'NRU', NULL, 'Nauru', NULL),
('P6', 'NPL', NULL, 'Nepal', NULL),
('P7', 'NLD', NULL, 'Netherlands', NULL),
('P8', 'ANT', NULL, 'Netherlands Antilles', NULL),
('1W', 'NCL', NULL, 'New Caledonia', NULL),
('Q2', 'NZL', NULL, 'New Zealand', NULL),
('Q3', 'NIC', NULL, 'Nicaragua', NULL),
('Q4', 'NER', NULL, 'Niger', NULL),
('Q5', 'NGA', NULL, 'Nigeria', NULL),
('Q6', 'NIU', NULL, 'Niue', NULL),
('Q7', 'NFK', NULL, 'Norfolk Island', NULL),
('1V', 'MNP', NULL, 'Northern Mariana Islands', NULL),
('Q8', 'NOR', NULL, 'Norway', NULL),
('P4', 'OMN', NULL, 'Oman', NULL),
('R0', 'PAK', NULL, 'Pakistan', NULL),
('1Y', 'PLW', NULL, 'Palau', NULL),
('1X', 'PSE', NULL, 'Palestinian Territory, Occupied', NULL),
('R1', 'PAN', NULL, 'Panama', NULL),
('R2', 'PNG', NULL, 'Papua New Guinea', NULL),
('R4', 'PRY', NULL, 'Paraguay', NULL),
('R5', 'PER', NULL, 'Peru', NULL),
('R6', 'PHL', NULL, 'Philippines', NULL),
('R8', 'PCN', NULL, 'Pitcairn', NULL),
('R9', 'POL', NULL, 'Poland', NULL),
('S1', 'PRT', NULL, 'Portugal', NULL),
('PR', 'PRI', NULL, 'Puerto Rico', NULL),
('S3', 'QAT', NULL, 'Qatar', NULL),
('S4', 'REU', NULL, 'Reunion', NULL),
('S5', 'ROU', NULL, 'Romania', NULL),
('1Z', 'RUS', NULL, 'Russian Federation', NULL),
('S6', 'RWA', NULL, 'Rwanda', NULL),
('Z0', 'BLM', NULL, 'Saint Barthelemy', NULL),
('U8', 'SHN', NULL, 'Saint Helena', NULL),
('U7', 'KNA', NULL, 'Saint Kitts and Nevis', NULL),
('U9', 'LCA', NULL, 'Saint Lucia', NULL),
('Z1', 'MAF', NULL, 'Saint Martin', NULL),
('V0', 'SPM', NULL, 'Saint Pierre and Miquelon', NULL),
('V1', 'VCT', NULL, 'Saint Vincent and the Grenadines', NULL),
('Y0', 'WSM', NULL, 'Samoa', NULL),
('S8', 'SMR', NULL, 'San Marino', NULL),
('S9', 'STP', NULL, 'Sao Tome and Principe', NULL),
('T0', 'SAU', NULL, 'Saudi Arabia', NULL),
('T1', 'SEN', NULL, 'Senegal', NULL),
('Z2', 'SRB', NULL, 'Serbia', NULL),
('T2', 'SYC', NULL, 'Seychelles', NULL),
('T8', 'SLE', NULL, 'Sierra Leone', NULL),
('U0', 'SGP', NULL, 'Singapore', NULL),
('2B', 'SVK', NULL, 'Slovakia', NULL),
('2A', 'SVN', NULL, 'Slovenia', NULL),
('D7', 'SLB', NULL, 'Solomon Islands', NULL),
('U1', 'SOM', NULL, 'Somalia', NULL),
('T3', 'ZAF', NULL, 'South Africa', NULL),
('1L', 'SGS', NULL, 'South Georgia and the South Sandwich Islands', NULL),
('U3', 'ESP', NULL, 'Spain', NULL),
('F1', 'LKA', NULL, 'Sri Lanka', NULL),
('V2', 'SDN', NULL, 'Sudan', NULL),
('V3', 'SUR', NULL, 'Suriname', NULL),
('L9', 'SJM', NULL, 'Svalbard and Jan Mayen', NULL),
('V6', 'SWZ', NULL, 'Swaziland', NULL),
('V7', 'SWE', NULL, 'Sweden', NULL),
('V8', 'CHE', NULL, 'Switzerland', NULL),
('V9', 'SYR', NULL, 'Syrian Arab Republic', NULL),
('F5', 'TWN', NULL, 'Taiwan', NULL),
('2D', 'TJK', NULL, 'Tajikistan', NULL),
('W0', 'TZA', NULL, 'Tanzania, United Republic of', NULL),
('W1', 'THA', NULL, 'Thailand', NULL),
('Z3', 'TLS', NULL, 'Timor-Leste', NULL),
('W2', 'TGO', NULL, 'Togo', NULL),
('W3', 'TKL', NULL, 'Tokelau', NULL),
('W4', 'TON', NULL, 'Tonga', NULL),
('W5', 'TTO', NULL, 'Trinidad and Tobago', NULL),
('W6', 'TUN', NULL, 'Tunisia', NULL),
('W8', 'TUR', NULL, 'Turkey', NULL),
('2E', 'TKM', NULL, 'Turkmenistan', NULL),
('W7', 'TCA', NULL, 'Turks and Caicos Islands', NULL),
('2G', 'TUV', NULL, 'Tuvalu', NULL),
('W9', 'UGA', NULL, 'Uganda', NULL),
('2H', 'UKR', NULL, 'Ukraine', NULL),
('C0', 'ARE', NULL, 'United Arab Emirates', NULL),
('X0', 'GBR', NULL, 'United Kingdom', NULL),
('2J', 'UMI', NULL, 'United States Minor Outlying Islands', NULL),
('X3', 'URY', NULL, 'Uruguay', NULL),
('2K', 'UZB', NULL, 'Uzbekistan', NULL),
('2L', 'VUT', NULL, 'Vanuatu', NULL),
('X5', 'VEN', NULL, 'Venezuela', NULL),
('Q1', 'VNM', NULL, 'Viet Nam', NULL),
('D8', 'VGB', NULL, 'Virgin Islands, British', NULL),
('VI', 'VIR', NULL, 'Virgin Islands, U.S.', NULL),
('X8', 'WLF', NULL, 'Wallis and Futuna', NULL),
('U5', 'ESH', NULL, 'Western Sahara', NULL),
('T7', 'YEM', NULL, 'Yemen', NULL),
('Y4', 'ZMB', NULL, 'Zambia', NULL),
('Y5', 'ZWE', NULL, 'Zimbabwe', NULL),
('XX', 'XXX', NULL, 'Unknown', NULL);

-- ----------------------------------------------------------------------------
-- filer_type_ref: Filer type codes
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS submission_entity;  --move up due to FK constraint on filer_type_ref
DROP TABLE IF EXISTS filer_type_ref;
CREATE TABLE filer_type_ref (
    filer_code CHAR(2) NOT NULL PRIMARY KEY,
    filer_type VARCHAR(50) NOT NULL,
    created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO filer_type_ref (filer_code, filer_type) VALUES
('F', 'filer'),
('RO', 'reporting_owner'),
('I', 'issuer'),
('SC', 'subject_company'),
('D', 'depositor'),
('S', 'securitizer'),
('FF', 'filed_for'),
('IE', 'issuing_entity'),
('FB', 'filed_by'),
('U', 'underwriter');

-- ----------------------------------------------------------------------------
-- item_ref: Item codes and descriptions
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS item_ref;
CREATE TABLE item_ref (
    item_code VARCHAR(10) NOT NULL,
    form VARCHAR(10),
    item_name VARCHAR(500) NOT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (item_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert item descriptions from lookup-data.js
INSERT INTO item_ref (item_code, form, item_name, is_active) VALUES
('1.01', NULL, 'Entry into a Material Definitive Agreement', 1),
('1.02', NULL, 'Termination of a Material Definitive Agreement', 1),
('1.03', NULL, 'Bankruptcy or Receivership', 1),
('1.04', NULL, 'Mine Safety - Reporting of Shutdowns and Patterns of Violations', 1),
('2.01', NULL, 'Completion of Acquisition or Disposition of Assets', 1),
('2.02', NULL, 'Results of Operations and Financial Condition', 1),
('2.03', NULL, 'Creation of a Direct Financial Obligation or an Obligation under an Off-Balance Sheet Arrangement of a Registrant', 1),
('2.04', NULL, 'Triggering Events That Accelerate or Increase a Direct Financial Obligation or an Obligation under an Off-Balance Sheet Arrangement', 1),
('2.05', NULL, 'Costs Associated with Exit or Disposal Activities', 1),
('2.06', NULL, 'Material Impairments', 1),
('3.01', NULL, 'Notice of Delisting or Failure to Satisfy a Continued Listing Rule or Standard Transfer of Listing', 1),
('3.02', NULL, 'Unregistered Sales of Equity Securities', 1),
('3.03', NULL, 'Material Modification to Rights of Security Holders', 1),
('4.01', NULL, 'Changes in Registrant\'s Certifying Accountant', 1),
('4.02', NULL, 'Non-Reliance on Previously Issued Financial Statements or a Related Audit Report or Completed Interim Review', 1),
('5.01', NULL, 'Changes in Control of Registrant', 1),
('5.02', NULL, 'Departure of Directors or Certain Officers Election of Directors Appointment of Certain Officers Compensatory Arrangements of Certain Officers', 1),
('5.03', NULL, 'Amendments to Articles of Incorporation or Bylaws Change in Fiscal Year', 1),
('5.04', NULL, 'Temporary Suspension of Trading Under Registrant\'s Employee Benefit Plans', 1),
('5.05', NULL, 'Amendment to Registrant\'s Code of Ethics, or Waiver of a Provision of the Code of Ethics', 1),
('5.06', NULL, 'Change in Shell Company Status', 1),
('5.07', NULL, 'Submission of Matters to a Vote of Security Holders', 1),
('5.08', NULL, 'Shareholder Director Nominations', 1),
('6.01', NULL, 'ABS Informational and Computational Material', 1),
('6.02', NULL, 'Change of Servicer or Trustee', 1),
('6.03', NULL, 'Change in Credit Enhancement or Other External Support', 1),
('6.04', NULL, 'Failure to Make a Required Distribution', 1),
('6.05', NULL, 'Securities Act Updating Disclosure', 1),
('7.01', NULL, 'Regulation FD Disclosure', 1),
('8.01', NULL, 'Other Events (The registrant can use this Item to report events that are not specifically called for by Form 8-K, that the registrant considers to be of importance to security holders.)', 1),
('9.01', NULL, 'Financial Statements and Exhibits', 1),
('1', NULL, 'Changes in control of registrant', 1),
('2', NULL, 'Acquisition or disposition of assets', 1),
('3', NULL, 'Bankruptcy or receivership', 1),
('4', NULL, 'Changes in registrant\'s certifying accountant', 1),
('5', NULL, 'Other events', 1),
('6', NULL, 'Resignations of registrant\'s directors', 1),
('7', NULL, 'Financial statements and exhibits', 1),
('8', NULL, 'Change in fiscal year', 1),
('9', NULL, 'Regulation FD Disclosure', 1),
('10', NULL, 'Amendments to the Registrant\'s Code of Ethics', 1),
('11', NULL, 'Temporary Suspension of Trading Under Registrant\'s Employee Benefit Plans', 1),
('12', NULL, 'Results of Operations and Financial Condition', 1),
('13', NULL, 'Receipt of an Attorney\'s Written Notice Pursuant to 17 CFR 205.3(d)', 1);

-- ----------------------------------------------------------------------------
-- form_type_ref: Form types with descriptions
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS form_type_ref;
CREATE TABLE form_type_ref (
    form_type VARCHAR(20) NOT NULL PRIMARY KEY,
    name VARCHAR(255),
    description VARCHAR(1000),
    activated DATE DEFAULT NULL,
    deprecated DATE DEFAULT NULL,
    created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert form types from lookup-data.js
-- Format from lookup-data.js: "form":"flag|priority|name|description|short_description"
INSERT INTO form_type_ref (form_type, name, description, activated, deprecated) VALUES
('1', 'Application for Registration or Exemption from Registration as a National Securities Exchange', NULL, NULL, NULL),
('3', 'Initial statement of beneficial ownership of securities', 'Initial insider holdings report', NULL, NULL),
('4', 'Statement of changes in beneficial ownership of securities', 'Insider trading report', NULL, NULL),
('5', 'Annual statement of changes in beneficial ownership of securities', 'Annual insider trading report', NULL, NULL),
('25', 'Notification of the removal from listing and registration of matured, redeemed or retired securities', 'Notice of listing removal', NULL, NULL),
('144', 'Report of proposed sale of securities', 'Sale of securities', NULL, NULL),
('425', 'Prospectuses and communications, business combinations', 'Prospectus/communication re business combination', NULL, NULL),
('497', 'Definitive materials', 'Prospectus', NULL, NULL),
('10-12B', 'Registration of securities [Section 12(b)]', 'Registration statement', NULL, NULL),
('10-12G', 'Registration of securities [Section 12(g)]', 'Registration statement', NULL, NULL),
('10-D', 'Asset-Backed Issuer Distribution Report [Section 13 or 15(d) of the Securities Exchange Act of 1934]', 'Distribution report', NULL, NULL),
('10-K', 'Annual report [Section 13 and 15(d), not S-K Item 405]', 'Annual report', NULL, NULL),
('10-Q', 'Quarterly report [Sections 13 or 15(d)]', 'Quarterly report', NULL, NULL),
('10-KT', 'Transition reports [Rule 13a-10 or 15d-10]', 'Transition report', NULL, NULL),
('10-QT', 'Transition reports [Rule 13a-10 or 15d-10]', 'Transition report', NULL, NULL),
('11-K', 'Annual report of employee stock purchase, savings and similar plans', 'Annual report', NULL, NULL),
('13F-HR', 'Quarterly report filed by institutional managers, Holdings', 'Institutional investment manager holdings report', NULL, NULL),
('13F-NT', 'Quarterly report filed by institutional managers, Notice', 'Institutional investment manager notice', NULL, NULL),
('15-12B', 'Securities registration termination [Section 12(b)]', 'Termination notice', NULL, NULL),
('15-12G', 'Securities registration termination [Section 12(g)]', 'Termination notice', NULL, NULL),
('15-15D', 'Suspension of duty to report [Section 13 and 15(d)]', 'Suspension notice', NULL, NULL),
('18-12B', 'Registration of securities [Section 12(b)]', 'Registration statement', NULL, NULL),
('18-K', 'Annual report for foreign governments and political subdivisions', 'Annual report', NULL, NULL),
('20-F', 'Annual and transition report of foreign private issuers [Sections 13 or 15(d)]', 'Annual report - foreign issuer', NULL, NULL),
('20FR12B', 'Registration of securities [Section 12(b)]', 'Registration statement', NULL, NULL),
('24F-2NT', 'Rule 24f-2 notice', 'Annual notice of securities sold', NULL, NULL),
('40-F', 'Annual report - foreign issuer [Section 13(a), 15(d)]', 'Registration statement', NULL, NULL),
('40FR12B', 'Registration of a Class of Securities of certain Canadian issuers [Section 12(b)]', 'Registration statement', NULL, NULL),
('424A', 'Prospectus [Rule 424(a)]', 'Prospectus', NULL, NULL),
('424B1', 'Prospectus [Rule 424(b)(1)]', 'Prospectus', NULL, NULL),
('424B2', 'Prospectus [Rule 424(b)(2)]', 'Prospectus', NULL, NULL),
('424B3', 'Prospectus [Rule 424(b)(3)]', 'Prospectus', NULL, NULL),
('424B4', 'Prospectus [Rule 424(b)(4)]', 'Prospectus', NULL, NULL),
('424B5', 'Prospectus [Rule 424(b)(5)]', 'Prospectus', NULL, NULL),
('424B7', 'Prospectus [Rule 424(b)(7)]', 'Prospectus', NULL, NULL),
('424B8', 'Prospectus filed pursuant to Rule 424(b)(8)', 'Prospectus', NULL, NULL),
('485APOS', 'Post-effective amendment [Rule 485(a)]', 'Prospectus materials', NULL, NULL),
('485BPOS', 'Post-effective amendment [Rule 485(b)]', 'Prospectus materials', NULL, NULL),
('497J', 'Certification of no change in definitive materials', 'Prospectus materials', NULL, NULL),
('497K', 'Summary Prospectus for certain open-end management investment companies filed pursuant to Securities Act Rule 497(K)', 'Summary prospectus', NULL, NULL),
('6-K', 'Report of foreign issuer [Rules 13a-16 and 15d-16]', 'Current report', NULL, NULL),
('8-A12B', 'Registration of securities [Section 12(b)]', 'Registration statement', NULL, NULL),
('8-A12G', 'Registration of securities [Section 12(g)]', 'Registration statement', NULL, NULL),
('8-K', 'Current report', 'Current report', NULL, NULL),
('ARS', 'Annual Report to Security Holders', 'Annual report', NULL, NULL),
('AW', 'Amendment Withdrawal Request', 'Withdrawal', NULL, NULL),
('C', 'Offering Statement', 'Offering statement', NULL, NULL),
('C-W', 'Offering Statement Withdrawal', 'Withdrawal', NULL, NULL),
('C-U', 'Progress Update', 'Progress update', NULL, NULL),
('C-AR', 'Annual Report', 'Annual report', NULL, NULL),
('C-TR', 'Termination of Reporting', 'Termination', NULL, NULL),
('CB', 'Tender Offer/Rights Offering Notification Form', NULL, NULL, NULL),
('CORRESP', 'Correspondence', 'Correspondence', NULL, NULL),
('D', 'Notice of Exempt Offering of Securities', 'Exempt offering notice', NULL, NULL),
('DEF 14A', 'Definitive proxy statements', 'Proxy statement', NULL, NULL),
('DEFA14A', 'Additional proxy soliciting materials', 'Proxy materials', NULL, NULL),
('DEFM14A', 'Definitive proxy statement relating to merger or acquisition', 'Merger proxy', NULL, NULL),
('DEFR14A', 'Definitive revised proxy soliciting materials', 'Revised proxy', NULL, NULL),
('F-1', 'Registration statement for certain foreign private issuers', 'Registration statement', NULL, NULL),
('F-3', 'Registration statement for specified transactions by certain foreign private issuers', 'Registration statement', NULL, NULL),
('F-4', 'Registration statement for securities issued in business combination transactions by foreign private issuers', 'Registration statement', NULL, NULL),
('FWP', 'Filing under Securities Act Rules 163/433 of free writing prospectuses', 'Free writing prospectus', NULL, NULL),
('N-1A', 'Registration statement for open-end management investment companies', 'Registration statement', NULL, NULL),
('N-2', 'Registration statement for closed-end management investment companies', 'Registration statement', NULL, NULL),
('N-CSR', 'Certified annual shareholder report of registered management investment companies', 'Shareholder report', NULL, NULL),
('N-CSRS', 'Certified semi-annual shareholder report of registered management investment companies', 'Shareholder report', NULL, NULL),
('N-PX', 'Annual report of proxy voting record of registered management investment companies', 'Proxy voting record', NULL, NULL),
('NPORT-P', 'Monthly portfolio holdings report', 'Portfolio holdings', NULL, NULL),
('NT 10-K', 'Notice under Rule 12b-25 of inability to timely file Form 10-K', 'Notice - late filing', NULL, NULL),
('NT 10-Q', 'Notice under Rule 12b-25 of inability to timely file Form 10-Q', 'Notice - late filing', NULL, NULL),
('PREM14A', 'Preliminary proxy statement', 'Preliminary proxy', NULL, NULL),
('PRE 14A', 'Preliminary proxy statement', 'Preliminary proxy', NULL, NULL),
('S-1', 'General form of registration statement for all companies', 'Registration statement', NULL, NULL),
('S-3', 'Registration statement for specified transactions by certain issuers', 'Registration statement', NULL, NULL),
('S-4', 'Registration of securities issued in business combination transactions', 'Registration statement', NULL, NULL),
('S-8', 'Registration statement for securities to be offered to employees', 'Registration statement', NULL, NULL),
('SC 13D', 'Schedule filed to report acquisition of beneficial ownership of more than 5%', 'Beneficial ownership report', NULL, NULL),
('SC 13G', 'Schedule filed to report beneficial ownership of more than 5% by passive investors', 'Beneficial ownership report', NULL, NULL),
('SC 14D1', 'Tender offer statement', 'Tender offer', NULL, NULL),
('SC TO-I', 'Issuer tender offer statement', 'Tender offer', NULL, NULL),
('SD', 'Specialized disclosure report', 'Disclosure report', NULL, NULL),
('T-3', 'Application for qualification of indentures', 'Indenture application', NULL, NULL);




-- ============================================================================
-- ENTITY TABLES
-- ============================================================================
--DROP dependent tables first due to FK constraints:
DROP TABLE IF EXISTS entity_history;
DROP TABLE IF EXISTS entity;
-- ----------------------------------------------------------------------------
-- entity: Current entity info; COUPDAT updates copy record to entity_history before updating  
-- ----------------------------------------------------------------------------
--moved above the DROP filer_type_ref statement due to FK constraint: DROP TABLE IF EXISTS submission_entity;
CREATE TABLE entity (
    cik BIGINT UNSIGNED NOT NULL PRIMARY KEY,
    conformed_name VARCHAR(255) NOT NULL,
    organization_name VARCHAR(255) DEFAULT NULL,
    irs_number VARCHAR(20) DEFAULT NULL,
    state_of_incorporation VARCHAR(2) DEFAULT NULL,
    fiscal_year_end VARCHAR(4) DEFAULT NULL COMMENT 'MMDD format',
    assigned_sic VARCHAR(4) DEFAULT NULL,
    -- Filing values
    filing_form_type VARCHAR(20) DEFAULT NULL,
    filing_act VARCHAR(10) DEFAULT NULL,
    filing_file_number VARCHAR(20) DEFAULT NULL,
    filing_film_number VARCHAR(20) DEFAULT NULL,
    -- Business address
    business_street1 VARCHAR(255) DEFAULT NULL,
    business_street2 VARCHAR(255) DEFAULT NULL,
    business_city VARCHAR(100) DEFAULT NULL,
    business_state VARCHAR(2) DEFAULT NULL,
    business_zip VARCHAR(20) DEFAULT NULL,
    business_phone VARCHAR(20) DEFAULT NULL,
    -- Mail address
    mail_street1 VARCHAR(255) DEFAULT NULL,
    mail_street2 VARCHAR(255) DEFAULT NULL,
    mail_city VARCHAR(100) DEFAULT NULL,
    mail_state VARCHAR(2) DEFAULT NULL,
    mail_zip VARCHAR(20) DEFAULT NULL,
    created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- entity_history: Contiain entity change history from COUPDAT updates.  Used for audit and for <FORMER-COMPANY> in dssiminations  
-- ----------------------------------------------------------------------------
--moved above the DROP filer_type_ref statement due to FK constraint: DROP TABLE IF EXISTS submission_entity;
CREATE TABLE entity_history (
    -- Change order (multiple changes allowed on same date)
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    date_changed char(8) NOT NULL COMMENT 'YYYYMMDD format',
    -- Entity values
    cik BIGINT UNSIGNED NOT NULL,
    conformed_name VARCHAR(255) NOT NULL,
    organization_name VARCHAR(255) DEFAULT NULL,
    irs_number VARCHAR(20) DEFAULT NULL,
    state_of_incorporation VARCHAR(2) DEFAULT NULL,
    fiscal_year_end VARCHAR(4) DEFAULT NULL COMMENT 'MMDD format',
    assigned_sic VARCHAR(4) DEFAULT NULL,
    -- Filing values
    filing_form_type VARCHAR(20) DEFAULT NULL,
    filing_act VARCHAR(10) DEFAULT NULL,
    filing_file_number VARCHAR(20) DEFAULT NULL,
    filing_film_number VARCHAR(20) DEFAULT NULL,
    -- Business address
    business_street1 VARCHAR(255) DEFAULT NULL,
    business_street2 VARCHAR(255) DEFAULT NULL,
    business_city VARCHAR(100) DEFAULT NULL,
    business_state VARCHAR(2) DEFAULT NULL,
    business_zip VARCHAR(20) DEFAULT NULL,
    business_phone VARCHAR(20) DEFAULT NULL,
    -- Mail address
    mail_street1 VARCHAR(255) DEFAULT NULL,
    mail_street2 VARCHAR(255) DEFAULT NULL,
    mail_city VARCHAR(100) DEFAULT NULL,
    mail_state VARCHAR(2) DEFAULT NULL,
    mail_zip VARCHAR(20) DEFAULT NULL,
    created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_cik (cik),
    FOREIGN KEY (cik) REFERENCES entity(cik) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- SUBMISSION TABLES
-- ============================================================================
--DROP dependent tables first due to FK constraints:
DROP TABLE IF EXISTS submission_entity;
DROP TABLE IF EXISTS submission_document;
DROP TABLE IF EXISTS submission_former_name;
DROP TABLE IF EXISTS submission_document;
DROP TABLE IF EXISTS submission_class_contract;  --class_constract before series
DROP TABLE IF EXISTS submission_series;
DROP TABLE IF EXISTS submission_merger_class_contract;
DROP TABLE IF EXISTS submission_merger_series;
DROP TABLE IF EXISTS submission_item;
DROP TABLE IF EXISTS submission_references_429;
DROP TABLE IF EXISTS submission_group_members;
DROP TABLE IF EXISTS submission_rule_item;  --drop first due to foreign key constraint
DROP TABLE IF EXISTS submission_rule;
DROP TABLE IF EXISTS submission_target_data;
-- ----------------------------------------------------------------------------
-- submission: Main submission metadata table
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS submission;
CREATE TABLE submission (
    adsh VARCHAR(20) NOT NULL PRIMARY KEY COMMENT 'Accession number with dashes',
    type VARCHAR(20) NOT NULL COMMENT 'Form type',
    public TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Public submission flag',
    public_document_count INT DEFAULT NULL,
    period VARCHAR(8) DEFAULT NULL COMMENT 'Period ending date YYYYMMDD',
    period_start VARCHAR(8) DEFAULT NULL COMMENT 'Period start date YYYYMMDD',
    filing_date VARCHAR(8) DEFAULT NULL COMMENT 'Filing date YYYYMMDD',
    date_of_filing_date_change VARCHAR(8) DEFAULT NULL COMMENT 'Date of filing date change YYYYMMDD',
    effectiveness_date VARCHAR(8) DEFAULT NULL COMMENT 'Effectiveness date YYYYMMDD',
    acceptance_datetime VARCHAR(14) DEFAULT NULL COMMENT 'Acceptance datetime YYYYMMDDHHmmss',
    received_date VARCHAR(8) DEFAULT NULL COMMENT 'Received date YYYYMMDD',
    action_date VARCHAR(8) DEFAULT NULL COMMENT 'Action date YYYYMMDD',
    public_rel_date VARCHAR(8) DEFAULT NULL COMMENT 'Public release date YYYYMMDD',
    file_number VARCHAR(20) DEFAULT NULL,
    film_number VARCHAR(20) DEFAULT NULL,
    is_paper TINYINT(1) DEFAULT 0,
    -- Additional metadata fields
    ma_i_individual VARCHAR(255) DEFAULT NULL COMMENT 'MA-I individual name',
    previous_accession_number VARCHAR(20) DEFAULT NULL COMMENT 'Previous accession number for amendments',
    withdrawn_accession_number VARCHAR(20) DEFAULT NULL COMMENT 'Withdrawn accession number',
    public_reference_acc VARCHAR(20) DEFAULT NULL COMMENT 'Public reference accession',
    reference_462b VARCHAR(20) DEFAULT NULL COMMENT '462(b) reference',
    confirming_copy CHAR(1) DEFAULT NULL COMMENT 'Confirming copy flag',
    private_to_public CHAR(1) DEFAULT NULL COMMENT 'Private to public flag',
    -- ABS-related fields
    abs_asset_class VARCHAR(50) DEFAULT NULL COMMENT 'ABS asset class',
    abs_sub_asset_class VARCHAR(50) DEFAULT NULL COMMENT 'ABS sub asset class',
    abs_rule VARCHAR(255) DEFAULT NULL COMMENT 'ABS rule',
    -- Filer status fields
    is_filer_a_new_registrant CHAR(1) DEFAULT NULL COMMENT 'New registrant flag',
    is_filer_a_well_known_seasoned_issuer CHAR(1) DEFAULT NULL COMMENT 'Well-known seasoned issuer flag',
    is_fund_24f2_eligible CHAR(1) DEFAULT NULL COMMENT 'Fund 24F-2 eligible flag',
    filed_pursuant_to_general_instruction_a2 CHAR(1) DEFAULT NULL COMMENT 'Filed pursuant to General Instruction A.2',
    registered_entity CHAR(1) DEFAULT NULL COMMENT 'Registered entity flag',
    -- Activity flags
    no_annual_activity CHAR(1) DEFAULT NULL COMMENT 'No annual activity flag',
    no_initial_period_activity CHAR(1) DEFAULT NULL COMMENT 'No initial period activity flag',
    no_quarterly_activity CHAR(1) DEFAULT NULL COMMENT 'No quarterly activity flag',
    -- Other fields
    category VARCHAR(50) DEFAULT NULL COMMENT 'Category',
    calendar_year_ending VARCHAR(4) DEFAULT NULL COMMENT 'Calendar year ending MMDD',
    depositor_cik BIGINT UNSIGNED DEFAULT NULL COMMENT 'Depositor CIK',
    sponsor_cik BIGINT UNSIGNED DEFAULT NULL COMMENT 'Sponsor CIK',
    resource_ext_issuer VARCHAR(10) DEFAULT NULL COMMENT 'Resource external issuer',
    timestamp VARCHAR(30) DEFAULT NULL COMMENT 'Timestamp YYYYMMDDHHmmss',
    -- System fields
    created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_type (type),
    INDEX idx_filing_date (filing_date),
    INDEX idx_period (period)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- submission_entity: Denormalized entity data (filer, issuer, reporting_owner, etc.)
-- ----------------------------------------------------------------------------
--moved above the DROP filer_type_ref statement due to FK constraint: DROP TABLE IF EXISTS submission_entity;
CREATE TABLE submission_entity (
    adsh VARCHAR(20) NOT NULL,
    filer_code CHAR(2) NOT NULL COMMENT 'Entity type: F, RO, I, SC, D, S, FF, IE, FB, U',
    entity_sequence SMALLINT UNSIGNED NOT NULL COMMENT 'Preserves array order from original filing',
    cik BIGINT UNSIGNED NOT NULL,
    conformed_name VARCHAR(255) NOT NULL,
    organization_name VARCHAR(255) DEFAULT NULL,
    irs_number VARCHAR(20) DEFAULT NULL,
    state_of_incorporation VARCHAR(2) DEFAULT NULL,
    fiscal_year_end VARCHAR(4) DEFAULT NULL COMMENT 'MMDD format',
    assigned_sic VARCHAR(4) DEFAULT NULL,
    -- Filing values
    filing_form_type VARCHAR(20) DEFAULT NULL,
    filing_act VARCHAR(10) DEFAULT NULL,
    filing_file_number VARCHAR(20) DEFAULT NULL,
    filing_film_number VARCHAR(20) DEFAULT NULL,
    -- Business address
    business_street1 VARCHAR(255) DEFAULT NULL,
    business_street2 VARCHAR(255) DEFAULT NULL,
    business_city VARCHAR(100) DEFAULT NULL,
    business_state VARCHAR(2) DEFAULT NULL,
    business_zip VARCHAR(20) DEFAULT NULL,
    business_phone VARCHAR(20) DEFAULT NULL,
    -- Mail address
    mail_street1 VARCHAR(255) DEFAULT NULL,
    mail_street2 VARCHAR(255) DEFAULT NULL,
    mail_city VARCHAR(100) DEFAULT NULL,
    mail_state VARCHAR(2) DEFAULT NULL,
    mail_zip VARCHAR(20) DEFAULT NULL,
    created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (adsh, filer_code, entity_sequence),
    INDEX idx_cik (cik),
    FOREIGN KEY (adsh) REFERENCES submission(adsh) ON DELETE CASCADE,
    FOREIGN KEY (filer_code) REFERENCES filer_type_ref(filer_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ----------------------------------------------------------------------------
-- submission_former_name: Company Former names (name field is case sensitive collation as new name can  be just a change in capitilization 
-- ----------------------------------------------------------------------------
CREATE TABLE submission_former_name (
    adsh VARCHAR(20) NOT NULL,
    cik BIGINT UNSIGNED NOT NULL,
    former_name_sequence SMALLINT UNSIGNED NOT NULL COMMENT 'Preserves array order from original filing',
    former_conformed_name VARCHAR(500) NOT NULL, 
    date_changed VARCHAR(8) NOT NULL COMMENT 'YYYYMMDD format; multiple changes on same date are possible',
    created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (adsh, cik, former_name_sequence),
    FOREIGN KEY (adsh) REFERENCES submission(adsh) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- submission_document: Documents associated with submission
-- ----------------------------------------------------------------------------
CREATE TABLE submission_document (
    adsh VARCHAR(20) NOT NULL,
    sequence SMALLINT UNSIGNED NOT NULL,
    type VARCHAR(50) DEFAULT NULL,
    filename VARCHAR(255) NOT NULL,
    description TEXT DEFAULT NULL,
    created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (adsh, sequence),
    INDEX idx_type (type),
    FOREIGN KEY (adsh) REFERENCES submission(adsh) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- submission_series: Series data
-- ----------------------------------------------------------------------------
CREATE TABLE submission_series (
    adsh VARCHAR(20) NOT NULL,
    series_id INT UNSIGNED NOT NULL COMMENT 'Series ID as bigint',
    owner_cik BIGINT UNSIGNED NOT NULL,
    series_name VARCHAR(255) NOT NULL,
    series_source ENUM('new_series', 'new_classes_contracts', 'existing_series') NOT NULL DEFAULT 'new_series' COMMENT 'Source property name from original filing',
    series_sequence SMALLINT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Sequence within series_source group - allows same series_id in multiple groups',
    created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (adsh, series_source, series_id, series_sequence),
    INDEX idx_owner_cik (owner_cik),
    INDEX idx_series_id (series_id),
    FOREIGN KEY (adsh) REFERENCES submission(adsh) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- submission_class_contract: Class/contract data (nested under series)
-- ----------------------------------------------------------------------------
CREATE TABLE submission_class_contract (
    adsh VARCHAR(20) NOT NULL,
    series_source ENUM('new_series', 'new_classes_contracts', 'existing_series') NOT NULL COMMENT 'Must match parent series_source',
    series_id INT UNSIGNED NOT NULL,
    series_sequence SMALLINT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Must match parent series_sequence',
    class_contract_id INT UNSIGNED NOT NULL COMMENT 'Class contract ID as bigint',
    class_contract_name VARCHAR(255) NOT NULL,
    class_contract_ticker_symbol VARCHAR(20) DEFAULT NULL,
    class_sequence SMALLINT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Order within the class_contract array',
    created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (adsh, series_source, series_id, series_sequence, class_contract_id),
    INDEX idx_class_contract_id (class_contract_id),
    FOREIGN KEY (adsh, series_source, series_id, series_sequence) 
        REFERENCES submission_series(adsh, series_source, series_id, series_sequence) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- submission_item: Items (for 8-K and other forms)
-- ----------------------------------------------------------------------------
CREATE TABLE submission_item (
    adsh VARCHAR(20) NOT NULL,
    item_code VARCHAR(10) NOT NULL,
    created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (adsh, item_code),
    INDEX idx_item_code (item_code),
    FOREIGN KEY (adsh) REFERENCES submission(adsh) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- submission_references_429: 429 references
-- ----------------------------------------------------------------------------
CREATE TABLE submission_references_429 (
    adsh VARCHAR(20) NOT NULL,
    reference_429 VARCHAR(255) NOT NULL,
    reference_sequence SMALLINT UNSIGNED NOT NULL COMMENT 'Preserves array order from original filing',
    created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (adsh, reference_sequence),
    FOREIGN KEY (adsh) REFERENCES submission(adsh) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- submission_group_members: Group members
-- ----------------------------------------------------------------------------
CREATE TABLE submission_group_members (
    adsh VARCHAR(20) NOT NULL,
    group_member VARCHAR(255) NOT NULL,
    group_member_sequence SMALLINT UNSIGNED NOT NULL COMMENT 'Preserves array order from original filing',
    created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (adsh, group_member_sequence),
    FOREIGN KEY (adsh) REFERENCES submission(adsh) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- submission_merger_series: Series in mergers (both acquiring and target)
-- Note: No separate submission_merger table needed - merger_sequence tracked here directly
-- ----------------------------------------------------------------------------
CREATE TABLE submission_merger_series (
    adsh VARCHAR(20) NOT NULL,
    merger_sequence SMALLINT UNSIGNED NOT NULL COMMENT 'Index in merger array (0-based)',
    series_type CHAR(1) NOT NULL COMMENT 'A=Acquiring, T=Target',
    entity_cik BIGINT UNSIGNED NOT NULL COMMENT 'CIK of the entity owning this series',
    entity_sequence SMALLINT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Order in target_data array (0 for acquiring)',
    series_id INT UNSIGNED NULL COMMENT 'Series ID as integer (NULL for CIK-only targets)',
    series_name VARCHAR(255) NOT NULL DEFAULT '' COMMENT 'Empty string for CIK-only targets',
    series_sequence SMALLINT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Order in series array',
    created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (adsh, merger_sequence, series_type, entity_cik, entity_sequence, series_sequence),
    INDEX idx_merger_series_type (series_type),
    INDEX idx_merger_entity_cik (entity_cik),
    INDEX idx_merger_series_id (series_id),
    FOREIGN KEY (adsh) REFERENCES submission(adsh) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- submission_merger_class_contract: Class contracts in merger series
-- ----------------------------------------------------------------------------
CREATE TABLE submission_merger_class_contract (
    adsh VARCHAR(20) NOT NULL,
    merger_sequence SMALLINT UNSIGNED NOT NULL,
    series_type CHAR(1) NOT NULL COMMENT 'A=Acquiring, T=Target',
    entity_cik BIGINT UNSIGNED NOT NULL,
    entity_sequence SMALLINT UNSIGNED NOT NULL COMMENT 'References parent entity_sequence',
    series_id INT UNSIGNED NOT NULL COMMENT 'Series ID (class contracts always belong to a series)',
    series_sequence SMALLINT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'References parent series_sequence',
    class_contract_id INT UNSIGNED NOT NULL COMMENT 'Class contract ID as integer',
    class_contract_name VARCHAR(255) NOT NULL,
    class_contract_ticker_symbol VARCHAR(20) DEFAULT NULL,
    class_sequence SMALLINT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Order in class_contract array',
    created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (adsh, merger_sequence, series_type, entity_cik, entity_sequence, series_sequence, series_id, class_contract_id),
    INDEX idx_merger_class_id (class_contract_id),
    FOREIGN KEY (adsh, merger_sequence, series_type, entity_cik, entity_sequence, series_sequence) 
        REFERENCES submission_merger_series(adsh, merger_sequence, series_type, entity_cik, entity_sequence, series_sequence) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- submission_rule: Rule data (for SD and other forms)
-- ----------------------------------------------------------------------------

CREATE TABLE submission_rule (
    adsh VARCHAR(20) NOT NULL PRIMARY KEY,
    rule_name VARCHAR(50) NOT NULL COMMENT 'Rule name (e.g., 13p-1)',
    created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (adsh) REFERENCES submission(adsh) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- submission_rule_item: Rule items (nested under rule)
-- ----------------------------------------------------------------------------
CREATE TABLE submission_rule_item (
    adsh VARCHAR(20) NOT NULL,
    item_number VARCHAR(20) NOT NULL COMMENT 'Item number (e.g., 1.01, 1.02)',
    item_period VARCHAR(8) NOT NULL COMMENT 'Item period YYYYMMDD',
    item_sequence SMALLINT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Preserves array order from original filing',
    created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (adsh, item_number, item_period, item_sequence),
    FOREIGN KEY (adsh) REFERENCES submission_rule(adsh) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- tables for EDGAR Online filing system
-- Date: 2025-01-29

--drop dependent tables first due to FK constraints:

DROP TABLE IF EXISTS edgar_submissions;
DROP TABLE IF EXISTS validation_logs;
DROP TABLE IF EXISTS user_sessions;
DROP TABLE IF EXISTS audit_log;
DROP TABLE IF EXISTS exhibit_files;
DROP TABLE IF EXISTS filing_drafts;
-- User management table
DROP TABLE IF EXISTS users;
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    cik BIGINT UNSIGNED NOT NULL,
    ccc_encrypted VARBINARY(255) COMMENT 'Encrypted CCC - NEVER store plain text',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_email (email),
    INDEX idx_cik (cik)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='User accounts for filing system';

INSERT INTO users (email, password_hash, name, cik, is_active) VALUES
('demo@example.com', '$2a$10$gf/yhFIeyz200Upz41bVDersiLpA5u4CkQLjywtoL/LQmiBUbrACW', 'Demo User', 0001234567, true);

-- Filing drafts (work in progress)
CREATE TABLE IF NOT EXISTS filing_drafts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    form_type ENUM('3','3/A','4','4/A','5','5/A') NOT NULL,
    draft_name VARCHAR(255),
    xml_content LONGTEXT COMMENT 'Generated XML',
    json_data JSON COMMENT 'Form state for UI',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_form_type (form_type),
    INDEX idx_updated_at (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Draft filings in progress';

-- Reporter cache (from SEC lookups)
DROP TABLE IF EXISTS reporters_cache;
CREATE TABLE IF NOT EXISTS reporters_cache (
    cik BIGINT UNSIGNED NOT NULL PRIMARY KEY,
    name VARCHAR(150),
    address_street1 VARCHAR(100),
    address_street2 VARCHAR(100),
    address_city VARCHAR(50),
    address_state CHAR(2),
    address_zip VARCHAR(10),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Cached reporter information from SEC';

-- Validation logs
CREATE TABLE IF NOT EXISTS validation_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    filing_draft_id INT,
    validation_type ENUM('schema','business','edgar','full') NOT NULL,
    is_valid BOOLEAN NOT NULL,
    errors JSON COMMENT 'Array of error messages',
    warnings JSON COMMENT 'Array of warning messages',
    validated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (filing_draft_id) REFERENCES filing_drafts(id) ON DELETE CASCADE,
    INDEX idx_filing_draft_id (filing_draft_id),
    INDEX idx_validation_type (validation_type),
    INDEX idx_validated_at (validated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Validation history for filings';

-- EDGAR submission tracking
CREATE TABLE IF NOT EXISTS edgar_submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    filing_draft_id INT,
    user_id INT NOT NULL,
    accession_number CHAR(20),
    form_type varchar(30) NOT NULL,
    status ENUM('pending','submitted','accepted','suspended','blocked') DEFAULT 'pending',
    is_live BOOLEAN DEFAULT FALSE COMMENT 'TRUE if submitted to live EDGAR, FALSE for test',
    edgar_response TEXT COMMENT 'Response from EDGAR system',
    submitted_at TIMESTAMP NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (filing_draft_id) REFERENCES filing_drafts(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_accession_number (accession_number),
    INDEX idx_status (status),
    INDEX idx_submitted_at (submitted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='EDGAR submission tracking';

-- Exhibit files
CREATE TABLE IF NOT EXISTS exhibit_files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    filing_draft_id INT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    s3_key VARCHAR(500) NOT NULL COMMENT 'S3 object key',
    file_size INT NOT NULL COMMENT 'Size in bytes',
    content_type VARCHAR(100),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (filing_draft_id) REFERENCES filing_drafts(id) ON DELETE CASCADE,
    INDEX idx_filing_draft_id (filing_draft_id),
    INDEX idx_s3_key (s3_key(255))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Exhibit file metadata';

-- Session management (tracks user login sessions with JWT tokens)
CREATE TABLE IF NOT EXISTS user_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token_hash VARCHAR(255) NOT NULL COMMENT 'SHA2-256 hash of JWT token for security',
    ip_address VARCHAR(45) COMMENT 'IP address of the client',
    user_agent VARCHAR(255) COMMENT 'Browser user agent string',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL COMMENT 'JWT token expiration time',
    is_active BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Whether session is currently active',
    logged_out_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Time when user explicitly logged out',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_token_hash (token_hash),
    INDEX idx_expires_at (expires_at),
    INDEX idx_user_active (user_id, is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='User login sessions with JWT token tracking';

-- Audit log for important actions
CREATE TABLE IF NOT EXISTS audit_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id INT,
    details JSON,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Audit trail for security and compliance';



-- ============================================================================
-- TRIGGERS FOR MODIFIED TIMESTAMPS
-- ============================================================================
-- Note: The ON UPDATE CURRENT_TIMESTAMP in the modified column definition
-- handles automatic updates, but triggers can be added for additional logic
-- if needed in the future.

-- ============================================================================
-- END OF DDL
-- ============================================================================

