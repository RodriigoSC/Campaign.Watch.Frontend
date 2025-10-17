const mockClients = [
    { id: 1, name: 'Cliente A', isActive: true, createdAt: '2023-01-10T00:00:00Z', effectiveChannels: [{ name: 'Email' }, { name: 'SMS' }] },
    { id: 2, name: 'Cliente B', isActive: true, createdAt: '2023-02-15T00:00:00Z', effectiveChannels: [{ name: 'Push' }] },
    { id: 3, name: 'Cliente C', isActive: false, createdAt: '2023-03-20T00:00:00Z', effectiveChannels: [{ name: 'Email' }] },
];

const mockApiCall = (data) => new Promise(resolve => setTimeout(() => resolve(data), 300));

export const clientService = {
  getAllClients: () => mockApiCall(mockClients),
};