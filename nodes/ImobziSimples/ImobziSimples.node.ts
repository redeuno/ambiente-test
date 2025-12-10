import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IHttpRequestOptions,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

export class ImobziSimples implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Imobzi Simples',
		name: 'imobziSimples',
		icon: 'file:imobzi.svg',
		group: ['transform'],
		version: 1,
		description: 'Versão simplificada para teste',
		defaults: {
			name: 'Imobzi Simples',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'imobziApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Operação',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Listar Imóveis',
						value: 'getProperties',
						description: 'Buscar todos os imóveis',
						action: 'Listar propriedades',
					},
					{
						name: 'Listar Contatos',
						value: 'getContacts',
						description: 'Buscar todos os contatos',
						action: 'Listar contatos',
					},
				],
				default: 'getProperties',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const operation = this.getNodeParameter('operation', i) as string;

				let url = '';
				if (operation === 'getProperties') {
					url = 'https://api.imobzi.app/v1/properties';
				} else if (operation === 'getContacts') {
					url = 'https://api.imobzi.app/v1/contacts';
				}

				const requestOptions: IHttpRequestOptions = {
					method: 'GET',
					url,
					headers: {
						'Content-Type': 'application/json',
					},
				};

				const response = await this.helpers.requestWithAuthentication.call(
					this,
					'imobziApi',
					requestOptions,
				);

				// Tratar resposta
				let data: any[] = [];
				if (Array.isArray(response)) {
					data = response;
				} else if (response.properties) {
					data = response.properties;
				} else if (response.contacts) {
					data = response.contacts;
				} else {
					data = [response];
				}

				if (data.length === 0) {
					returnData.push({ json: { message: 'Nenhum resultado' } });
				} else {
					data.forEach((item) => returnData.push({ json: item }));
				}
			} catch (error: any) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error.message,
						},
						pairedItem: i,
					});
				} else {
					throw new NodeOperationError(this.getNode(), error.message, { itemIndex: i });
				}
			}
		}

		return [returnData];
	}
}

