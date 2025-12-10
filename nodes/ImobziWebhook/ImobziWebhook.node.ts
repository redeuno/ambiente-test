import { INodeType, INodeTypeDescription, IWebhookFunctions, NodeOperationError, NodeConnectionType } from 'n8n-workflow';

export class ImobziWebhook implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Imobzi Webhook',
		name: 'imobziWebhook',
		icon: 'file:imobzi.svg',
		group: ['trigger'],
		version: 1,
		description: 'Recebe eventos da API Imobzi via Webhook',
		subtitle: '={{$parameter[\'event\']}}',
		defaults: {
			name: 'Imobzi Webhook',
		},
		inputs: [],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'imobziApi',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'imobzi/webhook',
			},
		],
		properties: [
			{
				displayName: 'Eventos',
				name: 'event',
				type: 'multiOptions',
				options: [
					{ name: 'Contato Atualizado', value: 'contact.updated' },
					{ name: 'Contato Criado', value: 'contact.created' },
					{ name: 'Contrato Atualizado', value: 'contract.updated' },
					{ name: 'Contrato Criado', value: 'contract.created' },
					{ name: 'Documento Atualizado', value: 'document.updated' },
					{ name: 'Documento Criado', value: 'document.created' },
					{ name: 'Evento Atualizado', value: 'event.updated' },
					{ name: 'Evento Criado', value: 'event.created' },
					{ name: 'Imóvel Atualizado', value: 'property.updated' },
					{ name: 'Imóvel Criado', value: 'property.created' },
					{ name: 'Lead Atualizado', value: 'lead.updated' },
					{ name: 'Lead Criado', value: 'lead.created' },
					{ name: 'Tarefa Atualizada', value: 'task.updated' },
					{ name: 'Tarefa Criada', value: 'task.created' },
					{ name: 'Visita Agendada', value: 'visit.scheduled' },
					{ name: 'Visita Cancelada', value: 'visit.cancelled' },
				],
				default: [],
				description: 'Selecione os tipos de eventos para acionar o webhook',
			},
		],
	};

	async webhook(this: IWebhookFunctions): Promise<any> {
		const body = this.getRequestObject().body;
		
		// Validação básica do formato do webhook
		if (!body || !body.event) {
			throw new NodeOperationError(this.getNode(), 'Formato de webhook inválido');
		}

		return {
			workflowData: [
				{
					json: {
						event: body.event,
						timestamp: body.timestamp,
						data: body.data,
					},
				},
			],
		};
	}

	async checkExists(this: IWebhookFunctions): Promise<boolean> {
		// Sempre retorna true, pois o n8n gerencia o endpoint
		return true;
	}

	async create(this: IWebhookFunctions): Promise<boolean> {
		// Não é necessário registrar o webhook externamente
		return true;
	}

	async delete(this: IWebhookFunctions): Promise<boolean> {
		// Não é necessário remover o webhook externamente
		return true;
	}
} 