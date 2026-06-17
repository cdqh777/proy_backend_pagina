DROP DATABASE IF EXISTS libreria_inventario;
CREATE DATABASE IF NOT EXISTS libreria_inventario CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE libreria_inventario;

CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `creado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `roles` VALUES (1,'administrador','Acceso completo al sistema','2026-06-15 22:47:51'),(2,'vendedor','Acceso a ventas y consulta de inventario','2026-06-15 22:47:51');

CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `correo` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contrasena` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rol_id` int NOT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `creado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `correo` (`correo`),
  KEY `rol_id` (`rol_id`),
  CONSTRAINT `usuarios_roles_fk` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `usuarios` VALUES (1,'Admin Principal','admin.libreria@gmail.com','$2b$10$Gt58NMYGfnUWr0sCEYM/i.juwvYRWMtyE119yxrUwdMD0b/itmVSS',1,1,'2026-06-15 22:47:51','2026-06-15 22:47:51'),(2,'Vendedor Uno','vendedor1.libreria@gmail.com','$2b$10$Qsp1c3auvOvxwXQVLw4ZQ.RXyEIosXiTx3N/tlXtci4JItRQEgI2m',2,1,'2026-06-15 22:47:51','2026-06-15 22:47:51'),(3,'Vendedor Dos','vendedor2.libreria@gmail.com','$2b$10$rQfCc7RJqA7CpeOcYWpjeOAenA22VNzB3zRJkerb30ViRBDfjL2ji',2,1,'2026-06-15 22:47:51','2026-06-15 22:47:51'),(4,'Vendedor Tres','vendedor3.libreria@gmail.com','$2b$10$X76qRbcQRlDtzI.Qk4cyCutIVswiOzteyOISFmgHyRUT5zAO4ULwi',2,1,'2026-06-15 22:47:51','2026-06-15 22:47:51');

