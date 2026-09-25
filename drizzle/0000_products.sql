CREATE TABLE `products` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `name` text NOT NULL,
  `description` text DEFAULT '' NOT NULL,
  `price` integer NOT NULL,
  `stock` integer DEFAULT 0 NOT NULL,
  `category` text DEFAULT 'Ramos' NOT NULL,
  `season` text DEFAULT 'Todo el año' NOT NULL,
  `featured` integer DEFAULT 0 NOT NULL,
  `active` integer DEFAULT 1 NOT NULL,
  `updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_products_active_featured` ON `products` (`active`,`featured`);
--> statement-breakpoint
INSERT INTO `products` (`name`,`description`,`price`,`stock`,`category`,`season`,`featured`,`active`,`updated_at`) VALUES
('Sol de septiembre','Girasoles, rosas amarillas y follaje de estación.',129,8,'Ramos','Flores amarillas',1,1,unixepoch()),
('Jardín crema','Rosas marfil, lisianthus y eucalipto fresco.',149,5,'Ramos','Todo el año',1,1,unixepoch()),
('Abrazo silvestre','Flores de campo con una composición libre y delicada.',99,0,'Silvestres','Primavera',0,1,unixepoch()),
('Caja de luz','Selección amarilla presentada en caja de autor.',169,3,'Cajas','Flores amarillas',1,1,unixepoch());
