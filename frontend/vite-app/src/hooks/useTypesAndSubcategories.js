import { useState, useEffect } from 'react';

export const useTypes = () => {
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTypes = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/tipos');
      if (!response.ok) throw new Error('Error al cargar tipos');
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        setTipos(data);
      } else {
        // Crear tipos por defecto
        await createDefaultTypes();
      }
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultTypes = async () => {
    try {
      const tiposDefault = [
        { nome: 'Presencial' },
        { nome: 'Domicilio' }
      ];

      for (const tipo of tiposDefault) {
        await fetch('http://localhost:3000/tipos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(tipo)
        });
      }
      await fetchTypes();
    } catch (err) {
      console.error('Error creando tipos por defecto:', err);
    }
  };

  useEffect(() => {
    fetchTypes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    tipos,
    loading,
    error,
    fetchTypes
  };
};

export const useSubcategories = () => {
  const [subcategorias, setSubcategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSubcategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/subcategorias');
      if (!response.ok) throw new Error('Error al cargar subcategorías');
      const data = await response.json();
      setSubcategorias(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addSubcategory = async (subcategoryData) => {
    try {
      const response = await fetch('http://localhost:3000/subcategorias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subcategoryData)
      });
      if (!response.ok) throw new Error('Error al agregar subcategoría');
      await fetchSubcategories();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const updateSubcategory = async (id, subcategoryData) => {
    try {
      const response = await fetch(`http://localhost:3000/subcategorias/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subcategoryData)
      });
      if (!response.ok) throw new Error('Error al actualizar subcategoría');
      await fetchSubcategories();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const deleteSubcategory = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/subcategorias/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Error al eliminar subcategoría');
      setSubcategorias(prev => prev.filter(s => s.id !== id));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    fetchSubcategories();
  }, []);

  return {
    subcategorias,
    loading,
    error,
    fetchSubcategories,
    addSubcategory,
    updateSubcategory,
    deleteSubcategory
  };
};
