# ADR-003: Use WebSocket Instead of Polling for Messaging

## Status
Accepted

## Context
CreatorX requires real-time messaging between creators and brands. Options considered:
- **HTTP Polling**: Simple but inefficient
- **Server-Sent Events (SSE)**: One-way communication
- **WebSocket**: Full-duplex, real-time communication
- **Push Notifications**: For offline scenarios

## Decision
We will use **WebSocket (STOMP over WebSocket)** for real-time messaging.

## Rationale

### 1. Real-Time Communication
- **Instant delivery**: Messages delivered immediately
- **Bidirectional**: Both client and server can send messages
- **Low latency**: No polling delay

### 2. Efficiency
- **Persistent connection**: No HTTP overhead per message
- **Reduced server load**: No constant polling requests
- **Bandwidth efficient**: Only send when messages exist

### 3. User Experience
- **Instant feedback**: Messages appear immediately
- **Typing indicators**: Can implement real-time features
- **Read receipts**: Real-time status updates

### 4. Scalability
- **Connection pooling**: Efficient resource usage
- **Message broadcasting**: Send to multiple clients
- **Topic-based routing**: Efficient message distribution

## Consequences

### Positive
- ✅ **Real-time**: Instant message delivery
- ✅ **Efficient**: Lower server load than polling
- ✅ **Scalable**: Handles many concurrent connections
- ✅ **Feature-rich**: Supports typing indicators, read receipts

### Negative
- ⚠️ **Complexity**: More complex than HTTP polling
- ⚠️ **Connection management**: Handle reconnections, failures
- ⚠️ **Firewall issues**: Some networks block WebSocket
- ⚠️ **State management**: Maintain connection state

### Mitigation
- Use SockJS for fallback to HTTP polling
- Implement automatic reconnection logic
- Use push notifications for offline scenarios
- Handle connection failures gracefully

## Implementation Details

### Protocol
- **STOMP over WebSocket**: Structured messaging protocol
- **Endpoints**: `/ws` for WebSocket, `/app` for application messages
- **Topics**: `/topic/conversation/{id}` for broadcasts
- **Queues**: `/user/{userId}/queue/messages` for private messages

### Fallback Strategy
- **SockJS**: Automatic fallback to HTTP polling if WebSocket unavailable
- **Push Notifications**: For offline message delivery
- **HTTP API**: REST endpoints for message history

## Alternatives Considered
1. **HTTP Polling**: Simple but inefficient (rejected)
2. **Server-Sent Events**: One-way only (rejected)
3. **Long Polling**: Better than polling but still inefficient (rejected)
4. **gRPC Streaming**: Overkill for this use case (rejected)

## References
- [Spring WebSocket Documentation](https://docs.spring.io/spring-framework/reference/web/websocket.html)
- [STOMP Protocol](https://stomp.github.io/)
- [WebSocket Best Practices](https://www.websocket.org/quantum.html)

