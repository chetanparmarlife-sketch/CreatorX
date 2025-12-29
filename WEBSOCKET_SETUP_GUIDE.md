# WebSocket Real-Time Messaging Setup Guide

## ✅ Implementation Complete

Complete WebSocket-based real-time messaging system for CreatorX with STOMP protocol, JWT authentication, and offline support.

## 📁 Components

### Backend

1. **WebSocket Configuration**
   - `WebSocketConfig.java` - STOMP endpoint configuration
   - `WebSocketSecurityConfig.java` - Security configuration
   - `JwtChannelInterceptor.java` - JWT authentication interceptor

2. **Message Service**
   - `MessageService.java` - Business logic with WebSocket broadcasting
   - `MessageController.java` - WebSocket and REST endpoints

3. **DTOs**
   - `MessageDTO.java` - Message data transfer
   - `ConversationDTO.java` - Conversation data transfer
   - `ChatMessageRequest.java` - Message request

### React Native

1. **WebSocket Client**
   - `websocket.ts` - STOMP client wrapper

2. **Chat Context**
   - `ChatContext.tsx` - State management with WebSocket

3. **Services**
   - `messagingService.ts` - REST API client (updated)

## 🔧 Setup

### Backend

1. **Add Dependency** (already added):
```gradle
implementation 'org.springframework.boot:spring-boot-starter-websocket'
```

2. **WebSocket Endpoint**:
   - STOMP: `ws://localhost:8080/ws` (or `wss://` for HTTPS)
   - Application: `/app`
   - Topics: `/topic`
   - User queues: `/user`

3. **JWT Authentication**:
   - Token passed in `Authorization` header on CONNECT
   - Validated by `JwtChannelInterceptor`
   - User loaded from database

### React Native

1. **Install Dependencies**:
```bash
npm install @stomp/stompjs sockjs-client
```

2. **WebSocket URL**:
   - Automatically derived from `API_BASE_URL`
   - `http://localhost:8080/api/v1` → `ws://localhost:8080/ws`

3. **Connect on App Launch**:
```typescript
import { ChatProvider } from '@/src/context/ChatContext';

// Wrap app with ChatProvider
<ChatProvider>
  {/* Your app */}
</ChatProvider>
```

## 🚀 Usage

### Send Message
```typescript
const { sendMessage } = useChat();
await sendMessage(conversationId, 'Hello!');
```

### Receive Messages
```typescript
const { messages, conversations } = useChat();
// Messages automatically updated via WebSocket
```

### Mark as Read
```typescript
const { markAsRead } = useChat();
await markAsRead(conversationId);
```

## 📊 Message Flow

```
Client → /app/chat.send → MessageController
  ↓
MessageService saves to DB
  ↓
Broadcast to /topic/conversation/{id}
  ↓
Send to /user/{userId}/queue/messages
  ↓
Clients receive via WebSocket
```

## 🔐 Security

- JWT authentication required for WebSocket connection
- Users can only access their own conversations
- Message sending verified against participants
- Read receipts only for participants

## 🔄 Offline Support

- Messages queued in AsyncStorage when offline
- Automatically sent on reconnect
- Delivery status tracking (sending → sent → delivered → read)

## 🧪 Testing

1. **Test WebSocket Connection**:
   - Connect with valid JWT token
   - Verify authentication
   - Check subscription to user queue

2. **Test Message Sending**:
   - Send message via WebSocket
   - Verify broadcast to conversation topic
   - Verify delivery to recipient queue

3. **Test Offline Queue**:
   - Disconnect WebSocket
   - Send messages
   - Reconnect
   - Verify queued messages sent

---

**Status**: ✅ Complete and ready for testing

