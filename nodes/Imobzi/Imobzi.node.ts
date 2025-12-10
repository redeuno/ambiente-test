import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
	ILoadOptionsFunctions,
	INodePropertyOptions,
	INodeProperties,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

// Mapeamento de recursos para endpoints e nomes de resposta da API Imobzi
// Baseado na documentação: https://developer.imobzi.com/
// Atualizado para nova API: https://api.imobzi.app (2025-12-09)
const resourceEndpoint: { [resource: string]: string } = {
	lead: 'v1/contacts', // Leads agora são parte de Contacts
	property: 'v1/properties',
	contact: 'v1/contacts',
	contrato: 'v1/contracts',
	financeiro: 'v1/financial/accounts',
	locacao: 'v1/leases', // Mudou de rentals para leases
	documento: 'v1/documents',
	tarefa: 'v1/timeline', // Tasks agora são Timeline items
	agenda: 'v1/calendar', // Mudou de agendas para calendar
	evento: 'v1/calendar', // Eventos também são calendar
	integracao: 'v1/integrations',
	usuario: 'v1/users',
	account: 'v1/users', // Account não existe mais, usar users
	// Novos recursos disponíveis
	deal: 'v1/deals',
	pipeline: 'v1/pipelines',
	invoice: 'v1/invoices',
	transaction: 'v1/financial/transactions',
	webhook: 'v1/webhooks',
	team: 'v1/user-teams',
	neighborhood: 'v1/neighborhoods',
	propertyType: 'v1/property-types',
	propertyFeature: 'v1/property-features',
	mediaSource: 'v1/media-sources',
	notaFiscal: 'v1/notas-fiscais',
	timeline: 'v1/timeline',
	notification: 'v1/notifications',
};

// Mapeamento de recursos para os nomes dos arrays na resposta
// NOTA: Alguns recursos retornam array direto, outros retornam objeto com chave
const resourceResponseKey: { [resource: string]: string } = {
	// Retornam objeto com chave nomeada
	property: 'properties',
	contact: 'contacts',
	lead: 'contacts',
	contrato: 'contracts',
	locacao: 'leases',
	documento: 'documents',
	
	// Financial
	financeiro: 'accounts',
	transaction: 'transactions',
	
	// Estes retornam ARRAY DIRETO (não usar chave)
	usuario: '', // Array direto
	pipeline: '', // Array direto
	integracao: '', // Array direto
	webhook: '', // Array direto
	
	// Casos especiais
	deal: '', // Estrutura complexa
	agenda: 'calendar',
	evento: 'calendar',
	tarefa: 'timeline',
	timeline: 'timeline',
	notification: 'notifications',
};

// Função para criar campos de criação dinâmicos específicos por recurso
const createCreateFieldsProperty = (resourceName: string): INodeProperties => {
	const baseOptions = [
		{
			displayName: 'Name',
			name: 'name',
			type: 'string',
			default: '',
			description: 'Name of the item',
		},
		{
			displayName: 'Email',
			name: 'email',
			type: 'string',
			placeholder: 'name@email.com',
			default: '',
			description: 'Email address',
		},
		{
			displayName: 'Phone',
			name: 'phone',
			type: 'string',
			default: '',
			description: 'Phone number',
		},
		{
			displayName: 'Description',
			name: 'description',
			type: 'string',
			default: '',
			description: 'Description of the item',
		},
	];

	// Campos específicos por recurso
	const resourceSpecificOptions: { [key: string]: any[] } = {
		lead: [
			...baseOptions,
			{
				displayName: 'Source',
				name: 'source',
				type: 'string',
				default: '',
				description: 'Lead source',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'string',
				default: '',
				description: 'Lead status',
			},
		],
		property: [
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				description: 'Property title',
			},
			{
				displayName: 'Type',
				name: 'type',
				type: 'string',
				default: '',
				description: 'Property type (house, apartment, etc.)',
			},
			{
				displayName: 'Price',
				name: 'price',
				type: 'number',
				default: 0,
				description: 'Property price',
			},
			{
				displayName: 'Address',
				name: 'address',
				type: 'string',
				default: '',
				description: 'Property address',
			},
			{
				displayName: 'City',
				name: 'city',
				type: 'string',
				default: '',
				description: 'Property city',
			},
			{
				displayName: 'State',
				name: 'state',
				type: 'string',
				default: '',
				description: 'Property state',
			},
		],
		contact: [
			...baseOptions,
			{
				displayName: 'Company',
				name: 'company',
				type: 'string',
				default: '',
				description: 'Company name',
			},
		],
		tarefa: [
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				description: 'Task title',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Task description',
			},
			{
				displayName: 'Due Date',
				name: 'dueDate',
				type: 'string',
				default: '',
				description: 'Task due date',
			},
			{
				displayName: 'Priority',
				name: 'priority',
				type: 'string',
				default: '',
				description: 'Task priority',
			},
		],
		agenda: [
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				description: 'Agenda title',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Agenda description',
			},
		],
		evento: [
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				description: 'Event title',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Event description',
			},
			{
				displayName: 'Start Date',
				name: 'startDate',
				type: 'string',
				default: '',
				description: 'Event start date',
			},
			{
				displayName: 'End Date',
				name: 'endDate',
				type: 'string',
				default: '',
				description: 'Event end date',
			},
		],
	};

	return {
		displayName: 'Create Fields',
		name: 'createFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: [resourceName],
				operation: ['create'],
			},
		},
		options: resourceSpecificOptions[resourceName] || baseOptions,
	};
};

// Função para criar campos de atualização dinâmicos específicos por recurso
const createUpdateFieldsProperty = (resourceName: string): INodeProperties => {
	const baseOptions = [
		{
			displayName: 'Name',
			name: 'name',
			type: 'string',
			default: '',
			description: 'Name of the item',
		},
		{
			displayName: 'Email',
			name: 'email',
			type: 'string',
			placeholder: 'name@email.com',
			default: '',
			description: 'Email address',
		},
		{
			displayName: 'Phone',
			name: 'phone',
			type: 'string',
			default: '',
			description: 'Phone number',
		},
		{
			displayName: 'Description',
			name: 'description',
			type: 'string',
			default: '',
			description: 'Description of the item',
		},
	];

	// Campos específicos por recurso (mesmos campos de criação)
	const resourceSpecificOptions: { [key: string]: any[] } = {
		lead: [
			...baseOptions,
			{
				displayName: 'Source',
				name: 'source',
				type: 'string',
				default: '',
				description: 'Lead source',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'string',
				default: '',
				description: 'Lead status',
			},
		],
		property: [
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				description: 'Property title',
			},
			{
				displayName: 'Type',
				name: 'type',
				type: 'string',
				default: '',
				description: 'Property type (house, apartment, etc.)',
			},
			{
				displayName: 'Price',
				name: 'price',
				type: 'number',
				default: 0,
				description: 'Property price',
			},
			{
				displayName: 'Address',
				name: 'address',
				type: 'string',
				default: '',
				description: 'Property address',
			},
			{
				displayName: 'City',
				name: 'city',
				type: 'string',
				default: '',
				description: 'Property city',
			},
			{
				displayName: 'State',
				name: 'state',
				type: 'string',
				default: '',
				description: 'Property state',
			},
		],
		contact: [
			...baseOptions,
			{
				displayName: 'Company',
				name: 'company',
				type: 'string',
				default: '',
				description: 'Company name',
			},
		],
		tarefa: [
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				description: 'Task title',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Task description',
			},
			{
				displayName: 'Due Date',
				name: 'dueDate',
				type: 'string',
				default: '',
				description: 'Task due date',
			},
			{
				displayName: 'Priority',
				name: 'priority',
				type: 'string',
				default: '',
				description: 'Task priority',
			},
		],
		agenda: [
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				description: 'Agenda title',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Agenda description',
			},
		],
		evento: [
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				description: 'Event title',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Event description',
			},
			{
				displayName: 'Start Date',
				name: 'startDate',
				type: 'string',
				default: '',
				description: 'Event start date',
			},
			{
				displayName: 'End Date',
				name: 'endDate',
				type: 'string',
				default: '',
				description: 'Event end date',
			},
		],
	};

	return {
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: [resourceName],
				operation: ['update'],
			},
		},
		options: resourceSpecificOptions[resourceName] || baseOptions,
	};
};

