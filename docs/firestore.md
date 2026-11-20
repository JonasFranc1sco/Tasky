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
companies/{id}/tasks/{taskId}.assigneeUid ──► users/{uid}
```

## `companies/{companyId}/tasks/{taskId}`

O Firestore passa a exibir a subcoleção `tasks` no documento da empresa quando a primeira delegação é salva pelo gestor.

O caminho identifica a empresa. Cada tarefa guarda quem delegou (`createdByUid`), quem recebeu (`assigneeUid`, `assigneeName`), título (`name`), descrição, setor, prazo em texto, prioridade (`alta`, `media`, `baixa`) e categoria. Os horários de criação, atualização, conclusão e arquivamento são gravados pelo servidor. O gestor consulta as tarefas da empresa. O colaborador filtra a mesma subcoleção pelo próprio `assigneeUid`.

| Ação | Quem executa no app | Campos atualizados |
| --- | --- | --- |
| Delegar | Gestor da empresa | `status: pending` |
| Concluir | Responsável | `status: completed` e `completedAt` |
| Validar e arquivar | Gestor da empresa | `archivedAt`, com `status: completed` |
| Reabrir | Gestor da empresa | `status: pending`, limpa `completedAt` e `archivedAt` quando preenchido |

Quando uma tarefa pendente tem `updatedAt` posterior a `createdAt`, o app mostra a data de reabertura.

### Observações

A subcoleção `companies/{companyId}/tasks/{taskId}/messages/{messageId}` guarda autor, cargo, conteúdo e horário. Gestores da empresa podem escrever. Gestores e o responsável podem ler.

## Regras de segurança

O arquivo [firestore.rules](../firestore.rules) contém as regras completas para publicar em Firestore → Regras, incluindo usuários, empresas, convites, chat e tarefas. As regras de tarefas consultam `users/{uid}`, onde o ID do documento deve corresponder ao UID do Authentication.
