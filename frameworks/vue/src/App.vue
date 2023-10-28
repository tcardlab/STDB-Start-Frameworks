
<script setup lang="ts">
  import { ref } from 'vue'
  import { SpacetimeDBClient, Identity } from "@clockworklabs/spacetimedb-sdk";

  // root level import
  import {
    /*Tables  */ Message, User, 
    /*Reducers*/ SendMessageReducer, SetNameReducer
  } from '@/module_bindings'

  export type MessageType = {
    name: string;
    message: string;
  };

  /**  Create your SpacetimeDB client  **/
  let token = localStorage.getItem('auth_token') || undefined;
  let spacetimeDBClient = new SpacetimeDBClient("wss://testnet.spacetimedb.com", "stdb-chat-tut", token);

  const newName = ref(""); // setNewName
  const settingName = ref(false); //setSettingName
  const name = ref(""); //setName
  const systemMessage = ref(""); //setSystemMessage
  const messages = ref<MessageType[]>([]); //setMessages
  
  const newMessage = ref(""); //setNewMessage

  let local_identity: Identity | undefined = undefined;
  let initialized: boolean = false;
  const client: SpacetimeDBClient = spacetimeDBClient;

  /**  onConnect Callback  **/
  client.onConnect((token, identity) => {
    console.log("Connected to SpacetimeDB");

    local_identity = identity;

    localStorage.setItem('auth_token', token);

    client.subscribe([
      "SELECT * FROM User",
      "SELECT * FROM Message"
    ]);
  });


  /**  initialStateSync callback  **/
  function userNameOrIdentity(user: User): string {
    console.log(`Name: ${user.name} `);
    if (user.name !== null) {
      return user.name || "";
    }
    else {
      let identityStr = user.identity.toHexString();
      console.log(`Name: ${identityStr} `);
      return identityStr.substring(0, 8);
    }
  }

  function setAllMessagesInOrder() {
    let msgArr = Array.from(Message.all());
    msgArr.sort((a, b) => a.sent > b.sent ? 1 : a.sent < b.sent ? -1 : 0);

    let messagesType: MessageType[] = msgArr.map((message) => {
      let sender_identity = User.filterByIdentity(message.sender);
      let display_name = sender_identity ? userNameOrIdentity(sender_identity) : "unknown";

      return {
        name: display_name,
        message: message.text,
      };
    });

    messages.value = messagesType;
  }

  client.on("initialStateSync", () => {
    setAllMessagesInOrder();
    let user = User.filterByIdentity( local_identity! );
    name.value = userNameOrIdentity( user! );
  });


  /**  Message.onInsert callback - Update messages  **/
  Message.onInsert((message, reducerEvent) => {
    if (reducerEvent !== undefined) setAllMessagesInOrder();
  });


  /**  User.onInsert callback - Notify about new users  **/
  // Helper function to append a line to the systemMessage state
  function appendToSystemMessage(line: String) {
    systemMessage.value = systemMessage.value + '\n' + line;
  };

  User.onInsert((user, reducerEvent) => {
    if (user.online) {
      appendToSystemMessage(`${userNameOrIdentity(user)} has connected.`);
    }
  });


  /**  User.onUpdate callback - Notify about updated users  **/
  User.onUpdate((oldUser, user, reducerEvent) => {
    if (oldUser.online === false && user.online === true) {
      appendToSystemMessage(`${userNameOrIdentity(user)} has connected.`);
    }
    else if (oldUser.online === true && user.online === false) {
      appendToSystemMessage(`${userNameOrIdentity(user)} has disconnected.`);
    }

    if (user.name !== oldUser.name) {
      appendToSystemMessage(`User ${userNameOrIdentity(oldUser)} renamed to ${userNameOrIdentity(user)}.`);
    }
  });

  /**  SetNameReducer.on callback - Handle errors and update profile name  **/
  SetNameReducer.on((reducerEvent, reducerArgs) => {
    if (local_identity && reducerEvent.callerIdentity.isEqual(local_identity)) {
      if (reducerEvent.status === 'failed') {
        appendToSystemMessage(`Error setting name: ${reducerEvent.message} `);
      }
      else if (reducerEvent.status === 'committed') {
        name.value = reducerArgs[0]
      }
    }
  });


  /**  SendMessageReducer.on callback - Handle errors  **/
  SendMessageReducer.on((reducerEvent, reducerArgs) => {
    if (local_identity && reducerEvent.callerIdentity.isEqual(local_identity)) {
      if (reducerEvent.status === 'failed') {
        appendToSystemMessage(`Error sending message: ${reducerEvent.message} `);
      }
    }
  });


  /**  Update the UI button callbacks  **/
  const onSubmitNewName = (e: Event) => {
    console.log(newName.value)
    e.preventDefault();
    settingName.value = false;
    SetNameReducer.call(newName.value);
  };

  const onMessageSubmit = (e: Event) => {
    console.log(newMessage.value)
    e.preventDefault();
    SendMessageReducer.call(newMessage.value);
    newMessage.value = "";
  };


  /**  Connecting to the module  **/
  if (!initialized) {
    client.connect();
    initialized = true;
  }
</script>

<template>
  <div class="App">
    <div class="profile">
      <h1>Profile</h1>
     
        <template v-if="!settingName">
          <p>{{name}}</p>
          <button
            @click="() => {
              settingName = true;
              newName = name;
            }"
          >
            Edit Name
          </button>
        </template>
   
        <form v-else @submit="onSubmitNewName">
          <input
            type="text"
            style="margin-bottom: 1rem"
            v-model="newName"
          />
          <button type="submit">Submit</button>
        </form>
     
    </div>
    <div class="message">
      <h1>Messages</h1>

      <p v-if="messages.length < 1">No messages</p>

      <div>
        
        <div v-for="(message, key) in messages" :key="key">
          <p>
            <b>{{message.name}}</b>
          </p>
          <p>{{message.message}}</p>
        </div>
          
      </div>
    </div>
    <div class="system" style="white-space: pre-wrap">
      <h1>System</h1>
      <div>
        <p>{{systemMessage}}</p>
      </div>
    </div>
    <div class="new-message">
      <form
        @submit="onMessageSubmit"
        style="
          display: flex,
          width: 50%,
          margin: 0 auto,
          flex-direction: column,
        "
      >
        <h3>New Message</h3>
        <textarea v-model="newMessage"></textarea>
        <button type="submit">Send</button>
      </form>
    </div>
  </div>
</template>

<style scoped>
</style>