export class Imobzi implements INodeType {
	methods = {
		loadOptions: {
			// Métodos específicos para cada recurso
			async getLeads(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const response = await this.helpers.requestWithAuthentication.call(
					this,
					'imobziApi',
					{ method: 'GET', url: 'https://api.imobzi.app/v1/contacts' },
				);
				return (response.data || []).map((item: any) => ({
					name: item.name || `ID ${item.id}`,
					value: item.id,
				}));
			},
			async getLeadFields(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const response = await this.helpers.requestWithAuthentication.call(
					this,
					'imobziApi',
					{ method: 'GET', url: 'https://api.imobzi.app/v1/leads', qs: { limit: 1 } },
				);
				const item = (response.data || [])[0] || {};
				return Object.keys(item).map(key => ({
					name: key,
					value: key,
				}));
			},
			async getProperties(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const response = await this.helpers.requestWithAuthentication.call(
					this,
					'imobziApi',
					{ method: 'GET', url: 'https://api.imobzi.app/v1/properties' },
				);
				return (response.data || []).map((item: any) => ({
					name: item.title || item.titulo || `ID ${item.id}`,
					value: item.id,
				}));
			},
			async getPropertyFields(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const response = await this.helpers.requestWithAuthentication.call(
					this,
					'imobziApi',
					{ method: 'GET', url: 'https://api.imobzi.app/v1/properties', qs: { limit: 1 } },
				);
				const item = (response.data || [])[0] || {};
				return Object.keys(item).map(key => ({
					name: key,
					value: key,
				}));
			},
			async getContacts(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const response = await this.helpers.requestWithAuthentication.call(
					this,
					'imobziApi',
					{ method: 'GET', url: 'https://api.imobzi.app/v1/contacts' },
				);
				return (response.data || []).map((item: any) => ({
					name: item.name || `ID ${item.id}`,
					value: item.id,
				}));
			},
			async getContactFields(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const response = await this.helpers.requestWithAuthentication.call(
					this,
					'imobziApi',
					{ method: 'GET', url: 'https://api.imobzi.app/v1/contacts', qs: { limit: 1 } },
				);
				const item = (response.data || [])[0] || {};
				return Object.keys(item).map(key => ({
					name: key,
					value: key,
				}));
			},
			async getContracts(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const response = await this.helpers.requestWithAuthentication.call(
					this,
					'imobziApi',
					{ method: 'GET', url: 'https://api.imobzi.app/v1/contracts' },
				);
				return (response.data || []).map((item: any) => ({
					name: item.client || item.cliente || `ID ${item.id}`,
					value: item.id,
				}));
			},
			async getContractFields(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const response = await this.helpers.requestWithAuthentication.call(
					this,
					'imobziApi',
					{ method: 'GET', url: 'https://api.imobzi.app/v1/contracts', qs: { limit: 1 } },
				);
				const item = (response.data || [])[0] || {};
				return Object.keys(item).map(key => ({
					name: key,
					value: key,
				}));
			},
			async getFinancialAccounts(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const response = await this.helpers.requestWithAuthentication.call(
					this,
					'imobziApi',
					{ method: 'GET', url: 'https://api.imobzi.app/v1/financial/accounts' },
				);
				return (response.data || []).map((item: any) => ({
					name: item.description || item.descricao || `ID ${item.id}`,
					value: item.id,
				}));
			},
			async getFinancialAccountFields(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const response = await this.helpers.requestWithAuthentication.call(
					this,
					'imobziApi',
					{ method: 'GET', url: 'https://api.imobzi.app/v1/financial/accounts', qs: { limit: 1 } },
				);
				const item = (response.data || [])[0] || {};
				return Object.keys(item).map(key => ({
					name: key,
					value: key,
				}));
			},
			async getRentals(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const response = await this.helpers.requestWithAuthentication.call(
					this,
					'imobziApi',
					{ method: 'GET', url: 'https://api.imobzi.app/v1/leases' },
				);
				return (response.data || []).map((item: any) => ({
					name: item.tenant || item.inquilino || `ID ${item.id}`,
					value: item.id,
				}));
			},
			async getRentalFields(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const response = await this.helpers.requestWithAuthentication.call(
					this,
					'imobziApi',
					{ method: 'GET', url: 'https://api.imobzi.app/v1/leases', qs: { limit: 1 } },
				);
				const item = (response.data || [])[0] || {};
				return Object.keys(item).map(key => ({
					name: key,
					value: key,
				}));
			},
			async getDocuments(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const response = await this.helpers.requestWithAuthentication.call(
					this,
					'imobziApi',
					{ method: 'GET', url: 'https://api.imobzi.app/v1/documents' },
				);
				return (response.data || []).map((item: any) => ({
					name: item.filename || item.nomeArquivo || `ID ${item.id}`,
					value: item.id,
				}));
			},
			async getDocumentFields(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const response = await this.helpers.requestWithAuthentication.call(
					this,
					'imobziApi',
					{ method: 'GET', url: 'https://api.imobzi.app/v1/documents', qs: { limit: 1 } },
				);
				const item = (response.data || [])[0] || {};
				return Object.keys(item).map(key => ({
					name: key,
					value: key,
				}));
			},
			async getTasks(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const response = await this.helpers.requestWithAuthentication.call(
					this,
					'imobziApi',
					{ method: 'GET', url: 'https://api.imobzi.app/v1/timeline' },
				);
				return (response.data || []).map((item: any) => ({
					name: item.title || item.titulo || `ID ${item.id}`,
					value: item.id,
				}));
			},
			async getTaskFields(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const response = await this.helpers.requestWithAuthentication.call(
					this,
					'imobziApi',
					{ method: 'GET', url: 'https://api.imobzi.app/v1/timeline', qs: { limit: 1 } },
				);
				const item = (response.data || [])[0] || {};
				return Object.keys(item).map(key => ({
					name: key,
					value: key,
				}));
			},
			async getAgendas(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const response = await this.helpers.requestWithAuthentication.call(
					this,
					'imobziApi',
					{ method: 'GET', url: 'https://api.imobzi.app/v1/calendar' },
				);
				return (response.data || []).map((item: any) => ({
					name: item.title || item.titulo || `ID ${item.id}`,
					value: item.id,
				}));
			},
			async getAgendaFields(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const response = await this.helpers.requestWithAuthentication.call(
					this,
					'imobziApi',
					{ method: 'GET', url: 'https://api.imobzi.app/v1/calendar', qs: { limit: 1 } },
				);
				const item = (response.data || [])[0] || {};
				return Object.keys(item).map(key => ({
					name: key,
					value: key,
				}));
			},
			async getEvents(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const response = await this.helpers.requestWithAuthentication.call(
					this,
					'imobziApi',
					{ method: 'GET', url: 'https://api.imobzi.app/v1/calendar' },
				);
				return (response.data || []).map((item: any) => ({
					name: item.title || item.titulo || `ID ${item.id}`,
					value: item.id,
				}));
			},
			async getEventFields(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const response = await this.helpers.requestWithAuthentication.call(
					this,
					'imobziApi',
					{ method: 'GET', url: 'https://api.imobzi.app/v1/calendar', qs: { limit: 1 } },
				);
				const item = (response.data || [])[0] || {};
				return Object.keys(item).map(key => ({
					name: key,
					value: key,
				}));
			},
			async getIntegrations(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const response = await this.helpers.requestWithAuthentication.call(
					this,
					'imobziApi',
					{ method: 'GET', url: 'https://api.imobzi.app/v1/integrations' },
				);
				return (response.data || []).map((item: any) => ({
					name: item.name || item.nome || `ID ${item.id}`,
					value: item.id,
				}));
			},
			async getIntegrationFields(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const response = await this.helpers.requestWithAuthentication.call(
					this,
					'imobziApi',
					{ method: 'GET', url: 'https://api.imobzi.app/v1/integrations', qs: { limit: 1 } },
				);
				const item = (response.data || [])[0] || {};
				return Object.keys(item).map(key => ({
					name: key,
					value: key,
				}));
			},
			async getUsers(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const response = await this.helpers.requestWithAuthentication.call(
					this,
					'imobziApi',
					{ method: 'GET', url: 'https://api.imobzi.app/v1/users' },
				);
				return (response.data || []).map((item: any) => ({
					name: item.name || item.nome || `ID ${item.id}`,
					value: item.id,
				}));
			},
			async getUserFields(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const response = await this.helpers.requestWithAuthentication.call(
					this,
					'imobziApi',
					{ method: 'GET', url: 'https://api.imobzi.app/v1/users', qs: { limit: 1 } },
				);
				const item = (response.data || [])[0] || {};
				return Object.keys(item).map(key => ({
					name: key,
					value: key,
				}));
			},
		},
	};

