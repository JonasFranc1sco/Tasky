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

## `companies/{companyId}/tasks/{taskId}` e `.../messages/{messageId}`

Tarefas delegadas ficam dentro da empresa. O documento guarda título, descrição,
prazo, setor, prioridade, `assigneeUid`, `assigneeName`, status, `createdByUid`,
`createdAt`, `completedAt` e `updatedAt`. A tela do gestor acompanha a coleção da
empresa; a fila do colaborador consulta apenas documentos cujo `assigneeUid` é
seu UID.

As mensagens de uma tarefa ficam em sua subcoleção `messages`, com autor, cargo,
UID do autor, conteúdo e `createdAt`. A lista de mensagens é sincronizada em
tempo real sem aumentar o documento da tarefa.

## Como os dados se ligam

```text
users/{uid}.companyId        ──►  companies/{id}
companies/{id}.ownerId       ──►  users/{uid}
invites/{id}.companyId       ──►  companies/{id}
conversations/{id}.companyId ──►  companies/{id}
companies/{id}/tasks/{taskId} ──► responsável em users/{uid}
```

## Regras de segurança

O arquivo local `firestore.rules` contém as regras ativas copiadas do projeto
`tasky-60a18` e as permissões para tasks e mensagens. Essas regras já estão
publicadas no Firestore do projeto.

Gestores ativos podem criar tarefas, consultar as tarefas da empresa e alterar
apenas status e datas de conclusão. Colaboradores ativos podem consultar e
concluir apenas tarefas atribuídas ao próprio UID; por isso, a consulta do app
filtra por `assigneeUid`. Mensagens são legíveis pelo gestor e pelo responsável
da tarefa, mas apenas gestores podem criá-las. Exclusão de tarefas e edição ou
exclusão de mensagens ficam bloqueadas.
