# Firestore — Estrutura do banco

Banco: `(default)` · Local: `southamerica-east1` (São Paulo)

## `users/{uid}`

Perfil de cada pessoa. O ID do documento é o mesmo `uid` do Firebase Authentication.

| Campo | Tipo | Descrição |
|---|---|---|
| `uid` | string | ID do usuário no Authentication |
| `name` | string | Nome completo |
| `email` | string | E-mail de login |
| `role` | `"gestor"` \| `"worker"` | Perfil de acesso |
| `companyId` | string | ID da empresa em `companies` |
| `active` | boolean | `false` bloqueia o acesso sem apagar a conta |
| `createdAt` | timestamp | Data do cadastro |

## `companies/{companyId}`

Empresa cadastrada pelo gestor na tela de cadastro. ID gerado automaticamente.

| Campo | Tipo | Descrição |
|---|---|---|
| `name` | string | Nome fantasia |
| `legalName` | string | Razão social |
| `taxId` | string | CNPJ, só dígitos |
| `phone` | string | Telefone, só dígitos |
| `industry` | string | Ramo de atuação |
| `ownerUid` | string | `uid` do gestor que criou |
| `createdAt` | timestamp | Data do cadastro |

## Como os dados se ligam

```text
users/{uid}.companyId   ──►  companies/{id}
companies/{id}.ownerUid ──►  users/{uid}
```

O cadastro (`signUp` em `src/contexts/AuthContext.tsx`) cria os dois documentos juntos, com `writeBatch`.
Colaboradores (`worker`) entram por convite. Esse fluxo ainda não foi implementado.