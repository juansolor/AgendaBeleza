import React, { useState } from 'react';
import { useSchedules } from '../../hooks/useSchedules';
import { useEmployees } from '../../hooks/useEmployees';
import { useServices } from '../../hooks/useServices';

const ScheduleManagement = () => {
  const { horarios, loading: schedulesLoading, error: schedulesError, addSchedule, deleteSchedule } = useSchedules();
  const { profissionais } = useEmployees();
  const { servicos } = useServices();

  const [novoHorario, setNovoHorario] = useState({ profissionalId: '', servicoId: '', hora: '', horaFinal: '' });
  const [diasSeleccionados, setDiasSeleccionados] = useState([]);
  const [horariosLocais, setHorariosLocais] = useState([]);
  const [feedback, setFeedback] = useState({ message: '', type: '' });

  const diasSemana = [
    { value: 'Lunes', label: 'Segunda' },
    { value: 'Martes', label: 'Terça' },
    { value: 'Miércoles', label: 'Quarta' },
    { value: 'Jueves', label: 'Quinta' },
    { value: 'Viernes', label: 'Sexta' },
    { value: 'Sábado', label: 'Sábado' },
    { value: 'Domingo', label: 'Domingo' },
  ];

  const handleAddHorarioLocal = (e) => {
    e.preventDefault();
    diasSeleccionados.forEach(dia => {
      setHorariosLocais(prev => [...prev, {
        ...novoHorario,
        dia,
        id: Date.now() + Math.random()
      }]);
    });
    setNovoHorario({ profissionalId: '', servicoId: '', hora: '', horaFinal: '' });
    setDiasSeleccionados([]);
  };

  const handleGuardarHorarios = async () => {
    try {
      for (const horario of horariosLocais) {
        await addSchedule(horario);
      }
      setHorariosLocais([]);
      setFeedback({ message: 'Horarios guardados correctamente', type: 'success' });
    } catch {
      setFeedback({ message: 'Error al guardar horarios', type: 'error' });
    }
  };

  const handleDeleteHorario = async (id) => {
    const result = await deleteSchedule(id);
    if (result.success) {
      setFeedback({ message: 'Horario eliminado correctamente', type: 'success' });
    } else {
      setFeedback({ message: result.error || 'Error al eliminar horario', type: 'error' });
    }
  };

  const handleEditHorario = (horario) => {
    setNovoHorario({
      profissionalId: horario.profissionalId,
      servicoId: horario.servicoId,
      hora: horario.hora,
      horaFinal: horario.horaFinal
    });
    setDiasSeleccionados([horario.dia]);
    setHorariosLocais(horariosLocais.filter(h => h.id !== horario.id));
  };

  if (schedulesLoading) return <div>Cargando horarios...</div>;
  if (schedulesError) return <div>Error: {schedulesError}</div>;

  return (
    <div className="schedule-management">
      <h2>Registrar Horário</h2>

      {feedback.message && (
        <div className={`alert ${feedback.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
          {feedback.message}
        </div>
      )}

      <form onSubmit={handleAddHorarioLocal} className="admin-form">
        <select
          value={novoHorario.profissionalId}
          onChange={e => setNovoHorario({ ...novoHorario, profissionalId: e.target.value })}
          required
        >
          <option value="">Seleciona um empregado</option>
          {profissionais.map(prof => (
            <option key={prof.id} value={prof.id}>{prof.nome}</option>
          ))}
        </select>
        <select
          value={novoHorario.servicoId}
          onChange={e => setNovoHorario({ ...novoHorario, servicoId: e.target.value })}
          required
        >
          <option value="">Seleciona um serviço</option>
          {servicos.map(servico => (
            <option key={servico.id} value={servico.id}>{servico.nome}</option>
          ))}
        </select>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', margin: '8px 0' }}>
          {diasSemana.map(dia => (
            <label key={dia.value} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <input
                type="checkbox"
                checked={diasSeleccionados.includes(dia.value)}
                onChange={e => {
                  if (e.target.checked) {
                    setDiasSeleccionados([...diasSeleccionados, dia.value]);
                  } else {
                    setDiasSeleccionados(diasSeleccionados.filter(d => d !== dia.value));
                  }
                }}
              />
              {dia.label}
            </label>
          ))}
        </div>
        <input
          type="time"
          placeholder="Hora inicio"
          value={novoHorario.hora}
          onChange={e => setNovoHorario({ ...novoHorario, hora: e.target.value })}
          required
        />
        <input
          type="time"
          placeholder="Hora final"
          value={novoHorario.horaFinal}
          onChange={e => setNovoHorario({ ...novoHorario, horaFinal: e.target.value })}
          required
        />
        <button type="submit" className="btn btn-success">Adicionar à lista</button>
      </form>

      {horariosLocais.length > 0 && (
        <div style={{ margin: '12px 0' }}>
          <h4>Horários a registrar:</h4>
          <ul>
            {horariosLocais.map((h) => (
              <li key={h.id}>
                {diasSemana.find(d => d.value === h.dia)?.label || h.dia} - {h.hora} a {h.horaFinal}{' '}
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => setHorariosLocais(horariosLocais.filter(x => x.id !== h.id))}
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
          <button className="btn btn-primary" onClick={handleGuardarHorarios}>
            Salvar todos
          </button>
        </div>
      )}

      <h3>Horários registrados</h3>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Empregado</th>
            <th>Serviços</th>
            <th>Dia</th>
            <th>Hora inicio</th>
            <th>Hora final</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {horarios.map(h => (
            <tr key={h.id}>
              <td>{profissionais.find(p => p.id === h.profissionalId)?.nome || h.profissionalId}</td>
              <td>{servicos.find(s => s.id === h.servicoId)?.nome || h.servicoId}</td>
              <td>{h.dia}</td>
              <td>{h.hora}</td>
              <td>{h.horaFinal}</td>
              <td>
                <button onClick={() => handleEditHorario(h)}>Editar</button>
                <button onClick={() => handleDeleteHorario(h.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ScheduleManagement;
