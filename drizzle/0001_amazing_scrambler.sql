CREATE TABLE `candidaturas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`curriculoId` int NOT NULL,
	`vagaData` text NOT NULL,
	`cartaApresentacao` text,
	`status` enum('pending','sent','viewed','rejected','accepted') NOT NULL DEFAULT 'pending',
	`dataEnvio` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `candidaturas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `curriculos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`originalPdfUrl` text NOT NULL,
	`originalPdfKey` text NOT NULL,
	`originalText` text,
	`analiseIA` text,
	`curriculoRefatorado` text,
	`refatoradoPdfUrl` text,
	`refatoradoPdfKey` text,
	`status` enum('uploaded','analyzing','analyzed','error') NOT NULL DEFAULT 'uploaded',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `curriculos_id` PRIMARY KEY(`id`)
);
