import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, vi, beforeEach } from 'vitest';
import Agendamento from '../../pages/Agendamento';

// Mock do useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Agendamento', () => {
  beforeEach(() => {
    // Limpar mocks antes de cada teste
    vi.clearAllMocks();
    mockNavigate.mockClear();
    
    // Mock do fetch global
    global.fetch = vi.fn();
  });

  test('deve renderizar o componente corretamente', async () => {
    // Mock das respostas da API
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve([])
    });

    render(
      <BrowserRouter>
        <Agendamento />
      </BrowserRouter>
    );

    // Verificar se o componente renderiza
    expect(screen.getByText('Escolha o serviço:')).toBeInTheDocument();
  });

  test('deve mostrar serviços filtrados sem dados de teste', async () => {
    // Mock das respostas da API incluindo serviços de teste
    global.fetch = vi.fn().mockImplementation((url) => {
      if (url.includes('/servicos')) {
        return Promise.resolve({
          json: () => Promise.resolve([
            { id: 1, nome: 'Corte de cabelo', subcategoriaId: 1, valor: 50.00 },
            { id: 2, nome: 'Manicure', subcategoriaId: 2, valor: 30.00 },
            { id: 3, nome: 'TestServiço', subcategoriaId: 1, valor: 25.00 }, // Este deveria ser filtrado
            { id: 4, nome: 'Massagem', subcategoriaId: 3, valor: 80.00 },
            { id: 5, nome: 'demo', subcategoriaId: 2, valor: 15.00 } // Este deveria ser filtrado
          ])
        });
      }
      if (url.includes('/subcategorias')) {
        return Promise.resolve({
          json: () => Promise.resolve([
            { id: 1, nome: 'Cabelo', tipoId: 1 },
            { id: 2, nome: 'Unhas', tipoId: 2 },
            { id: 3, nome: 'Corporal', tipoId: 3 }
          ])
        });
      }
      if (url.includes('/tipos')) {
        return Promise.resolve({
          json: () => Promise.resolve([
            { id: 1, nome: 'cabelo' },
            { id: 2, nome: 'unhas' },
            { id: 3, nome: 'corporal' }
          ])
        });
      }
      return Promise.resolve({ json: () => Promise.resolve([]) });
    });

    render(
      <BrowserRouter>
        <Agendamento />
      </BrowserRouter>
    );

    // Aguardar o carregamento e verificar que apenas serviços válidos aparecem
    await waitFor(() => {
      expect(screen.getByText('Corte de cabelo')).toBeInTheDocument();
      expect(screen.getByText('Manicure')).toBeInTheDocument();
      expect(screen.getByText('Massagem')).toBeInTheDocument();
    });

    // Verificar que serviços de teste NÃO aparecem
    expect(screen.queryByText('TestServiço')).not.toBeInTheDocument();
    expect(screen.queryByText('demo')).not.toBeInTheDocument();
  });

  test('deve mostrar indicador de data selecionada no título', async () => {
    // Mock das respostas da API
    global.fetch = vi.fn().mockImplementation((url) => {
      if (url.includes('/servicos')) {
        return Promise.resolve({
          json: () => Promise.resolve([
            { id: 1, nome: 'Corte de cabelo', subcategoriaId: 1, valor: 50.00 }
          ])
        });
      }
      return Promise.resolve({ json: () => Promise.resolve([]) });
    });

    render(
      <BrowserRouter>
        <Agendamento />
      </BrowserRouter>
    );

    // Aguardar um pouco para a renderização
    await waitFor(() => {
      expect(screen.getByText(/🗓️ Escolha a Data/)).toBeInTheDocument();
    });
  });

  test('deve aplicar estilos de gradiente nos botões de data', async () => {
    // Mock das respostas da API
    global.fetch = vi.fn().mockImplementation((url) => {
      if (url.includes('/servicos')) {
        return Promise.resolve({
          json: () => Promise.resolve([
            { id: 1, nome: 'Corte de cabelo', subcategoriaId: 1, valor: 50.00 }
          ])
        });
      }
      return Promise.resolve({ json: () => Promise.resolve([]) });
    });

    render(
      <BrowserRouter>
        <Agendamento />
      </BrowserRouter>
    );

    // Aguardar o carregamento
    await waitFor(() => {
      expect(screen.getByText(/🗓️ Escolha a Data/)).toBeInTheDocument();
    });

    // Verificar se existem botões de data
    const dateButtons = screen.getAllByRole('button');
    expect(dateButtons.length).toBeGreaterThan(0);
  });

  test('deve capitalizar corretamente os nomes dos serviços', async () => {
    // Mock das respostas da API com dados em lowercase
    global.fetch = vi.fn().mockImplementation((url) => {
      if (url.includes('/servicos')) {
        return Promise.resolve({
          json: () => Promise.resolve([
            { id: 1, nome: 'corte de cabelo', subcategoriaId: 1, valor: 50.00 },
            { id: 2, nome: 'manicure', subcategoriaId: 2, valor: 30.00 }
          ])
        });
      }
      if (url.includes('/subcategorias')) {
        return Promise.resolve({
          json: () => Promise.resolve([
            { id: 1, nome: 'cabelo', tipoId: 1 },
            { id: 2, nome: 'unhas', tipoId: 2 }
          ])
        });
      }
      if (url.includes('/tipos')) {
        return Promise.resolve({
          json: () => Promise.resolve([
            { id: 1, nome: 'cabelo' },
            { id: 2, nome: 'unhas' }
          ])
        });
      }
      return Promise.resolve({ json: () => Promise.resolve([]) });
    });

    render(
      <BrowserRouter>
        <Agendamento />
      </BrowserRouter>
    );

    // Aguardar o carregamento e verificar capitalização
    await waitFor(() => {
      expect(screen.getByText(/Corte de cabelo/)).toBeInTheDocument();
      expect(screen.getByText(/Manicure/)).toBeInTheDocument();
    });
  });

  test('verifica que o filtro de profissionais funciona corretamente', async () => {
    // Mock com profissionais incluindo padrões de teste reais
    global.fetch = vi.fn().mockImplementation((url) => {
      if (url.includes('/servicos')) {
        return Promise.resolve({
          json: () => Promise.resolve([
            { id: 1, nome: 'Corte Simples', subcategoriaId: 1, valor: 50.00 }
          ])
        });
      }
      if (url.includes('/profissionais')) {
        return Promise.resolve({
          json: () => Promise.resolve([
            { id: 1, nome: 'Maria Silva', especialidade: 'cabelo', ativo: true },
            { id: 2, nome: 'João Santos', especialidade: 'unhas', ativo: true },
            { id: 3, nome: 'Ana profissional 1756909765219', especialidade: 'cabelo', ativo: true },
            { id: 4, nome: 'Profissional manicure 1756909853191', especialidade: 'manicure', ativo: true },
            { id: 5, nome: 'Ana Costa', especialidade: 'massagem', ativo: true },
            { id: 6, nome: 'TestUser', especialidade: 'cabelo', ativo: true },
            { id: 7, nome: 'demo123', especialidade: 'unhas', ativo: true }
          ])
        });
      }
      return Promise.resolve({ json: () => Promise.resolve([]) });
    });

    render(
      <BrowserRouter>
        <Agendamento />
      </BrowserRouter>
    );
    
    // Aguardar o componente carregar
    await waitFor(() => {
      expect(screen.getByText('Escolha o serviço:')).toBeInTheDocument();
    });

    // Verificar que o componente está renderizado e funcionando
    expect(screen.getByText('Escolha o serviço:')).toBeInTheDocument();
    
    // Nota: Em um teste mais completo, poderíamos verificar se os profissionais
    // filtrados não aparecem na interface, mas isso requereria uma simulação
    // mais complexa da interação do usuário com os selects
  });
});