# Tasky

Aplicativo mobile de gestão de tarefas e equipes. Permite que gestores acompanhem o andamento das entregas, e que colaboradores visualizem suas próprias tarefas diárias.

## Stack

- [Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/) + React Native
- TypeScript
- Expo Router (rotas baseadas em arquivos)
- NativeWind / Tailwind CSS
- React Native Paper

## Como executar

Pré-requisito: [Node.js](https://nodejs.org) instalado.

```bash
# Instalar dependências
pnpm install

# Iniciar o app (menu interativo do Expo)
pnpm start

# Abrir direto em plataformas específicas
pnpm android
pnpm ios
pnpm web

# Rodar o linter
pnpm lint
```

## Estrutura

```
src/
├── app/                # Rotas do app (expo-router)
│   ├── (auth)/         # Tela de login e cadastro
│   └── (app)/
│       ├── (gestor)/   # Área do gestor (painel, equipe, tarefas)
│       └── (worker)/   # Área do colaborador (tarefas, perfil)
├── components/         # Componentes reutilizáveis
├── constants/          # Tema, dados e validações
└── hooks/              # Contextos e hooks globais
```

## Contas de demonstração

A tela de login já vem com contas demo pré-preenchidas:

| Perfil | Email |
| --- | --- |
| Admin (Gestor) | `joaopedro@...` |
| Operação (Colaborador) | `jonas@...` |
