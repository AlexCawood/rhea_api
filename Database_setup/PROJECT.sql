CREATE TABLE `PROJECT` (
  `proj_id` int(11) NOT NULL AUTO_INCREMENT,
  `proj_name` varchar(60) NOT NULL,
  `proj_bio` text,
  `proj_created_on` date NOT NULL,
  `proj_prof_id` int(11) NOT NULL,
  `proj_active` tinyint(1) DEFAULT NULL,
  `template_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`proj_id`),
  UNIQUE KEY `proj_id` (`proj_id`),
  KEY `proj_prof_id` (`proj_prof_id`),
  CONSTRAINT `PROJECT_ibfk_1` FOREIGN KEY (`proj_prof_id`) REFERENCES `PROFILE` (`prof_id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=98 DEFAULT CHARSET=latin1