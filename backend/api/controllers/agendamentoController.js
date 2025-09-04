const Agendamento = require("../models/agendamentoModel");
const Cliente = require("../models/clienteModel");
const Servico = require("../models/servicoModel");
const Tipo = require("../models/tipoModel");
const Profissional = require("../models/profissionalModel");


// GET /agendamentos
async function listarAgendamentos(req, res) {
  try {
    const { data, clienteId, profissionalId, hora } = req.query;

    const where = {};

    if (data) where.data = data;
    if (clienteId) where.clienteId = clienteId;
    if (profissionalId) where.profissionalId = profissionalId;
    if (hora) where.hora = hora;

    const agendamentos = await Agendamento.findAll({
      where,
      include: [
        {
          model: Cliente,
          attributes: ["id", "nome", "telefone"],
        },
        {
          model: Servico,
          attributes: ["id", "nome", "duracao", "preco"],
        },
        {
          model: Profissional,
          attributes: ["id", "nome", "especialidade"],
        },
      ],
    });

    res.status(200).json(agendamentos);
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error); // Log detalhado no terminal
    res.status(500).json({
      erro: error.message || String(error), // Sempre retorna a mensagem real do erro
      stack: error.stack // Inclui stack trace para facilitar debug
    });
  }
}

// GET /agendamentos/:id
async function buscarAgendamentoPorId(req, res) {
  const { id } = req.params;
  try {
    const agendamento = await Agendamento.findByPk(id, {
      include: [Cliente, Servico, Profissional],
    });
    if (!agendamento) {
      return res.status(404).json({ erro: "Agendamento não encontrado" });
    }
    res.status(200).json(agendamento);
  } catch (error) {
    res.status(500).json({
      erro:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Erro ao buscar agendamento",
    });
  }
}

// POST /agendamentos
async function criarAgendamento(req, res) {
  const { clienteId, servicoId, profissionalId, data, hora, categoria } = req.body;

  try {
    // التحقق من ساعات العمل
    const horarioAbertura = "09:00";
    const horarioFechamento = "18:00";

    if (hora < horarioAbertura || hora >= horarioFechamento) {
      return res.status(400).json({
        erro: `O salão atende das ${horarioAbertura} às ${horarioFechamento}`,
      });
    }

    // التحقق من العميل نشط
    const cliente = await Cliente.findByPk(clienteId);
    if (!cliente || !cliente.ativo) {
      return res.status(400).json({ erro: "Cliente inativo ou inexistente" });
    }

    // التحقق من الخدمة نشطة
    const servico = await Servico.findByPk(servicoId);
    if (!servico || !servico.ativo) {
      return res.status(400).json({ erro: "Serviço inativo ou inexistente" });
    }

    // التحقق من المصفف نشط
    const profissional = await Profissional.findByPk(profissionalId);
    if (!profissional || !profissional.ativo) {
      return res
        .status(400)
        .json({ erro: "Profissional inativo ou inexistente" });
    }

    // التحقق من التوافق بين نوع الخدمة واختصاص المصفف
    const tipoServico = await Tipo.findByPk(servico.tipoId);
    if (!tipoServico) {
      return res.status(400).json({ erro: "Tipo de serviço inválido" });
    }

    // Allow flexible scheduling if explicitly enabled via env var.
    const FLEXIBLE = process.env.FLEXIBLE_SCHEDULING === 'true';

    if (FLEXIBLE) {
      console.log('[AGENDAMENTO] FLEXIBLE_SCHEDULING enabled: skipping specialty validation');
    } else {
      // Validate professional's specialty against service type and category
      const normalizeString = (str) => (str || '').toLowerCase().trim();

      const profEspecialidade = normalizeString(profissional.especialidade);
      const tipoServicoNome = normalizeString(tipoServico.nome);
      const servicoNome = normalizeString(servico.nome);
      const categoriaNome = categoria ? normalizeString(categoria) : '';

      // Define related specialties (could be moved to a configuration file)
      const especialidadesRelacionadas = {
        'cabelo': ['corte', 'coloração', 'penteado', 'tratamento capilar'],
        'manicure': ['pedicure', 'unhas', 'esmaltação'],
        'maquiagem': ['design de sobrancelhas', 'maquiagem artística'],
        // Add more related specialties as needed
      };

      // Check if the professional's specialty matches or is related to the service
      const isValidSpecialty =
        // Direct matches (case-insensitive)
        profEspecialidade === tipoServicoNome ||
        profEspecialidade === servicoNome ||
        (categoria && profEspecialidade === categoriaNome) ||
        // Check related specialties
        Object.entries(especialidadesRelacionadas).some(([mainSpecialty, related]) => {
          const normalizedMainSpecialty = normalizeString(mainSpecialty);
          if (profEspecialidade === normalizedMainSpecialty) {
            return related.some(rel =>
              normalizeString(rel) === tipoServicoNome ||
              normalizeString(rel) === servicoNome
            );
          }
          if (related.some(rel => normalizeString(rel) === profEspecialidade)) {
            return normalizedMainSpecialty === tipoServicoNome ||
                   normalizedMainSpecialty === servicoNome;
          }
          return false;
        });

      if (!isValidSpecialty) {
        return res.status(400).json({
          erro: 'Profissional não corresponde à especialidade do serviço',
          detalhes: `A especialidade do profissional (${profissional.especialidade}) não é compatível com o serviço solicitado (${servico.nome}) do tipo (${tipoServico.nome})${categoria ? ` na categoria (${categoria})` : ''}. Por favor, escolha um profissional com a especialidade adequada.`
        });
      }
      console.log('[AGENDAMENTO] Validação de especialidade PASSOU');
    }

    // منع الحجز المكرر للمصفف بنفس الوقت
    const agendamentoExistente = await Agendamento.findOne({
      where: { profissionalId, data, hora },
    });

    if (agendamentoExistente) {
      return res.status(400).json({
        erro: "Já existe um agendamento para esse profissional nesse horário",
      });
    }

    // إنشاء الحجز
    const novoAgendamento = await Agendamento.create({
      clienteId,
      servicoId,
      profissionalId,
      data,
      hora,
      categoria, // guarda la categoria si viene de manicure
    });

    res.status(201).json(novoAgendamento);
  } catch (error) {
    res.status(400).json({
      erro:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Erro ao criar agendamento",
    });
  }
}

// PUT /agendamentos/:id
async function atualizarAgendamento(req, res) {
  const { id } = req.params;
  const { clienteId, servicoId, profissionalId, data, hora, categoria } = req.body;
  try {
    const agendamento = await Agendamento.findByPk(id);
    if (!agendamento) {
      return res.status(404).json({ erro: "Agendamento não encontrado" });
    }

    agendamento.clienteId = clienteId;
    agendamento.servicoId = servicoId;
    agendamento.profissionalId = profissionalId;
    agendamento.data = data;
    agendamento.hora = hora;
    agendamento.categoria = categoria;
    await agendamento.save();

    res.status(200).json(agendamento);
  } catch (error) {
    res.status(400).json({
      erro:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Erro ao atualizar agendamento",
    });
  }
}

// DELETE /agendamentos/:id
async function deletarAgendamento(req, res) {
  const { id } = req.params;
  try {
    const agendamento = await Agendamento.findByPk(id);
    if (!agendamento) {
      return res.status(404).json({ erro: "Agendamento não encontrado" });
    }

    await agendamento.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(400).json({
      erro:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Erro ao deletar agendamento",
    });
  }
}

module.exports = {
  listarAgendamentos,
  buscarAgendamentoPorId,
  criarAgendamento,
  atualizarAgendamento,
  deletarAgendamento,
};