	description: INodeTypeDescription = {
		displayName: 'Imobzi',
		name: 'imobzi',
		icon: 'file:imobzi.svg',
		group: ['transform'],
		version: 2,
		description: 'Interagir com a API da Imobzi',
		defaults: {
			name: 'Imobzi',
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
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Account', value: 'account' },
					{ name: 'Agenda', value: 'agenda' },
					{ name: 'Contact', value: 'contact' },
					{ name: 'Contrato', value: 'contrato' },
					{ name: 'Deal', value: 'deal' },
					{ name: 'Documento', value: 'documento' },
					{ name: 'Evento', value: 'evento' },
					{ name: 'Financeiro', value: 'financeiro' },
					{ name: 'Imovel', value: 'property' },
					{ name: 'Integracao', value: 'integracao' },
					{ name: 'Invoice', value: 'invoice' },
					{ name: 'Lead', value: 'lead' },
					{ name: 'Locacao', value: 'locacao' },
					{ name: 'Media Source', value: 'mediaSource' },
					{ name: 'Neighborhood', value: 'neighborhood' },
					{ name: 'Nota Fiscal', value: 'notaFiscal' },
					{ name: 'Notification', value: 'notification' },
					{ name: 'Pipeline', value: 'pipeline' },
					{ name: 'Property Feature', value: 'propertyFeature' },
					{ name: 'Property Type', value: 'propertyType' },
					{ name: 'Tarefa', value: 'tarefa' },
					{ name: 'Team', value: 'team' },
					{ name: 'Timeline', value: 'timeline' },
					{ name: 'Transaction', value: 'transaction' },
					{ name: 'Usuario', value: 'usuario' },
					{ name: 'Webhook', value: 'webhook' },
				],
				default: 'lead',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Create', value: 'create', action: 'Create a new item' },
					{ name: 'Delete', value: 'delete', action: 'Delete an item' },
					{ name: 'Get', value: 'get', action: 'Get an item by ID' },
					{ name: 'Get Many', value: 'getAll', action: 'Get many items' },
					{ name: 'Update', value: 'update', action: 'Update an item' },
				],
				default: 'create',
			},
			// Buscar por - Lead (Get)
			{
				displayName: 'Buscar por',
				name: 'searchBy',
				type: 'options',
				options: [
					{ name: 'Código', value: 'code' },
					{ name: 'CPF', value: 'cpf' },
					{ name: 'Email', value: 'email' },
					{ name: 'ID', value: 'id' },
					{ name: 'Nome', value: 'name' },
					{ name: 'Telefone', value: 'phone' },
				],
				default: 'id',
				displayOptions: {
					show: {
						operation: ['get'],
						resource: ['lead'],
					},
				},
			},
			// Valor da busca - Lead (Get)
			{
				displayName: 'Valor',
				name: 'id',
				type: 'string',
				required: true,
				default: '',
				description: 'ID, código, email, telefone, CPF ou nome do lead',
				displayOptions: {
					show: {
						operation: ['get'],
						resource: ['lead'],
						searchBy: ['id', 'code', 'email', 'phone', 'cpf', 'name'],
					},
				},
			},
			// ID para Update e Delete - Lead
			{
				displayName: 'Lead Name or ID',
				name: 'id',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getLeads',
				},
				required: true,
				default: '',
				description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
				displayOptions: {
					show: {
						operation: ['update', 'delete'],
						resource: ['lead'],
					},
				},
			},
			// Buscar por - Property (Get)
			{
				displayName: 'Buscar por',
				name: 'searchBy',
				type: 'options',
				options: [
					{ name: 'ID', value: 'id' },
					{ name: 'Código', value: 'code' },
					{ name: 'Nome/Título', value: 'name' },
				],
				default: 'id',
				displayOptions: {
					show: {
						operation: ['get'],
						resource: ['property'],
					},
				},
			},
			// Valor da busca - Property (Get)
			{
				displayName: 'Valor',
				name: 'id',
				type: 'string',
				required: true,
				default: '',
				description: 'ID, código ou nome/título do imóvel',
				displayOptions: {
					show: {
						operation: ['get'],
						resource: ['property'],
						searchBy: ['id', 'code', 'name'],
					},
				},
			},
			// ID para Update e Delete - Property
			{
				displayName: 'Property Name or ID',
				name: 'id',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getProperties',
				},
				required: true,
				default: '',
				description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
				displayOptions: {
					show: {
						operation: ['update', 'delete'],
						resource: ['property'],
					},
				},
			},
			// Buscar por - Contact (Get)
			{
				displayName: 'Buscar por',
				name: 'searchBy',
				type: 'options',
				options: [
					{ name: 'Código', value: 'code' },
					{ name: 'CPF', value: 'cpf' },
					{ name: 'Email', value: 'email' },
					{ name: 'ID', value: 'id' },
					{ name: 'Nome', value: 'name' },
					{ name: 'Telefone', value: 'phone' },
				],
				default: 'id',
				displayOptions: {
					show: {
						operation: ['get'],
						resource: ['contact'],
					},
				},
			},
			// Valor da busca - Contact (Get)
			{
				displayName: 'Valor',
				name: 'id',
				type: 'string',
				required: true,
				default: '',
				description: 'ID, código, email, telefone, CPF ou nome do contato',
				displayOptions: {
					show: {
						operation: ['get'],
						resource: ['contact'],
						searchBy: ['id', 'code', 'email', 'phone', 'cpf', 'name'],
					},
				},
			},
			// ID para Update e Delete - Contact
			{
				displayName: 'Contact Name or ID',
				name: 'id',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getContacts',
				},
				required: true,
				default: '',
				description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
				displayOptions: {
					show: {
						operation: ['update', 'delete'],
						resource: ['contact'],
					},
				},
			},
			// Buscar por - Contrato (Get)
			{
				displayName: 'Buscar por',
				name: 'searchBy',
				type: 'options',
				options: [
					{ name: 'ID', value: 'id' },
					{ name: 'Código', value: 'code' },
				],
				default: 'id',
				displayOptions: {
					show: {
						operation: ['get'],
						resource: ['contrato'],
					},
				},
			},
			// Valor da busca - Contrato (Get)
			{
				displayName: 'Valor',
				name: 'id',
				type: 'string',
				required: true,
				default: '',
				description: 'ID ou código do contrato',
				displayOptions: {
					show: {
						operation: ['get'],
						resource: ['contrato'],
						searchBy: ['id', 'code'],
					},
				},
			},
			// ID para Update e Delete - Contrato
			{
				displayName: 'Contract Name or ID',
				name: 'id',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getContracts',
				},
				required: true,
				default: '',
				description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
				displayOptions: {
					show: {
						operation: ['update', 'delete'],
						resource: ['contrato'],
					},
				},
			},
			// ID para Get, Update e Delete - Financeiro
			{
				displayName: 'Financial Account Name or ID',
				name: 'id',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getFinancialAccounts',
				},
				required: true,
				default: '',
				description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
				displayOptions: {
					show: {
						operation: ['get', 'update', 'delete'],
						resource: ['financeiro'],
					},
				},
			},
			// Buscar por - Locacao (Get)
			{
				displayName: 'Buscar por',
				name: 'searchBy',
				type: 'options',
				options: [
					{ name: 'ID', value: 'id' },
					{ name: 'Código', value: 'code' },
				],
				default: 'id',
				displayOptions: {
					show: {
						operation: ['get'],
						resource: ['locacao'],
					},
				},
			},
			// Valor da busca - Locacao (Get)
			{
				displayName: 'Valor',
				name: 'id',
				type: 'string',
				required: true,
				default: '',
				description: 'ID ou código da locação',
				displayOptions: {
					show: {
						operation: ['get'],
						resource: ['locacao'],
						searchBy: ['id', 'code'],
					},
				},
			},
			// ID para Update e Delete - Locacao
			{
				displayName: 'Rental Name or ID',
				name: 'id',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getRentals',
				},
				required: true,
				default: '',
				description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
				displayOptions: {
					show: {
						operation: ['update', 'delete'],
						resource: ['locacao'],
					},
				},
			},
			// ID para Get, Update e Delete - Documento
			{
				displayName: 'Document Name or ID',
				name: 'id',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getDocuments',
				},
				required: true,
				default: '',
				description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
				displayOptions: {
					show: {
						operation: ['get', 'update', 'delete'],
						resource: ['documento'],
					},
				},
			},
			// ID para Get, Update e Delete - Tarefa
			{
				displayName: 'Task Name or ID',
				name: 'id',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getTasks',
				},
				required: true,
				default: '',
				description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
				displayOptions: {
					show: {
						operation: ['get', 'update', 'delete'],
						resource: ['tarefa'],
					},
				},
			},
			// ID para Get, Update e Delete - Agenda
			{
				displayName: 'Agenda Name or ID',
				name: 'id',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getAgendas',
				},
				required: true,
				default: '',
				description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
				displayOptions: {
					show: {
						operation: ['get', 'update', 'delete'],
						resource: ['agenda'],
					},
				},
			},
			// ID para Get, Update e Delete - Evento
			{
				displayName: 'Event Name or ID',
				name: 'id',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getEvents',
				},
				required: true,
				default: '',
				description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
				displayOptions: {
					show: {
						operation: ['get', 'update', 'delete'],
						resource: ['evento'],
					},
				},
			},
			// ID para Get, Update e Delete - Integracao
			{
				displayName: 'Integration Name or ID',
				name: 'id',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getIntegrations',
				},
				required: true,
				default: '',
				description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
				displayOptions: {
					show: {
						operation: ['get', 'update', 'delete'],
						resource: ['integracao'],
					},
				},
			},
			// ID para Get, Update e Delete - Usuario
			{
				displayName: 'User Name or ID',
				name: 'id',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getUsers',
				},
				required: true,
				default: '',
				description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
				displayOptions: {
					show: {
						operation: ['get', 'update', 'delete'],
						resource: ['usuario'],
					},
				},
			},
			// Campos de busca rápida - Lead (GetAll)
			{
				displayName: 'Busca Rápida',
				name: 'quickSearch',
				type: 'collection',
				placeholder: 'Adicionar campo de busca',
				default: {},
				displayOptions: {
					show: {
						resource: ['lead'],
						operation: ['getAll'],
					},
				},
				options: [
					{
						displayName: 'Email',
						name: 'email',
						type: 'string',
						default: '',
						placeholder: 'name@email.com',
						description: 'Buscar por email',
					},
					{
						displayName: 'Telefone',
						name: 'phone',
						type: 'string',
						default: '',
						description: 'Buscar por telefone',
					},
					{
						displayName: 'CPF',
						name: 'cpf',
						type: 'string',
						default: '',
						description: 'Buscar por CPF',
					},
					{
						displayName: 'Nome',
						name: 'name',
						type: 'string',
						default: '',
						description: 'Buscar por nome (usa search_text)',
					},
				],
			},
			// Filtros para GetAll - Lead
			{
				displayName: 'Filtros Avançados',
				name: 'filters',
				type: 'fixedCollection',
				typeOptions: { multipleValues: true },
				placeholder: 'Adicionar filtro',
				default: {},
				displayOptions: {
					show: {
						resource: ['lead'],
						operation: ['getAll'],
					},
				},
				options: [
					{
						name: 'filter',
						displayName: 'Condição',
						values: [
							{
								displayName: 'Campo Name or ID',
								name: 'field',
								type: 'options',
								typeOptions: { loadOptionsMethod: 'getLeadFields' },
								default: '',
								description: 'Campo para filtrar. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
							},
							{
								displayName: 'Operador',
								name: 'operator',
								type: 'options',
								options: [
									{ name: 'Começa Com', value: 'starts_with' },
									{ name: 'Contém', value: 'contains' },
									{ name: 'Diferente', value: 'neq' },
									{ name: 'Igual', value: 'eq' },
									{ name: 'Maior Ou Igual', value: 'gte' },
									{ name: 'Maior Que', value: 'gt' },
									{ name: 'Menor Ou Igual', value: 'lte' },
									{ name: 'Menor Que', value: 'lt' },
									{ name: 'Não Contém', value: 'not_contains' },
									{ name: 'Termina Com', value: 'ends_with' },
								],
								default: 'eq',
								description: 'Operador de comparação',
							},
							{
								displayName: 'Valor',
								name: 'value',
								type: 'string',
								default: '',
								description: 'Valor para comparar',
							},
						],
					},
				],
			},
			// Campos de busca rápida - Property (GetAll)
			{
				displayName: 'Busca Rápida',
				name: 'quickSearch',
				type: 'collection',
				placeholder: 'Adicionar campo de busca',
				default: {},
				displayOptions: {
					show: {
						resource: ['property'],
						operation: ['getAll'],
					},
				},
				options: [
					{
						displayName: 'Nome/Título',
						name: 'name',
						type: 'string',
						default: '',
						description: 'Buscar por nome ou título (usa search_text)',
					},
				],
			},
			// Filtros para GetAll - Property
			{
				displayName: 'Filtros Avançados',
				name: 'filters',
				type: 'fixedCollection',
				typeOptions: { multipleValues: true },
				placeholder: 'Adicionar filtro',
				default: {},
				displayOptions: {
					show: {
						resource: ['property'],
						operation: ['getAll'],
					},
				},
				options: [
					{
						name: 'filter',
						displayName: 'Condição',
						values: [
							{
								displayName: 'Campo Name or ID',
								name: 'field',
								type: 'options',
								typeOptions: { loadOptionsMethod: 'getPropertyFields' },
								default: '',
								description: 'Campo para filtrar. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
							},
							{
								displayName: 'Operador',
								name: 'operator',
								type: 'options',
								options: [
									{ name: 'Começa Com', value: 'starts_with' },
									{ name: 'Contém', value: 'contains' },
									{ name: 'Diferente', value: 'neq' },
									{ name: 'Igual', value: 'eq' },
									{ name: 'Maior Ou Igual', value: 'gte' },
									{ name: 'Maior Que', value: 'gt' },
									{ name: 'Menor Ou Igual', value: 'lte' },
									{ name: 'Menor Que', value: 'lt' },
									{ name: 'Não Contém', value: 'not_contains' },
									{ name: 'Termina Com', value: 'ends_with' },
								],
								default: 'eq',
								description: 'Operador de comparação',
							},
							{
								displayName: 'Valor',
								name: 'value',
								type: 'string',
								default: '',
								description: 'Valor para comparar',
							},
						],
					},
				],
			},
			// Campos de busca rápida - Contact (GetAll)
			{
				displayName: 'Busca Rápida',
				name: 'quickSearch',
				type: 'collection',
				placeholder: 'Adicionar campo de busca',
				default: {},
				displayOptions: {
					show: {
						resource: ['contact'],
						operation: ['getAll'],
					},
				},
				options: [
					{
						displayName: 'Email',
						name: 'email',
						type: 'string',
						default: '',
						placeholder: 'name@email.com',
						description: 'Buscar por email',
					},
					{
						displayName: 'Telefone',
						name: 'phone',
						type: 'string',
						default: '',
						description: 'Buscar por telefone',
					},
					{
						displayName: 'CPF',
						name: 'cpf',
						type: 'string',
						default: '',
						description: 'Buscar por CPF',
					},
					{
						displayName: 'Nome',
						name: 'name',
						type: 'string',
						default: '',
						description: 'Buscar por nome (usa search_text)',
					},
				],
			},
			// Filtros para GetAll - Contact
			{
				displayName: 'Filtros Avançados',
				name: 'filters',
				type: 'fixedCollection',
				typeOptions: { multipleValues: true },
				placeholder: 'Adicionar filtro',
				default: {},
				displayOptions: {
					show: {
						resource: ['contact'],
						operation: ['getAll'],
					},
				},
				options: [
					{
						name: 'filter',
						displayName: 'Condição',
						values: [
							{
								displayName: 'Campo Name or ID',
								name: 'field',
								type: 'options',
								typeOptions: { loadOptionsMethod: 'getContactFields' },
								default: '',
								description: 'Campo para filtrar. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
							},
							{
								displayName: 'Operador',
								name: 'operator',
								type: 'options',
								options: [
									{ name: 'Começa Com', value: 'starts_with' },
									{ name: 'Contém', value: 'contains' },
									{ name: 'Diferente', value: 'neq' },
									{ name: 'Igual', value: 'eq' },
									{ name: 'Maior Ou Igual', value: 'gte' },
									{ name: 'Maior Que', value: 'gt' },
									{ name: 'Menor Ou Igual', value: 'lte' },
									{ name: 'Menor Que', value: 'lt' },
									{ name: 'Não Contém', value: 'not_contains' },
									{ name: 'Termina Com', value: 'ends_with' },
								],
								default: 'eq',
								description: 'Operador de comparação',
							},
							{
								displayName: 'Valor',
								name: 'value',
								type: 'string',
								default: '',
								description: 'Valor para comparar',
							},
						],
					},
				],
			},
			// Filtros para GetAll - Contrato
			{
				displayName: 'Filtros',
				name: 'filters',
				type: 'fixedCollection',
				typeOptions: { multipleValues: true },
				placeholder: 'Adicionar filtro',
				default: {},
				displayOptions: {
					show: {
						resource: ['contrato'],
						operation: ['getAll'],
					},
				},
				options: [
					{
						name: 'filter',
						displayName: 'Condição',
						values: [
							{
								displayName: 'Campo Name or ID',
								name: 'field',
								type: 'options',
								typeOptions: { loadOptionsMethod: 'getContractFields' },
								default: '',
								description: 'Campo para filtrar. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
							},
							{
								displayName: 'Operador',
								name: 'operator',
								type: 'options',
								options: [
									{ name: 'Começa Com', value: 'starts_with' },
									{ name: 'Contém', value: 'contains' },
									{ name: 'Diferente', value: 'neq' },
									{ name: 'Igual', value: 'eq' },
									{ name: 'Maior Ou Igual', value: 'gte' },
									{ name: 'Maior Que', value: 'gt' },
									{ name: 'Menor Ou Igual', value: 'lte' },
									{ name: 'Menor Que', value: 'lt' },
									{ name: 'Não Contém', value: 'not_contains' },
									{ name: 'Termina Com', value: 'ends_with' },
								],
								default: 'eq',
								description: 'Operador de comparação',
							},
							{
								displayName: 'Valor',
								name: 'value',
								type: 'string',
								default: '',
								description: 'Valor para comparar',
							},
						],
					},
				],
			},
			// Filtros para GetAll - Financeiro
			{
				displayName: 'Filtros',
				name: 'filters',
				type: 'fixedCollection',
				typeOptions: { multipleValues: true },
				placeholder: 'Adicionar filtro',
				default: {},
				displayOptions: {
					show: {
						resource: ['financeiro'],
						operation: ['getAll'],
					},
				},
				options: [
					{
						name: 'filter',
						displayName: 'Condição',
						values: [
							{
								displayName: 'Campo Name or ID',
								name: 'field',
								type: 'options',
								typeOptions: { loadOptionsMethod: 'getFinancialAccountFields' },
								default: '',
								description: 'Campo para filtrar. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
							},
							{
								displayName: 'Operador',
								name: 'operator',
								type: 'options',
								options: [
									{ name: 'Começa Com', value: 'starts_with' },
									{ name: 'Contém', value: 'contains' },
									{ name: 'Diferente', value: 'neq' },
									{ name: 'Igual', value: 'eq' },
									{ name: 'Maior Ou Igual', value: 'gte' },
									{ name: 'Maior Que', value: 'gt' },
									{ name: 'Menor Ou Igual', value: 'lte' },
									{ name: 'Menor Que', value: 'lt' },
									{ name: 'Não Contém', value: 'not_contains' },
									{ name: 'Termina Com', value: 'ends_with' },
								],
								default: 'eq',
								description: 'Operador de comparação',
							},
							{
								displayName: 'Valor',
								name: 'value',
								type: 'string',
								default: '',
								description: 'Valor para comparar',
							},
						],
					},
				],
			},
			// Filtros para GetAll - Locacao
			{
				displayName: 'Filtros',
				name: 'filters',
				type: 'fixedCollection',
				typeOptions: { multipleValues: true },
				placeholder: 'Adicionar filtro',
				default: {},
				displayOptions: {
					show: {
						resource: ['locacao'],
						operation: ['getAll'],
					},
				},
				options: [
					{
						name: 'filter',
						displayName: 'Condição',
						values: [
							{
								displayName: 'Campo Name or ID',
								name: 'field',
								type: 'options',
								typeOptions: { loadOptionsMethod: 'getRentalFields' },
								default: '',
								description: 'Campo para filtrar. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
							},
							{
								displayName: 'Operador',
								name: 'operator',
								type: 'options',
								options: [
									{ name: 'Começa Com', value: 'starts_with' },
									{ name: 'Contém', value: 'contains' },
									{ name: 'Diferente', value: 'neq' },
									{ name: 'Igual', value: 'eq' },
									{ name: 'Maior Ou Igual', value: 'gte' },
									{ name: 'Maior Que', value: 'gt' },
									{ name: 'Menor Ou Igual', value: 'lte' },
									{ name: 'Menor Que', value: 'lt' },
									{ name: 'Não Contém', value: 'not_contains' },
									{ name: 'Termina Com', value: 'ends_with' },
								],
								default: 'eq',
								description: 'Operador de comparação',
							},
							{
								displayName: 'Valor',
								name: 'value',
								type: 'string',
								default: '',
								description: 'Valor para comparar',
							},
						],
					},
				],
			},
			// Filtros para GetAll - Documento
			{
				displayName: 'Filtros',
				name: 'filters',
				type: 'fixedCollection',
				typeOptions: { multipleValues: true },
				placeholder: 'Adicionar filtro',
				default: {},
				displayOptions: {
					show: {
						resource: ['documento'],
						operation: ['getAll'],
					},
				},
				options: [
					{
						name: 'filter',
						displayName: 'Condição',
						values: [
							{
								displayName: 'Campo Name or ID',
								name: 'field',
								type: 'options',
								typeOptions: { loadOptionsMethod: 'getDocumentFields' },
								default: '',
								description: 'Campo para filtrar. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
							},
							{
								displayName: 'Operador',
								name: 'operator',
								type: 'options',
								options: [
									{ name: 'Começa Com', value: 'starts_with' },
									{ name: 'Contém', value: 'contains' },
									{ name: 'Diferente', value: 'neq' },
									{ name: 'Igual', value: 'eq' },
									{ name: 'Maior Ou Igual', value: 'gte' },
									{ name: 'Maior Que', value: 'gt' },
									{ name: 'Menor Ou Igual', value: 'lte' },
									{ name: 'Menor Que', value: 'lt' },
									{ name: 'Não Contém', value: 'not_contains' },
									{ name: 'Termina Com', value: 'ends_with' },
								],
								default: 'eq',
								description: 'Operador de comparação',
							},
							{
								displayName: 'Valor',
								name: 'value',
								type: 'string',
								default: '',
								description: 'Valor para comparar',
							},
						],
					},
				],
			},
			// Filtros para GetAll - Tarefa
			{
				displayName: 'Filtros',
				name: 'filters',
				type: 'fixedCollection',
				typeOptions: { multipleValues: true },
				placeholder: 'Adicionar filtro',
				default: {},
				displayOptions: {
					show: {
						resource: ['tarefa'],
						operation: ['getAll'],
					},
				},
				options: [
					{
						name: 'filter',
						displayName: 'Condição',
						values: [
							{
								displayName: 'Campo Name or ID',
								name: 'field',
								type: 'options',
								typeOptions: { loadOptionsMethod: 'getTaskFields' },
								default: '',
								description: 'Campo para filtrar. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
							},
							{
								displayName: 'Operador',
								name: 'operator',
								type: 'options',
								options: [
									{ name: 'Começa Com', value: 'starts_with' },
									{ name: 'Contém', value: 'contains' },
									{ name: 'Diferente', value: 'neq' },
									{ name: 'Igual', value: 'eq' },
									{ name: 'Maior Ou Igual', value: 'gte' },
									{ name: 'Maior Que', value: 'gt' },
									{ name: 'Menor Ou Igual', value: 'lte' },
									{ name: 'Menor Que', value: 'lt' },
									{ name: 'Não Contém', value: 'not_contains' },
									{ name: 'Termina Com', value: 'ends_with' },
								],
								default: 'eq',
								description: 'Operador de comparação',
							},
							{
								displayName: 'Valor',
								name: 'value',
								type: 'string',
								default: '',
								description: 'Valor para comparar',
							},
						],
					},
				],
			},
			// Filtros para GetAll - Agenda
			{
				displayName: 'Filtros',
				name: 'filters',
				type: 'fixedCollection',
				typeOptions: { multipleValues: true },
				placeholder: 'Adicionar filtro',
				default: {},
				displayOptions: {
					show: {
						resource: ['agenda'],
						operation: ['getAll'],
					},
				},
				options: [
					{
						name: 'filter',
						displayName: 'Condição',
						values: [
							{
								displayName: 'Campo Name or ID',
								name: 'field',
								type: 'options',
								typeOptions: { loadOptionsMethod: 'getAgendaFields' },
								default: '',
								description: 'Campo para filtrar. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
							},
							{
								displayName: 'Operador',
								name: 'operator',
								type: 'options',
								options: [
									{ name: 'Começa Com', value: 'starts_with' },
									{ name: 'Contém', value: 'contains' },
									{ name: 'Diferente', value: 'neq' },
									{ name: 'Igual', value: 'eq' },
									{ name: 'Maior Ou Igual', value: 'gte' },
									{ name: 'Maior Que', value: 'gt' },
									{ name: 'Menor Ou Igual', value: 'lte' },
									{ name: 'Menor Que', value: 'lt' },
									{ name: 'Não Contém', value: 'not_contains' },
									{ name: 'Termina Com', value: 'ends_with' },
								],
								default: 'eq',
								description: 'Operador de comparação',
							},
							{
								displayName: 'Valor',
								name: 'value',
								type: 'string',
								default: '',
								description: 'Valor para comparar',
							},
						],
					},
				],
			},
			// Filtros para GetAll - Evento
			{
				displayName: 'Filtros',
				name: 'filters',
				type: 'fixedCollection',
				typeOptions: { multipleValues: true },
				placeholder: 'Adicionar filtro',
				default: {},
				displayOptions: {
					show: {
						resource: ['evento'],
						operation: ['getAll'],
					},
				},
				options: [
					{
						name: 'filter',
						displayName: 'Condição',
						values: [
							{
								displayName: 'Campo Name or ID',
								name: 'field',
								type: 'options',
								typeOptions: { loadOptionsMethod: 'getEventFields' },
								default: '',
								description: 'Campo para filtrar. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
							},
							{
								displayName: 'Operador',
								name: 'operator',
								type: 'options',
								options: [
									{ name: 'Começa Com', value: 'starts_with' },
									{ name: 'Contém', value: 'contains' },
									{ name: 'Diferente', value: 'neq' },
									{ name: 'Igual', value: 'eq' },
									{ name: 'Maior Ou Igual', value: 'gte' },
									{ name: 'Maior Que', value: 'gt' },
									{ name: 'Menor Ou Igual', value: 'lte' },
									{ name: 'Menor Que', value: 'lt' },
									{ name: 'Não Contém', value: 'not_contains' },
									{ name: 'Termina Com', value: 'ends_with' },
								],
								default: 'eq',
								description: 'Operador de comparação',
							},
							{
								displayName: 'Valor',
								name: 'value',
								type: 'string',
								default: '',
								description: 'Valor para comparar',
							},
						],
					},
				],
			},
			// Filtros para GetAll - Integracao
			{
				displayName: 'Filtros',
				name: 'filters',
				type: 'fixedCollection',
				typeOptions: { multipleValues: true },
				placeholder: 'Adicionar filtro',
				default: {},
				displayOptions: {
					show: {
						resource: ['integracao'],
						operation: ['getAll'],
					},
				},
				options: [
					{
						name: 'filter',
						displayName: 'Condição',
						values: [
							{
								displayName: 'Campo Name or ID',
								name: 'field',
								type: 'options',
								typeOptions: { loadOptionsMethod: 'getIntegrationFields' },
								default: '',
								description: 'Campo para filtrar. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
							},
							{
								displayName: 'Operador',
								name: 'operator',
								type: 'options',
								options: [
									{ name: 'Começa Com', value: 'starts_with' },
									{ name: 'Contém', value: 'contains' },
									{ name: 'Diferente', value: 'neq' },
									{ name: 'Igual', value: 'eq' },
									{ name: 'Maior Ou Igual', value: 'gte' },
									{ name: 'Maior Que', value: 'gt' },
									{ name: 'Menor Ou Igual', value: 'lte' },
									{ name: 'Menor Que', value: 'lt' },
									{ name: 'Não Contém', value: 'not_contains' },
									{ name: 'Termina Com', value: 'ends_with' },
								],
								default: 'eq',
								description: 'Operador de comparação',
							},
							{
								displayName: 'Valor',
								name: 'value',
								type: 'string',
								default: '',
								description: 'Valor para comparar',
							},
						],
					},
				],
			},
			// Filtros para GetAll - Usuario
			{
				displayName: 'Filtros',
				name: 'filters',
				type: 'fixedCollection',
				typeOptions: { multipleValues: true },
				placeholder: 'Adicionar filtro',
				default: {},
				displayOptions: {
					show: {
						resource: ['usuario'],
						operation: ['getAll'],
					},
				},
				options: [
					{
						name: 'filter',
						displayName: 'Condição',
						values: [
							{
								displayName: 'Campo Name or ID',
								name: 'field',
								type: 'options',
								typeOptions: { loadOptionsMethod: 'getUserFields' },
								default: '',
								description: 'Campo para filtrar. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
							},
							{
								displayName: 'Operador',
								name: 'operator',
								type: 'options',
								options: [
									{ name: 'Começa Com', value: 'starts_with' },
									{ name: 'Contém', value: 'contains' },
									{ name: 'Diferente', value: 'neq' },
									{ name: 'Igual', value: 'eq' },
									{ name: 'Maior Ou Igual', value: 'gte' },
									{ name: 'Maior Que', value: 'gt' },
									{ name: 'Menor Ou Igual', value: 'lte' },
									{ name: 'Menor Que', value: 'lt' },
									{ name: 'Não Contém', value: 'not_contains' },
									{ name: 'Termina Com', value: 'ends_with' },
								],
								default: 'eq',
								description: 'Operador de comparação',
							},
							{
								displayName: 'Valor',
								name: 'value',
								type: 'string',
								default: '',
								description: 'Valor para comparar',
							},
						],
					},
				],
			},
			// Campos de criação dinâmicos para cada recurso
			createCreateFieldsProperty('lead'),
			createCreateFieldsProperty('property'),
			createCreateFieldsProperty('contact'),
			createCreateFieldsProperty('contrato'),
			createCreateFieldsProperty('financeiro'),
			createCreateFieldsProperty('locacao'),
			createCreateFieldsProperty('documento'),
			createCreateFieldsProperty('tarefa'),
			createCreateFieldsProperty('agenda'),
			createCreateFieldsProperty('evento'),
			createCreateFieldsProperty('integracao'),
			createCreateFieldsProperty('usuario'),
			// Campos de atualização dinâmicos para cada recurso
			createUpdateFieldsProperty('lead'),
			createUpdateFieldsProperty('property'),
			createUpdateFieldsProperty('contact'),
			createUpdateFieldsProperty('contrato'),
			createUpdateFieldsProperty('financeiro'),
			createUpdateFieldsProperty('locacao'),
			createUpdateFieldsProperty('documento'),
			createUpdateFieldsProperty('tarefa'),
			createUpdateFieldsProperty('agenda'),
			createUpdateFieldsProperty('evento'),
			createUpdateFieldsProperty('integracao'),
			createUpdateFieldsProperty('usuario'),
			// Paginação com cursor (formato da API Imobzi)
			{
				displayName: 'Cursor',
				name: 'cursor',
				type: 'string',
				default: '',
				description: 'Cursor received from previous request for pagination',
				displayOptions: {
					show: {
						operation: ['getAll'],
					},
				},
			},
			{
				displayName: 'Order',
				name: 'order',
				type: 'options',
				options: [
					{ name: 'Ascending', value: 'asc' },
					{ name: 'Descending', value: 'desc' },
				],
				default: 'desc',
				description: 'Order direction',
				displayOptions: {
					show: {
						operation: ['getAll'],
					},
				},
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		// Função auxiliar para construir query string a partir de filtros
		const buildQueryFromFilters = (filters: IDataObject): IDataObject => {
			const query: IDataObject = {};
			
			if (filters && filters.filter && Array.isArray(filters.filter)) {
				filters.filter.forEach((filter: any) => {
					if (filter.field && filter.operator && filter.value !== undefined) {
						// Formato da API Imobzi: field__operator=value
						const filterKey = `${filter.field}__${filter.operator}`;
						query[filterKey] = filter.value;
					}
				});
			}
			
			return query;
		};

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const resource = this.getNodeParameter('resource', itemIndex) as string;
				const operation = this.getNodeParameter('operation', itemIndex) as string;
				const endpoint = resourceEndpoint[resource];
				
				if (!endpoint) {
					throw new NodeOperationError(this.getNode(), `Recurso "${resource}" não suportado!`);
				}

				let response: any;

				switch (operation) {
					case 'getAll': {
						const filters = this.getNodeParameter('filters', itemIndex, {}) as IDataObject;
						const quickSearch = this.getNodeParameter('quickSearch', itemIndex, {}) as IDataObject;
						const cursor = this.getNodeParameter('cursor', itemIndex, '') as string;
						const order = this.getNodeParameter('order', itemIndex, 'desc') as string;
						
						const qs: IDataObject = buildQueryFromFilters(filters);
						
						// Adicionar cursor para paginação
						if (cursor) {
							qs.cursor = cursor;
						}
						
						// Adicionar order
						if (order) {
							qs.order = order;
						}
						
						// Adicionar busca rápida para Contacts/Leads
						if ((resource === 'contact' || resource === 'lead') && quickSearch) {
							if (quickSearch.email) qs.email = quickSearch.email;
							if (quickSearch.phone) qs.phone_number = quickSearch.phone;
							if (quickSearch.cpf) qs.cpf = quickSearch.cpf;
							if (quickSearch.name) qs.search_text = quickSearch.name;
							
							// Se tiver busca rápida, usar endpoint de busca
							if (Object.keys(quickSearch).length > 0) {
								response = await this.helpers.requestWithAuthentication.call(
									this,
									'imobziApi',
									{
										method: 'GET',
										url: 'https://api.imobzi.app/v1/contacts/search',
										qs,
									},
								);
								break;
							}
						}
						
						// Adicionar busca rápida para Properties
						if (resource === 'property' && quickSearch && quickSearch.name) {
							qs.search_text = quickSearch.name;
						}

						response = await this.helpers.requestWithAuthentication.call(
							this,
							'imobziApi',
							{
								method: 'GET',
								url: `https://api.imobzi.app/${endpoint}`,
								qs,
							},
						);
						break;
					}
					case 'get': {
						const searchBy = this.getNodeParameter('searchBy', itemIndex, 'id') as string;
						const searchValue = this.getNodeParameter('id', itemIndex) as string;
						
						// Busca por ID (padrão)
						if (searchBy === 'id') {
						response = await this.helpers.requestWithAuthentication.call(
							this,
							'imobziApi',
							{
								method: 'GET',
									url: `https://api.imobzi.app/${endpoint}/${searchValue}`,
								},
							);
						}
						// Busca por código
						else if (searchBy === 'code') {
							if (resource === 'lead') {
								response = await this.helpers.requestWithAuthentication.call(
									this,
									'imobziApi',
									{
										method: 'GET',
										url: `https://api.imobzi.app/v1/contacts/code/${searchValue}`,
							},
						);
							} else if (resource === 'contact') {
								response = await this.helpers.requestWithAuthentication.call(
									this,
									'imobziApi',
									{
										method: 'GET',
										url: `https://api.imobzi.app/v1/contacts/code/${searchValue}`,
									},
								);
							} else if (resource === 'property') {
								response = await this.helpers.requestWithAuthentication.call(
									this,
									'imobziApi',
									{
										method: 'GET',
										url: `https://api.imobzi.app/v1/properties/code/${searchValue}`,
									},
								);
							} else if (resource === 'contrato') {
								response = await this.helpers.requestWithAuthentication.call(
									this,
									'imobziApi',
									{
										method: 'GET',
										url: `https://api.imobzi.app/v1/contracts/code/${searchValue}`,
									},
								);
							} else if (resource === 'locacao') {
								// Locação usa leases, verificar se tem endpoint de código
								response = await this.helpers.requestWithAuthentication.call(
									this,
									'imobziApi',
									{
										method: 'GET',
										url: `https://api.imobzi.app/v1/leases/code/${searchValue}`,
									},
								);
							}
						}
						// Busca por email, telefone, CPF (Contacts/Leads)
						else if ((searchBy === 'email' || searchBy === 'phone' || searchBy === 'cpf') && 
						         (resource === 'contact' || resource === 'lead')) {
							const qs: IDataObject = {};
							if (searchBy === 'email') qs.email = searchValue;
							if (searchBy === 'phone') qs.phone_number = searchValue;
							if (searchBy === 'cpf') qs.cpf = searchValue;
							
							response = await this.helpers.requestWithAuthentication.call(
								this,
								'imobziApi',
								{
									method: 'GET',
									url: 'https://api.imobzi.app/v1/contact/exists',
									qs: qs,
								},
							);
						}
						// Busca por nome (usa search)
						else if (searchBy === 'name') {
							if (resource === 'contact' || resource === 'lead') {
								response = await this.helpers.requestWithAuthentication.call(
									this,
									'imobziApi',
									{
										method: 'GET',
										url: 'https://api.imobzi.app/v1/contacts/search',
										qs: { search_text: searchValue },
									},
								);
								// Retornar primeiro resultado se houver
								if (response.data && Array.isArray(response.data) && response.data.length > 0) {
									response = { data: response.data[0] };
								}
							} else if (resource === 'property') {
								response = await this.helpers.requestWithAuthentication.call(
									this,
									'imobziApi',
									{
										method: 'GET',
										url: 'https://api.imobzi.app/v1/properties',
										qs: { search_text: searchValue },
									},
								);
								// Retornar primeiro resultado se houver
								if (response.data && Array.isArray(response.data) && response.data.length > 0) {
									response = { data: response.data[0] };
								}
							}
						}
						break;
					}
					case 'create': {
						const body = this.getNodeParameter('createFields', itemIndex) as IDataObject;
						response = await this.helpers.requestWithAuthentication.call(
							this,
							'imobziApi',
							{
								method: 'POST',
								url: `https://api.imobzi.app/${endpoint}`,
								body: Object.keys(body).length > 0 ? body : undefined,
							},
						);
						break;
					}
					case 'update': {
						const id = this.getNodeParameter('id', itemIndex) as string;
						const body = this.getNodeParameter('updateFields', itemIndex) as IDataObject;
						response = await this.helpers.requestWithAuthentication.call(
							this,
							'imobziApi',
							{
								method: 'PUT',
								url: `https://api.imobzi.app/${endpoint}/${id}`,
								body: Object.keys(body).length > 0 ? body : undefined,
							},
						);
						break;
					}
					case 'delete': {
						const id = this.getNodeParameter('id', itemIndex) as string;
						response = await this.helpers.requestWithAuthentication.call(
							this,
							'imobziApi',
							{
								method: 'DELETE',
								url: `https://api.imobzi.app/${endpoint}/${id}`,
							},
						);
						break;
					}
					default:
						throw new NodeOperationError(this.getNode(), `Operação "${operation}" não suportada!`);
				}

				// Tratar resposta da API (3 tipos possíveis)
				if (!response) {
					returnData.push({ json: { message: 'Resposta vazia da API' } });
					continue;
				}

				const responseKey = resourceResponseKey[resource];
				
				// TIPO 1: Resposta é array direto (users, pipelines, integrations, webhooks)
				if (Array.isArray(response)) {
					if (response.length === 0) {
						returnData.push({ json: { message: 'Nenhum resultado encontrado' } });
					} else {
						response.forEach((item: any) => {
							returnData.push({ json: item });
						});
					}
				}
				// TIPO 2: Resposta tem campo específico do recurso (properties, contacts, etc)
				else if (operation === 'getAll' && responseKey && response[responseKey] !== undefined) {
					const jsonData = response[responseKey];
					
					// Metadados de paginação
					const metadata: IDataObject = {};
					if (response.cursor) metadata.cursor = response.cursor;
					if (response.count !== undefined) metadata.total_count = response.count;
					if (response.total !== undefined) metadata.total = response.total;
					if (response.database) metadata.database = response.database;
					
					if (Array.isArray(jsonData)) {
						if (jsonData.length === 0) {
							returnData.push({ 
								json: { 
									message: 'Nenhum resultado encontrado',
									...metadata 
								} 
							});
						} else {
							jsonData.forEach((item: any, index: number) => {
								// Adicionar metadados apenas no primeiro item
								if (index === 0 && Object.keys(metadata).length > 0) {
									returnData.push({ json: { ...item, _metadata: metadata } });
								} else {
									returnData.push({ json: item });
								}
							});
						}
					} else {
						returnData.push({ json: { ...jsonData, _metadata: metadata } });
					}
				}
				// TIPO 3: Resposta tem 'data' (alguns endpoints específicos)
				else if (response.data !== undefined) {
					const jsonData = response.data;
					if (Array.isArray(jsonData)) {
						if (jsonData.length === 0) {
							returnData.push({ json: { message: 'Nenhum resultado encontrado' } });
						} else {
							jsonData.forEach((item: any) => returnData.push({ json: item }));
						}
					} else {
						returnData.push({ json: jsonData });
					}
				}
				// FALLBACK: Retornar resposta inteira (para deals e outros casos especiais)
				else {
					returnData.push({ json: response });
				}
			} catch (error: any) {
				if (this.continueOnFail()) {
					returnData.push({ 
						json: { 
							error: error.message,
							errorDetails: error.response?.data || error.description || 'Erro desconhecido',
							statusCode: error.response?.status || error.httpCode || 'N/A'
						}, 
						pairedItem: itemIndex 
					});
				} else {
					throw new NodeOperationError(
						this.getNode(), 
						`Erro ao executar operação: ${error.message}. Detalhes: ${JSON.stringify(error.response?.data || error.description || 'Sem detalhes')}`,
						{ itemIndex }
					);
				}
			}
		}

		return [returnData];
	}
} 