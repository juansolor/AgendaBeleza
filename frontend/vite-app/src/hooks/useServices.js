import { useState, useEffect } from 'react';

export const useServices = () => {
  const [servicos, setServicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/servicos');
      if (!response.ok) throw new Error('Error al cargar servicios');
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        setServicos(data);
      } else {
        // Si no hay servicios, crear algunos por defecto
        await createDefaultServices();
      }
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultServices = async () => {
    try {
      // Obtener profesionales para crear servicios por defecto
      const profResponse = await fetch('http://localhost:3000/profissionais');
      const profissionais = await profResponse.json();
      const especialidadesUnicas = [...new Set(profissionais.map(p => p.especialidade))];
      const tipoId = 1;

      const defaultServicos = especialidadesUnicas.map((esp, idx) => ({
        nome: esp,
        duracao: 30 + idx * 10,
        preco: 50 + idx * 20,
        tipoId,
        ativo: true
      }));

      for (const serv of defaultServicos) {
        await fetch('http://localhost:3000/servicos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(serv)
        });
      }
      await fetchServices(); // Recargar
    } catch (err) {
      console.error('Error creando servicios por defecto:', err);
    }
  };

  const addService = async (serviceData) => {
    try {
      const response = await fetch('http://localhost:3000/servicos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serviceData)
      });
      if (!response.ok) throw new Error('Error al agregar servicio');
      await fetchServices();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const updateService = async (id, serviceData) => {
    try {
      const response = await fetch(`http://localhost:3000/servicos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serviceData)
      });
      if (!response.ok) throw new Error('Error al actualizar servicio');
      await fetchServices();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const deleteService = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/servicos/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Error al eliminar servicio');
      await fetchServices();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    fetchServices();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    servicos,
    loading,
    error,
    fetchServices,
    addService,
    updateService,
    deleteService
  };
};
