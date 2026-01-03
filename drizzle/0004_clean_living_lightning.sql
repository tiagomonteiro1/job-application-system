ALTER TABLE `candidaturas` ADD `status_entrega` enum('pendente','confirmado','nao_entregue') DEFAULT 'pendente' NOT NULL;--> statement-breakpoint
ALTER TABLE `candidaturas` ADD `link_validacao` text;--> statement-breakpoint
ALTER TABLE `candidaturas` ADD `observacoes_entrega` text;--> statement-breakpoint
ALTER TABLE `candidaturas` ADD `data_confirmacao` timestamp;