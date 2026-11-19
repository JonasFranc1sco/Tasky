# Firestore — Estrutura do banco

Projeto: `tasky-60a18` · Banco: `(default)` · Local: `southamerica-east1` (São Paulo)

Tipos em `src/types/company.ts` e `src/types/chat.ts`.

## `users/{uid}`

Perfil de cada pessoa. O ID do documento é o `uid` do Firebase Authentication.

| Campo | Tipo | Descrição |
|---|---|---|
| `id`, `uid` | string | `uid` do usuário no Authentication |
| `companyId` | string | ID da empresa em `companies` |
| `companyName` | string | Nome da empresa (cópia para exibição) |
| `name`, `email` | string | Nome e e-mail de login |
| `jobTitle`, `sector` | string | Cargo e setor |
| `role` | `"admin"` \| `"worker"` | Perfil de acesso |
| `status` | `"active"` \| `"pending"` | Vínculo com a empresa |
| `employeeCode` | string | Ex.: `#ADM-0001`, `#EMP-1234` |
| `pendingTasks`, `completedTasks` | number | Contadores de tarefas |
| `createdAt`, `updatedAt` | timestamp | |

## `companies/{companyId}`

Criada no cadastro da empresa (`CompanyService.registerCompanyWithAdmin`).

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | string | ID do documento |
| `companyName`, `legalName` | string | Nome fantasia e razão social |
| `taxId` / `formattedTaxId` | string | CNPJ só dígitos / com máscara |
| `phone`, `industry` | string | Telefone e ramo |
| `ownerId` | string | `uid` do admin que criou |
| `inviteCode` | string | Código geral de convite da empresa |
| `createdAt`, `updatedAt` | timestamp | |

## `invites/{inviteId}`

Convites individuais criados pelo admin (`TeamService.createEmployeeInvite`).

| Campo | Tipo | Descrição |
|---|---|---|
| `code` | string | Código usado em `/join?code=...` |
| `companyId`, `companyName` | string | Empresa do convite |
| `name`, `email`, `jobTitle`, `sector` | string | Dados do convidado |
| `role` | `"admin"` \| `"worker"` | Perfil que o convidado recebe |
| `status` | `"pending"` \| `"accepted"` | |
| `createdByUid` / `acceptedByUid` | string | Quem criou / quem aceitou |
| `createdAt` / `acceptedAt` | timestamp | |

## `conversations/{conversationId}` e `conversations/{id}/messages/{messageId}`

Mini chat entre membros da mesma empresa (`ChatService`). A conversa guarda
`companyId`, `participants` (2 uids), `participantDetails`, `lastMessage*` e
`unreadCounts`. Cada mensagem guarda `senderId`, `senderName`, `content`,
`createdAt` e `readBy`.

## Como os dados se ligam

```text
users/{uid}.companyId        ──►  companies/{id}
companies/{id}.ownerId       ──►  users/{uid}
invites/{id}.companyId       ──►  companies/{id}
conversations/{id}.companyId ──►  companies/{id}
```

## Regras de segurança

Arquivo versionado: [`firestore.rules`](../firestore.rules). Para aplicar, copie o
conteúdo em Console → Firestore → Regras → **Publicar** (ou `firebase deploy --only firestore:rules`).

| Coleção | Leitura | Escrita |
|---|---|---|
| `users` | Próprio perfil e membros da mesma empresa | Próprio usuário só edita `name`, `jobTitle`, `sector`, `companyName`; admin edita e remove membros da empresa |
| `companies` | Membros da empresa (busca por código com `limit(1)`) | Criada pelo admin no cadastro; só admin edita |
| `invites` | Admin/membros da empresa e o próprio convidado (busca por código com `limit(5)`) | Admin cria, edita e remove; convidado só marca como aceito |
| `conversations` / `messages` | Só os 2 participantes | Participantes da mesma empresa; mensagem só com `senderId` próprio |

Regras de cadastro em `users`:
- `role: "admin"` só para empresa **nova** (cadastro) ou com convite de admin válido (`inviteId`).
- `role: "worker"` só para empresa **existente**.
- Ninguém altera o próprio `role`, `companyId` ou `status`.

Limitações conhecidas:
- A busca por código em `/join` exige permitir listagem de `companies` e `invites`
  com limite pequeno a qualquer usuário logado. Uma coleção separada só para os
  códigos eliminaria isso.
- Quem tem o código geral da empresa entra como `worker` (comportamento esperado do convite geral).
