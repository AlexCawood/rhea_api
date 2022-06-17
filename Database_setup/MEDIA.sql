CREATE TABLE `MEDIA` (
  `med_id` int(11) NOT NULL AUTO_INCREMENT,
  `med_name` varchar(255) NOT NULL,
  `med_location` varchar(255) NOT NULL,
  `med_title` varchar(30) NOT NULL,
  `med_descp` text,
  `med_type` varchar(30) NOT NULL,
  `med_position` int(11) NOT NULL,
  `med_proj_id` int(11) NOT NULL,
  `med_created_on` date NOT NULL,
  `med_active` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`med_id`),
  UNIQUE KEY `med_id` (`med_id`),
  KEY `med_proj_id` (`med_proj_id`),
  CONSTRAINT `MEDIA_ibfk_1` FOREIGN KEY (`med_proj_id`) REFERENCES `PROJECT` (`proj_id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=190 DEFAULT CHARSET=latin1