CREATE TABLE `tipos_articulo` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `creado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `tipos_articulo` VALUES (1,'Escritura','Articulos para escribir','2026-06-15 22:47:51'),(2,'Geometria y Corte','Reglas, escuadras, tijeras, estiletes','2026-06-15 22:47:51'),(3,'Papeleria Escolar','Cuadernos, resmas, hojas, mapas','2026-06-15 22:47:51'),(4,'Organizacion','Articulos para organizar','2026-06-15 22:47:51'),(5,'Arte y Manualidades','Goma Eva, pinturas, plastilina','2026-06-15 22:47:51'),(6,'Libros y Textos','Diccionarios, textos escolares','2026-06-15 22:47:51'),(7,'Pegamentos y Adhesivos','Carpicola, UHU, cintas','2026-06-15 22:47:51'),(8,'Correccion y Borrado','Borradores, tajadores, correctores','2026-06-15 22:47:51');

CREATE TABLE `articulos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo_articulo_id` int NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `precio` decimal(10,2) NOT NULL DEFAULT '0.00',
  `stock` int NOT NULL DEFAULT '0',
  `stock_minimo` int NOT NULL DEFAULT '5',
  `cantidad_compras` int NOT NULL DEFAULT '0',
  `estado` enum('nuevo','disponible','agotado') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'nuevo',
  `activo` tinyint(1) DEFAULT '1',
  `creado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `tipo_articulo_id` (`tipo_articulo_id`),
  CONSTRAINT `articulos_tipos_fk` FOREIGN KEY (`tipo_articulo_id`) REFERENCES `tipos_articulo` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=56 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `articulos` VALUES (1,'Boligrafo azul Bic Cristal',1,'Boligrafo Bic Cristal azul punta media',2.00,150,20,0,'nuevo',1,'2026-06-15 22:47:51','2026-06-15 22:47:51'),(2,'Boligrafo negro Bic Cristal',1,'Boligrafo Bic Cristal negro punta media',2.00,120,20,0,'nuevo',1,'2026-06-15 22:47:51','2026-06-15 22:47:51'),(3,'Boligrafo Pilot BP-S azul',1,'Boligrafo Pilot BP-S azul retractil',4.00,80,15,0,'nuevo',1,'2026-06-15 22:47:51','2026-06-15 22:47:51'),(4,'Lapiz Faber-Castell HB',1,'Lapiz Faber-Castell EcoLapiz HB',2.50,200,30,0,'nuevo',1,'2026-06-15 22:47:51','2026-06-15 22:47:51'),(5,'Lapiz Staedtler Noris HB',1,'Lapiz Staedtler Noris HB grafito',3.00,100,20,0,'nuevo',1,'2026-06-15 22:47:51','2026-06-15 22:47:51'),(6,'Lapices de color x12 Faber-Castell Fiesta',1,'Set de 12 lapices de colores Faber-Castell Fiesta',15.00,60,10,0,'nuevo',1,'2026-06-15 22:47:51','2026-06-15 22:47:51'),(7,'Marcador permanente Sharpie negro',1,'Marcador permanente Sharpie Fine Point negro',8.00,50,10,0,'nuevo',1,'2026-06-15 22:47:51','2026-06-15 22:47:51'),(8,'Marcador de pizarra Pilot azul',1,'Marcador borrable para pizarra Pilot azul',6.00,40,8,0,'nuevo',1,'2026-06-15 22:47:51','2026-06-15 22:47:51'),(9,'Resaltador Stabilo Boss amarillo',1,'Resaltador Stabilo Boss Original amarillo',7.00,70,15,0,'nuevo',1,'2026-06-15 22:47:51','2026-06-15 22:47:51'),(10,'Resaltador Faber-Castell Textliner verde',1,'Resaltador Faber-Castell Textliner verde',5.00,50,10,0,'nuevo',1,'2026-06-15 22:47:51','2026-06-15 22:47:51'),(11,'Calculadora cientifica Casio fx-82',1,'Calculadora cientifica Casio fx-82MS',80.00,15,3,0,'nuevo',1,'2026-06-15 22:47:51','2026-06-15 22:47:51'),(12,'USB 16GB Kingston',1,'Memoria USB 16GB Kingston DataTraveler',35.00,20,5,0,'nuevo',1,'2026-06-15 22:47:51','2026-06-15 22:47:51'),(13,'Tijera Maped Sensoft',2,'Tijera Maped Sensoft ergonimica',12.00,40,8,0,'nuevo',1,'2026-06-15 22:47:51','2026-06-15 22:47:51'),(14,'Tijera Mundial escolar',2,'Tijera Mundial punta roma escolar',8.00,50,10,0,'nuevo',1,'2026-06-15 22:47:51','2026-06-15 22:47:51'),(15,'Regla plastica 30cm',2,'Regla plastica transparente 30cm',3.00,80,15,0,'nuevo',1,'2026-06-15 22:47:51','2026-06-15 22:47:51'),(16,'Escuadra 20cm',2,'Escuadra plastica 20cm',4.00,60,10,0,'nuevo',1,'2026-06-15 22:47:51','2026-06-15 22:47:51'),(17,'Sacapuntas doble Maped',2,'Sacapuntas doble Maped con deposito',3.00,100,20,0,'nuevo',1,'2026-06-15 22:47:51','2026-06-15 22:47:51'),(18,'Estilete 9mm',2,'Estilete cutter 9mm',5.00,45,10,0,'nuevo',1,'2026-06-15 22:47:51','2026-06-15 22:47:51'),(19,'Compas de precision',2,'Compas metalico de precision',15.00,25,5,0,'nuevo',1,'2026-06-15 22:47:51','2026-06-15 22:47:51'),(20,'Transportador 180 grados',2,'Transportador semicircular 180 grados',3.50,55,10,0,'nuevo',1,'2026-06-15 22:47:51','2026-06-15 22:47:51'),(21,'Cuaderno universitario 100 hojas',3,'Cuaderno universitario rayado 100 hojas',10.00,90,15,0,'nuevo',1,'2026-06-15 22:47:51','2026-06-15 22:47:51'),(22,'Cuaderno espiral A4 200 hojas',3,'Cuaderno espiral A4 rayado 200 hojas',12.00,60,10,0,'nuevo',1,'2026-06-15 22:47:51','2026-06-15 22:47:51'),(23,'Resma de papel carta x500',3,'Resma papel bond carta blanco x500 hojas',25.00,30,8,0,'nuevo',1,'2026-06-15 22:47:51','2026-06-15 22:47:51'),(24,'Block de hojas blancas A4',3,'Block hojas blancas A4 x100',8.00,50,10,0,'nuevo',1,'2026-06-15 22:47:51','2026-06-15 22:47:51'),(25,'Mochila escolar',3,'Mochila escolar resistente al agua',30.00,20,5,0,'nuevo',1,'2026-06-15 22:47:51','2026-06-15 22:47:51'),(26,'Cartuchera doble cierre',3,'Cartuchera doble cierre con diseno',8.00,40,8,0,'nuevo',1,'2026-06-15 22:47:51','2026-06-15 22:47:51'),(27,'Mapa politico de Colombia',3,'Mapa politico de Colombia plastificado',12.00,15,3,0,'nuevo',1,'2026-06-15 22:47:51','2026-06-15 22:47:51'),(28,'Carpeta argollada oficio',4,'Carpeta argollada tamano oficio',10.00,55,10,0,'nuevo',1,'2026-06-15 22:47:51','2026-06-15 22:47:51'),(29,'Carpeta de presentacion',4,'Carpeta de presentacion con resorte',5.00,70,15,0,'nuevo',1,'2026-06-15 22:47:51','2026-06-15 22:47:51'),(30,'Archivador palanca',4,'Archivador palanca tamano oficio',12.00,30,5,0,'nuevo',1,'2026-06-15 22:47:51','2026-06-15 22:47:51'),(31,'Separadores de carpetas x12',4,'Set separadores de carpetas x12 colores',6.00,45,10,0,'nuevo',1,'2026-06-15 22:47:51','2026-06-15 22:47:51'),(32,'Bolsa plastica zip',4,'Bolsa plastica con cierre zip',1.00,120,25,0,'nuevo',1,'2026-06-15 22:47:51','2026-06-15 22:47:51'),(33,'Agenda ejecutiva',4,'Agenda ejecutiva anual',20.00,18,5,0,'nuevo',1,'2026-06-15 22:47:51','2026-06-15 22:47:51'),(34,'Tablero corcho 40x60',4,'Tablero de corcho 40x60cm',18.00,12,3,0,'nuevo',1,'2026-06-15 22:47:51','2026-06-15 22:47:51'),(35,'Goma Eva colores x10',5,'Set Goma Eva 10 colores surtidos',12.00,35,8,0,'nuevo',1,'2026-06-15 22:47:51','2026-06-15 22:47:51'),(36,'Pinturas al oleo x12',5,'Set pinturas al oleo 12 colores',25.00,15,3,0,'nuevo',1,'2026-06-15 22:47:51','2026-06-15 22:47:51'),(37,'Plastilina x6 colores',5,'Plastilina no toxica x6 colores',8.00,50,10,0,'nuevo',1,'2026-06-15 22:47:51','2026-06-15 22:47:51'),(38,'Pinceles set x5',5,'Set de 5 pinceles variados',10.00,30,5,0,'nuevo',1,'2026-06-15 22:47:51','2026-06-15 22:47:51'),(39,'Acuarelas x24 colores',5,'Set acuarelas 24 colores con pincel',18.00,20,5,0,'nuevo',1,'2026-06-15 22:47:51','2026-06-15 22:47:51'),(40,'Marcadores punta fina x10',5,'Set marcadores punta fina 10 colores',18.00,25,5,0,'nuevo',1,'2026-06-15 22:47:51','2026-06-15 22:47:51'),(41,'Papel crepe colores x5',5,'Set papel crepe 5 colores',6.00,40,8,0,'nuevo',1,'2026-06-15 22:47:51','2026-06-15 22:47:51'),(42,'Silicona liquida 250ml',5,'Silicona liquida escolar 250ml',8.00,35,8,0,'nuevo',1,'2026-06-15 22:47:51','2026-06-15 22:47:51'),(43,'Diccionario Larousse',6,'Diccionario Larousse espanol',30.00,10,3,0,'nuevo',1,'2026-06-15 22:47:51','2026-06-15 22:47:51'),(44,'Diccionario bilingue ingles-espanol',6,'Diccionario bilingue ingles-espanol',35.00,8,2,0,'nuevo',1,'2026-06-15 22:47:51','2026-06-15 22:47:51'),(45,'Atlas geografico',6,'Atlas geografico universal',40.00,6,2,0,'nuevo',1,'2026-06-15 22:47:51','2026-06-15 22:47:51'),(46,'Libro de lectura infantil',6,'Libro de lectura para ninos',15.00,20,5,0,'nuevo',1,'2026-06-15 22:47:51','2026-06-15 22:47:51'),(47,'Texto escolar matematicas',6,'Texto escolar de matematicas',45.00,10,3,0,'nuevo',1,'2026-06-15 22:47:51','2026-06-15 22:47:51'),(48,'Enciclopedia visual',6,'Enciclopedia visual para estudiantes',50.00,5,2,0,'nuevo',1,'2026-06-15 22:47:51','2026-06-15 22:47:51'),(49,'Carpicola blanca 250ml',7,'Pegamento Carpicola blanca 250ml',4.00,60,12,0,'nuevo',1,'2026-06-15 22:47:51','2026-06-15 22:47:51'),(50,'Pegamento UHU stick',7,'Pegamento UHU en barra',3.00,80,15,0,'nuevo',1,'2026-06-15 22:47:51','2026-06-15 22:47:51'),(51,'Cinta pegante transparente',7,'Cinta pegante transparente 12mm x 30m',2.00,100,20,0,'nuevo',1,'2026-06-15 22:47:51','2026-06-15 22:47:51'),(52,'Silicona caliente barras x5',7,'Barras de silicona caliente x5',6.00,40,8,0,'nuevo',1,'2026-06-15 22:47:51','2026-06-15 22:47:51'),(53,'Cinta doble faz',7,'Cinta doble faz 12mm x 10m',6.00,35,8,0,'nuevo',1,'2026-06-15 22:47:51','2026-06-15 22:47:51'),(54,'Corrector liquido',8,'Corrector liquido de cinta',6.00,45,10,0,'nuevo',1,'2026-06-15 22:47:51','2026-06-15 22:47:51'),(55,'Borrador Staedtler',8,'Borrador Staedtler para lapiz',4.00,70,15,0,'nuevo',1,'2026-06-15 22:47:51','2026-06-15 22:47:51');

