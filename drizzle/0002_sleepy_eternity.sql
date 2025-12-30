CREATE TABLE `automacao_config` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`ativa` boolean NOT NULL DEFAULT false,
	`areas_interesse` text NOT NULL,
	`palavras_chave` text,
	`localizacao` varchar(255) DEFAULT 'Brasil - Remoto',
	`tipo_trabalho` varchar(50) DEFAULT 'remoto',
	`envio_automatico` boolean NOT NULL DEFAULT false,
	`ultima_execucao` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `automacao_config_id` PRIMARY KEY(`id`),
	CONSTRAINT `automacao_config_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `automacao_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`data_execucao` timestamp NOT NULL DEFAULT (now()),
	`status` enum('success','error','partial') NOT NULL,
	`vagas_encontradas` int DEFAULT 0,
	`vagas_novas` int DEFAULT 0,
	`candidaturas_enviadas` int DEFAULT 0,
	`mensagem_erro` text,
	`detalhes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `automacao_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vagas_automaticas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vaga_url` text NOT NULL,
	`titulo` varchar(500) NOT NULL,
	`empresa` varchar(255) NOT NULL,
	`localizacao` varchar(255),
	`tipo_contrato` varchar(100),
	`descricao` text,
	`requisitos` text,
	`beneficios` text,
	`fonte` varchar(50) NOT NULL,
	`score_compatibilidade` int,
	`motivo_compatibilidade` text,
	`area` varchar(100),
	`processada` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vagas_automaticas_id` PRIMARY KEY(`id`),
	CONSTRAINT `vagas_automaticas_vaga_url_unique` UNIQUE(`vaga_url`)
);
