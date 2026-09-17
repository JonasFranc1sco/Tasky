export type Assignee = { name: string };

export type Task = {
    id: string;
    name: string;
    description: string;
    dueDate: string;
    assignee: Assignee;
    completedAt: string | null;
    priority?: 'alta' | 'media' | 'baixa';
    sector?: string;
    checklist?: { done: number; total: number; location: string };
    reopened?: boolean;
    reopenReason?: string;
};

export const CURRENT_EMPLOYEE = 'Jonas Francisco';
export const CURRENT_COMPANY = 'Dubai Software House';

export const MOCK_TASKS: Task[] = [
  {
    id: 't1',
    name: 'Code Review do PR #482 — Módulo de Pagamento',
    description: 'Revisar os arquivos alterados no pull request, validar a cobertura de testes e aprovar ou solicitar correções.',
    sector: 'Backend',
    dueDate: 'Hoje, 17:00',
    assignee: { name: CURRENT_EMPLOYEE },
    priority: 'media',
    checklist: { done: 0, total: 3, location: 'Branch develop' },
    completedAt: null,
  },
  {
    id: 't2',
    name: 'Correção do Bug de Duplicação de Tarefas',
    description: 'Investigar o bug reportado no Sprint 14 onde tarefas duplicam ao sincronizar no modo lento de conexão.',
    sector: 'Frontend',
    dueDate: 'Amanhã, 10:00',
    assignee: { name: CURRENT_EMPLOYEE },
    priority: 'alta',
    completedAt: null,
  },
  {
    id: 't3',
    name: 'Organizar Filas do CI/CD',
    description: 'Reordenar os jobs do pipeline e limpar builds órfãos no runner da empresa.',
    sector: 'DevOps',
    dueDate: 'Ontem',
    assignee: { name: CURRENT_EMPLOYEE },
    priority: 'media',
    reopened: true,
    reopenReason: 'Verificar a ordem dos jobs de deploy antes de finalizar.',
    completedAt: null,
  },
  {
    id: 't4',
    name: 'Atualizar Pacotes de Segurança',
    description: 'Rodar o audit de dependências e atualizar os pacotes com vulnerabilidades reportadas.',
    sector: 'Segurança',
    dueDate: 'Hoje, 07:00',
    assignee: { name: CURRENT_EMPLOYEE },
    priority: 'media',
    completedAt: '2026-09-16T07:45:00.000Z',
  },
  {
    id: 't5',
    name: 'Documentar Endpoint de Autenticação',
    description: 'Escrever a documentação técnica da nova rota de refresh token no Swagger.',
    sector: 'Documentação',
    dueDate: 'Hoje, 08:00',
    assignee: { name: CURRENT_EMPLOYEE },
    priority: 'media',
    completedAt: '2026-09-16T08:30:00.000Z',
  },
  {
    id: 't6',
    name: 'Deploy da Release 2.4.0 em Staging',
    description: 'Gerar a build de staging, aplicar as migrations e validar os smoke tests.',
    sector: 'DevOps',
    dueDate: 'Ontem, 06:30',
    assignee: { name: CURRENT_EMPLOYEE },
    priority: 'baixa',
    completedAt: '2026-09-15T12:00:00.000Z',
  },
];