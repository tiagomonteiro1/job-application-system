CREATE TABLE `assinaturas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`planoId` int NOT NULL,
	`status` enum('ativa','cancelada','expirada','trial') NOT NULL DEFAULT 'ativa',
	`data_inicio` timestamp NOT NULL DEFAULT (now()),
	`data_fim` timestamp,
	`renovacao_automatica` boolean NOT NULL DEFAULT true,
	`metodo_pagamento` varchar(50),
	`transacao_id` varchar(255),
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `assinaturas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `planos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(100) NOT NULL,
	`descricao` text,
	`preco_mensal` int NOT NULL,
	`preco_anual` int,
	`modulos_permitidos` text NOT NULL,
	`limite_curriculos` int DEFAULT 10,
	`limite_candidaturas` int DEFAULT 50,
	`ativo` boolean NOT NULL DEFAULT true,
	`ordem` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `planos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `uso_recursos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`mes_referencia` varchar(7) NOT NULL,
	`curriculos_enviados` int DEFAULT 0,
	`candidaturas_realizadas` int DEFAULT 0,
	`analises_realizadas` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `uso_recursos_id` PRIMARY KEY(`id`)
);
