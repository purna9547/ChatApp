
'use strict';
var usernamePage = document.querySelector('#username-page');
var chatPage = document.querySelector('#chat-page');
var usernameForm = document.querySelector('#usernameForm');
var messageForm = document.querySelector('#messageForm');
var messageInput = document.querySelector('#message');
var messageArea = document.querySelector('#messageArea');
var connectingElement = document.querySelector('.connecting');
var stompClient = null;
var username = null;
var colors=['#FF6633', '#FF33FF','#88E5A5FF', '#FFA500', '#FF4500', '#DA70D6', '#FFD700', '#FFA07A', '#FFA500', '#FF4500', '#DA70D6', '#FFD700', '#FFA07A', '#FFA500', '#FF4500', '#DA70D6', '#FFD700', '#FFA07A', '#FFA500', '#FF4500', '#DA70D6', '#FFD700', '#FFA07A', '#FFA500', '#FF4500', '#DA70D6', '#FFD700', '#FFA07A', '#FFA500', '#FF4500', '#DA70D6', '#FFD700', '#FFA07A', '#FFA500', '#FF4500', '#DA70D6', '#FFD700', '#FFA07A', '#FFA500', '#FF4500', '#DA70D6', '#FFD700', '#FFA07A', '#FFA500', '#FF4500', '#DA70D6', '#FFD700', '#FFA07A', '#FFA500', '#FF4500', '#DA70D6', '#FFD700', '#FFA07A', '#FFA500', '#FF4500', '#DA70D6', '#FFD700', '#FFA07A', '#FFA500', '#FF4500', '#DA70D6'];




function connect(event) {
    username = document.querySelector('#name').value.trim();
    if(username) {
        usernamePage.classList.add('hidden');
        chatPage.classList.remove('hidden');
        var socket = new SockJS('/websocket-server-production-9664.up.railway.app');
        stompClient = Stomp.over(socket);
        stompClient.connect({}, onConnected, onError);
    }
    event.preventDefault();

}



function onConnected(options) {
    //subscribe to the public topic
    stompClient.subscribe('/topic/public', onMessageReceived);
    //tell your username to the server
    stompClient.send("/app/chat.addUser",
        {},
        JSON.stringify({sender: username, type: 'JOIN'})
    );
    connectingElement.classList.add('hidden');

}

function onError() {
    connectingElement.textContent = 'Could not connect to WebSocket server. Please refresh this page to try again!';
    connectingElement.style.color = 'red';

}



function onMessageReceived(payload) {
    var message = JSON.parse(payload.body);
    var messageElement = document.createElement('i');

    if(message.type === 'JOIN') {
        messageElement.classList.add('event-message');
        message.content = message.sender + ' joined!';
    }
    else if(message.type === 'LEAVE') {
        messageElement.classList.add('event-message');
        message.content = message.sender + ' left!';
    }
    else {
        messageElement.classList.add('chat-message');
        var avatarElement = document.createElement('i');
        var avatarText = document.createTextNode(message.sender[0]);
        avatarElement.appendChild(avatarText);
        avatarElement.style['background-color'] = getAvatarColor(message.sender);
        messageElement.appendChild(avatarElement);
        var usernameElement = document.createElement('span');
        var usernameText = document.createTextNode(message.sender);
        usernameElement.appendChild(usernameText);
        messageElement.appendChild(usernameElement);
    }
    if (message.image) {
        var imageElement = document.createElement('img');
        imageElement.src = message.image; // Display the image
        imageElement.alt = 'Sent image';
        imageElement.style.maxWidth = '100%';
        messageElement.appendChild(imageElement);
    }
    var textElement = document.createElement('p');
    var messageText = document.createTextNode(message.content);
    textElement.appendChild(messageText);
    messageElement.appendChild(textElement);
    messageArea.appendChild(messageElement);
    messageArea.scrollTop = messageArea.scrollHeight;


}
function sendMessage(event) {
    var messageContent = messageInput.value.trim();
    var imageInput = document.querySelector('#imageInput');
    var imageFile = imageInput.files[0];

    if ((messageContent || imageFile) && stompClient) {
        var chatMessage = {
            sender: username,
            content: messageContent,
            type: 'CHAT',
        };

        if (imageFile) {
            var reader = new FileReader();
            reader.onload = function (e) {
                chatMessage.image = e.target.result; // Base64 encoded image
                stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(chatMessage));
            };
            reader.readAsDataURL(imageFile);
        } else {
            stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(chatMessage));
        }

        messageInput.value = '';
        imageInput.value = ''; // Clear file input
    }

    event.preventDefault();
}


function getAvatarColor(messageSender) {
    var hash = 0;
    for(var i = 0; i < messageSender.length; i++) {
        hash = 31 * hash + messageSender.charCodeAt(i);
    }
    var index = Math.abs(hash % colors.length);
    return colors[index];
}
usernameForm.addEventListener('submit', connect, true);


messageForm.addEventListener('submit', sendMessage, true);

