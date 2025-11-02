// src/features/clients/hooks/useClients.js
import { useState, useEffect, useCallback } from 'react';
import { clientService } from '../../../shared/services/clientService';

/**
 * Hook customizado para gerenciar clientes
 */
export const useClients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadClients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await clientService.getAllClients();
      setClients(data || []);
    } catch (err) {
      console.error('Erro ao carregar clientes:', err);
      setError(err.message || 'Erro ao carregar clientes');
      setClients([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  const createClient = useCallback(async (clientData) => {
    try {
      const newClient = await clientService.createClient(clientData);
      setClients(prev => [...prev, newClient]);
      return { success: true, data: newClient };
    } catch (err) {
      console.error('Erro ao criar cliente:', err);
      return { success: false, error: err.message };
    }
  }, []);

  const updateClient = useCallback(async (id, clientData) => {
    try {
      await clientService.updateClient(id, clientData);
      setClients(prev => 
        prev.map(c => c.id === id ? { ...c, ...clientData } : c)
      );
      return { success: true };
    } catch (err) {
      console.error('Erro ao atualizar cliente:', err);
      return { success: false, error: err.message };
    }
  }, []);

  const deleteClient = useCallback(async (id) => {
    try {
      await clientService.deleteClient(id);
      setClients(prev => prev.filter(c => c.id !== id));
      return { success: true };
    } catch (err) {
      console.error('Erro ao deletar cliente:', err);
      return { success: false, error: err.message };
    }
  }, []);

  return {
    clients,
    loading,
    error,
    reload: loadClients,
    createClient,
    updateClient,
    deleteClient,
  };
};

export default useClients;