CREATE TABLE `ventas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `articulo_id` int NOT NULL,
  `usuario_id` int NOT NULL,
  `cantidad` int NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `estado` enum('activa','anulada','devuelta') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'activa',
  `motivo_reclamo` text COLLATE utf8mb4_unicode_ci,
  `fecha_venta` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `articulo_id` (`articulo_id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `ventas_articulos_fk` FOREIGN KEY (`articulo_id`) REFERENCES `articulos` (`id`),
  CONSTRAINT `ventas_usuarios_fk` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `ventas` VALUES (1,1,2,10,2.00,20.00,'activa',NULL,'2026-05-16 22:47:51'),(2,1,2,15,2.00,30.00,'activa',NULL,'2026-05-21 22:47:51'),(3,1,2,20,2.00,40.00,'activa',NULL,'2026-05-26 22:47:51'),(4,1,2,8,2.00,16.00,'activa',NULL,'2026-05-31 22:47:51'),(5,1,2,12,2.00,24.00,'activa',NULL,'2026-06-05 22:47:51'),(6,4,2,25,2.50,62.50,'activa',NULL,'2026-05-18 22:47:51'),(7,4,2,30,2.50,75.00,'activa',NULL,'2026-05-24 22:47:51'),(8,4,2,20,2.50,50.00,'activa',NULL,'2026-06-01 22:47:51'),(9,21,2,15,10.00,150.00,'activa',NULL,'2026-05-19 22:47:51'),(10,21,2,20,10.00,200.00,'activa',NULL,'2026-05-27 22:47:51'),(11,21,2,10,10.00,100.00,'activa',NULL,'2026-06-07 22:47:51'),(12,32,2,30,1.00,30.00,'activa',NULL,'2026-05-20 22:47:51'),(13,32,2,25,1.00,25.00,'activa',NULL,'2026-05-28 22:47:51'),(14,32,2,20,1.00,20.00,'activa',NULL,'2026-06-10 22:47:51'),(15,17,2,12,3.00,36.00,'activa',NULL,'2026-05-23 22:47:51'),(16,17,2,8,3.00,24.00,'activa',NULL,'2026-06-04 22:47:51'),(17,49,2,20,4.00,80.00,'activa',NULL,'2026-05-22 22:47:51'),(18,49,2,15,4.00,60.00,'activa',NULL,'2026-06-03 22:47:51'),(19,25,2,8,30.00,240.00,'activa',NULL,'2026-05-26 22:47:51'),(20,25,2,6,30.00,180.00,'activa',NULL,'2026-06-08 22:47:51'),(21,2,2,10,2.00,20.00,'activa',NULL,'2026-05-30 22:47:51'),(22,22,2,12,12.00,144.00,'activa',NULL,'2026-06-02 22:47:51'),(23,7,2,8,8.00,64.00,'activa',NULL,'2026-06-06 22:47:51'),(24,40,2,5,18.00,90.00,'activa',NULL,'2026-06-09 22:47:51'),(25,47,2,10,10.00,100.00,'activa',NULL,'2026-06-11 22:47:51'),(26,51,2,8,2.00,16.00,'activa',NULL,'2026-06-12 22:47:51'),(27,54,2,15,7.00,105.00,'activa',NULL,'2026-06-13 22:47:51'),(28,53,2,6,6.00,36.00,'activa',NULL,'2026-06-14 22:47:51');

