CREATE TABLE `application` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` varchar(100) DEFAULT NULL,
  `type` char(1) NOT NULL,
  `deleted` char(1) NOT NULL DEFAULT 'N',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8;

CREATE TABLE `variable` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `value` varchar(100) NOT NULL,
  `description` varchar(100) DEFAULT NULL,
  `type` char(1) NOT NULL,
  `scope` char(1) NOT NULL,
  `deleted` char(1) NOT NULL DEFAULT 'N',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8;

CREATE TABLE `application_variable` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `application_id` int(11) NOT NULL,
  `variable_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_application` (`application_id`),
  KEY `fk_variable` (`variable_id`),
  CONSTRAINT `fk_application` FOREIGN KEY (`application_id`) REFERENCES `application` (`id`),
  CONSTRAINT `fk_variable` FOREIGN KEY (`variable_id`) REFERENCES `variable` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;

CREATE TABLE `authentication` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL,
  `role` varchar(10) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `authentication_UN` (`user`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8;
