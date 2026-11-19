import { db } from '@/config/firebase';
import type {
  ChatMessage,
  Conversation,
  ConversationParticipantInfo,
} from '@/types/chat';
import { getInitials, type EmployeeMember } from '@/types/company';
import {
  Timestamp,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  startAfter,
  updateDoc,
  where,
  writeBatch,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';

export const MESSAGES_PAGE_SIZE = 25;

export class ChatService {
  private static conversationsCol = collection(db, 'conversations');

  // Gera um ID único e determinístico para a conversa entre dois membros da mesma empresa
  static buildConversationId(
    companyId: string,
    uidA: string,
    uidB: string
  ): string {
    const [first, second] = [uidA, uidB].sort();
    return `${companyId}_${first}_${second}`;
  }

  // Converte um EmployeeMember no resumo de participante da conversa
  private static toParticipantInfo(
    member: EmployeeMember
  ): ConversationParticipantInfo {
    const uid = member.uid || member.id;
    return {
      uid,
      name: member.name,
      jobTitle: member.jobTitle,
      sector: member.sector,
      initials: member.initials || getInitials(member.name),
    };
  }

  // Busca uma conversa existente ou cria uma nova entre dois funcionários da mesma empresa
  static async getOrCreateConversation(
    currentUser: EmployeeMember,
    targetUser: EmployeeMember
  ): Promise<Conversation> {
    const currentUid = currentUser.uid || currentUser.id;
    const targetUid = targetUser.uid || targetUser.id;

    if (!currentUid || !targetUid) {
      throw new Error('Participante inválido para iniciar conversa.');
    }

    if (currentUid === targetUid) {
      throw new Error('Não é possível iniciar uma conversa consigo mesmo.');
    }

    if (currentUser.companyId !== targetUser.companyId) {
      throw new Error(
        'Somente funcionários da mesma empresa podem conversar entre si.'
      );
    }

    const conversationId = this.buildConversationId(
      currentUser.companyId,
      currentUid,
      targetUid
    );
    const convRef = doc(this.conversationsCol, conversationId);
    const existingSnap = await getDoc(convRef);

    if (existingSnap.exists()) {
      return {
        ...(existingSnap.data() as Conversation),
        id: existingSnap.id,
      };
    }

    const now = Timestamp.now();
    const newConversation: Conversation = {
      id: conversationId,
      companyId: currentUser.companyId,
      participants: [currentUid, targetUid].sort(),
      participantDetails: {
        [currentUid]: this.toParticipantInfo(currentUser),
        [targetUid]: this.toParticipantInfo(targetUser),
      },
      lastMessage: '',
      lastMessageSenderId: '',
      lastMessageAt: now,
      unreadCounts: {
        [currentUid]: 0,
        [targetUid]: 0,
      },
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(convRef, newConversation);
    return newConversation;
  }

  // Busca os dados de uma conversa específica pelo ID
  static async getConversationById(
    conversationId: string
  ): Promise<Conversation | null> {
    const snap = await getDoc(doc(this.conversationsCol, conversationId));
    if (!snap.exists()) return null;
    return { ...(snap.data() as Conversation), id: snap.id };
  }

  // Escuta em tempo real todas as conversas do usuário na empresa ordenadas pela mais recente
  static subscribeToUserConversations(
    companyId: string,
    userUid: string,
    onUpdate: (conversations: Conversation[]) => void,
    onError?: (error: Error) => void
  ): () => void {
    const q = query(
      this.conversationsCol,
      where('companyId', '==', companyId),
      where('participants', 'array-contains', userUid)
    );

    return onSnapshot(
      q,
      (snap) => {
        const list = snap.docs
          .map((d) => ({ ...(d.data() as Conversation), id: d.id }))
          .sort((a, b) => {
            const timeA = a.lastMessageAt?.toMillis?.() ?? 0;
            const timeB = b.lastMessageAt?.toMillis?.() ?? 0;
            return timeB - timeA;
          });
        onUpdate(list);
      },
      (err) => onError?.(err)
    );
  }

  // Escuta em tempo real o lote mais recente de mensagens de uma conversa
  static subscribeToLatestMessages(
    conversationId: string,
    pageSize = MESSAGES_PAGE_SIZE,
    onUpdate: (
      messages: ChatMessage[],
      lastDoc: QueryDocumentSnapshot | null
    ) => void,
    onError?: (error: Error) => void
  ): () => void {
    const messagesCol = collection(
      db,
      'conversations',
      conversationId,
      'messages'
    );
    const q = query(
      messagesCol,
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );

    return onSnapshot(
      q,
      (snap) => {
        const messages = snap.docs.map((d) => ({
          ...(d.data() as ChatMessage),
          id: d.id,
        }));
        const oldestDoc =
          snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null;
        onUpdate(messages, oldestDoc);
      },
      (err) => onError?.(err)
    );
  }

  // Carrega mensagens anteriores (paginação progressiva do histórico)
  static async loadOlderMessages(
    conversationId: string,
    lastVisibleDoc: QueryDocumentSnapshot,
    pageSize = MESSAGES_PAGE_SIZE
  ): Promise<{
    messages: ChatMessage[];
    lastDoc: QueryDocumentSnapshot | null;
  }> {
    const messagesCol = collection(
      db,
      'conversations',
      conversationId,
      'messages'
    );
    const q = query(
      messagesCol,
      orderBy('createdAt', 'desc'),
      startAfter(lastVisibleDoc),
      limit(pageSize)
    );

    const snap = await getDocs(q);
    const messages = snap.docs.map((d) => ({
      ...(d.data() as ChatMessage),
      id: d.id,
    }));
    const nextCursor =
      snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null;

    return { messages, lastDoc: nextCursor };
  }

  // Envia uma nova mensagem e atualiza a prévia e contador de não lidas da conversa
  static async sendMessage(params: {
    conversationId: string;
    companyId: string;
    senderUid: string;
    senderName: string;
    recipientUid: string;
    content: string;
  }): Promise<void> {
    const trimmed = params.content.trim();
    if (!trimmed) return;

    const now = Timestamp.now();
    const convRef = doc(this.conversationsCol, params.conversationId);
    const messagesCol = collection(convRef, 'messages');
    const messageRef = doc(messagesCol);

    const newMessage: ChatMessage = {
      id: messageRef.id,
      conversationId: params.conversationId,
      companyId: params.companyId,
      senderId: params.senderUid,
      senderName: params.senderName,
      content: trimmed,
      createdAt: now,
      readBy: [params.senderUid],
    };

    const batch = writeBatch(db);
    batch.set(messageRef, newMessage);
    batch.update(convRef, {
      lastMessage: trimmed,
      lastMessageSenderId: params.senderUid,
      lastMessageAt: now,
      updatedAt: now,
      [`unreadCounts.${params.recipientUid}`]: increment(1),
    });

    await batch.commit();
  }

  // Marca a conversa e as mensagens recentes como lidas pelo usuário atual
  static async markConversationAsRead(
    conversationId: string,
    userUid: string,
    unreadMessages: ChatMessage[] = []
  ): Promise<void> {
    const convRef = doc(this.conversationsCol, conversationId);

    // Zera o contador de não lidas do usuário no documento da conversa
    await updateDoc(convRef, {
      [`unreadCounts.${userUid}`]: 0,
    }).catch(() => {});

    // Adiciona o UID do usuário ao array readBy das mensagens que ainda não foram lidas por ele
    const pendingToMark = unreadMessages.filter(
      (m) => !m.readBy?.includes(userUid)
    );
    if (pendingToMark.length === 0) return;

    const batch = writeBatch(db);
    pendingToMark.forEach((msg) => {
      const msgRef = doc(
        db,
        'conversations',
        conversationId,
        'messages',
        msg.id
      );
      batch.update(msgRef, {
        readBy: arrayUnion(userUid),
      });
    });

    await batch.commit().catch(() => {});
  }
}