CREATE TABLE `sugerencias` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `nombre_articulo` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo_articulo_id` int DEFAULT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `cantidad_solicitudes` int NOT NULL DEFAULT '1',
  `estado` enum('pendiente','aprobado','rechazado') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pendiente',
  `activo` tinyint(1) DEFAULT '1',
  `creado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  KEY `tipo_articulo_id` (`tipo_articulo_id`),
  CONSTRAINT `sugerencias_usuarios_fk` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `sugerencias_tipos_fk` FOREIGN KEY (`tipo_articulo_id`) REFERENCES `tipos_articulo` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `sugerencias` VALUES (1,2,'Post-it notas adhesivas',7,'Varios clientes piden notas adhesivas de colores',8,'pendiente',1,'2026-06-15 22:47:51','2026-06-15 22:47:51'),(2,2,'Marcadores de colores set x10',1,'Muy solicitado para trabajos escolares',12,'pendiente',1,'2026-06-15 22:47:51','2026-06-15 22:47:51'),(3,2,'Tabla de madera portapapeles',4,'Solicitado para campo',5,'pendiente',1,'2026-06-15 22:47:51','2026-06-15 22:47:51'),(4,2,'Calculadora grafica',1,'Pedido por estudiantes universitarios',6,'pendiente',1,'2026-06-15 22:47:51','2026-06-15 22:47:51'),(5,2,'Diccionario espanol',6,'Solicitado frecuentemente',9,'pendiente',1,'2026-06-15 22:47:51','2026-06-15 22:47:51');

