CREATE TABLE `USER` (
  `usr_id` int(11) NOT NULL AUTO_INCREMENT,
  `usr_email` varchar(60) NOT NULL,
  `usr_hash` varchar(255) NOT NULL,
  `usr_created_on` datetime NOT NULL,
  `usr_active` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`usr_id`,`usr_email`),
  UNIQUE KEY `usr_id` (`usr_id`),
  UNIQUE KEY `usr_email` (`usr_email`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=latin1