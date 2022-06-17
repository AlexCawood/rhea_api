CREATE TABLE `TEMPLATE` (
  `tem_id` int(11) NOT NULL AUTO_INCREMENT,
  `tem_name` varchar(60) NOT NULL,
  `tem_image_count` int(11) NOT NULL,
  `tem_descp` text,
  `tem_active` tinyint(1) NOT NULL,
  `tem_created_on` datetime NOT NULL,
  PRIMARY KEY (`tem_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1