CREATE TABLE `lista_compras` (
  `id` int NOT NULL AUTO_INCREMENT,
  `articulo_id` int DEFAULT NULL,
  `sugerencia_id` int DEFAULT NULL,
  `cantidad` int NOT NULL DEFAULT '1',
  `precio_estimado` decimal(10,2) DEFAULT NULL,
  `prioridad` enum('alta','media','baja') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'media',
  `estado` enum('pendiente','comprado','cancelado') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pendiente',
  `notas` text COLLATE utf8mb4_unicode_ci,
  `activo` tinyint(1) DEFAULT '1',
  `creado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `articulo_id` (`articulo_id`),
  KEY `sugerencia_id` (`sugerencia_id`),
  CONSTRAINT `lista_compras_articulos_fk` FOREIGN KEY (`articulo_id`) REFERENCES `articulos` (`id`),
  CONSTRAINT `lista_compras_sugerencias_fk` FOREIGN KEY (`sugerencia_id`) REFERENCES `sugerencias` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `lista_compras` VALUES (1,31,NULL,12,250.00,'baja','comprado','Ya van a comenzar las clases y suele ser muy solicitado\n',1,'2026-06-15 22:59:02','2026-06-15 22:59:04');

CREATE TABLE `registros_acceso` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `ip` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `evento` enum('login','logout') COLLATE utf8mb4_unicode_ci NOT NULL,
  `navegador` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `creado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `registros_acceso_usuarios_fk` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
