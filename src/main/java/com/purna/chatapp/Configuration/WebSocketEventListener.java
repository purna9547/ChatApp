package com.purna.chatapp.Configuration;

import com.purna.chatapp.Controllers.ChatMessage;
import com.purna.chatapp.Controllers.MessageType;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
//import lombok.var;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
@AllArgsConstructor
@Slf4j
public class WebSocketEventListener {
    private final SimpMessageSendingOperations messageTemplate;
    @EventListener
    public void HandleWebSocketDisconnectListener(SessionDisconnectEvent event){

        StompHeaderAccessor stompHeaderAccessor=StompHeaderAccessor.wrap(event.getMessage());
        String username=(String) stompHeaderAccessor.getSessionAttributes().get("username");
        if(username != null){
            log.info("User disconnected: {}",username);
            var chatMessage= ChatMessage.builder()
                    .type(MessageType.LEAVE)
                    .sender(username)
                    .build();
            messageTemplate.convertAndSend("/topic/public",chatMessage);

        }
    }
}
