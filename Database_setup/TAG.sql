CREATE TABLE `TAG` (
  `tag_id` int(11) NOT NULL AUTO_INCREMENT,
  `tag_name` varchar(30) NOT NULL,
  `tag_proj_id` int(11) NOT NULL,
  `tag_active` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`tag_id`),
  UNIQUE KEY `tag_id` (`tag_id`),
  KEY `tag_proj_id` (`tag_proj_id`),
  CONSTRAINT `TAG_ibfk_1` FOREIGN KEY (`tag_proj_id`) REFERENCES `PROJECT` (`proj_id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=173 DEFAULT CHARSET=latin1