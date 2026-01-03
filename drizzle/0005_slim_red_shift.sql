CREATE TABLE `notificacoes_config` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`whatsapp_numero` varchar(20),
	`notificacoes_ativadas` boolean NOT NULL DEFAULT false,
	`notificar_novas_vagas` boolean NOT NULL DEFAULT true,
	`notificar_status_candidatura` boolean NOT NULL DEFAULT true,
	`notificar_follow_up` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notificacoes_config_id` PRIMARY KEY(`id`),
	CONSTRAINT `notificacoes_config_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `notificacoes_historico` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`tipo` enum('nova_vaga','status_candidatura','follow_up','sistema') NOT NULL,
	`destinatario` varchar(255) NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`mensagem` text NOT NULL,
	`status_envio` enum('pendente','enviado','erro','entregue') NOT NULL DEFAULT 'pendente',
	`mensagem_erro` text,
	`id_externo` varchar(255),
	`data_envio` timestamp,
	`dados_adicionais` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notificacoes_historico_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `whatsapp_grupos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`nome_grupo` varchar(255) NOT NULL,
	`link_grupo` text NOT NULL,
	`ativo` boolean NOT NULL DEFAULT true,
	`descricao` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `whatsapp_grupos_id` PRIMARY KEY(`id`)
);
