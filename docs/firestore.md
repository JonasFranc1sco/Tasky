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

As regras ficam no Console (Firestore → Regras). Atualmente exigem apenas usuário
autenticado (`request.auth != null`). Regras por empresa e por perfil ainda serão
definidas.
