// Solid like variant

import { useStore, For, onMount, onInit } from '@builder.io/mitosis';
import { SpacetimeDBClient, Identity } from "@clockworklabs/spacetimedb-sdk";

// root level import
import {
  /*Tables  */ Message, User,
  /*Reducers*/ SendMessageReducer, SetNameReducer
} from '@/module_bindings/index'


// Type Defs
type MessageType = {
  name: string;
  message: string;
};

/**  Create your SpacetimeDB client  **/
let token = localStorage.getItem('auth_token') || undefined;
let client = new SpacetimeDBClient("localhost:5000", "stdb-start-db", token);
let local_identity: Identity | undefined = undefined;

export default function MyBasicComponent() {
  const state = useStore({
    name: '',
    settingName: false,
    newName: '',
    systemMessage: '',
    messages: ([] as MessageType[]),
    newMessage: ''
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
    let _messages = Array.from(Message.all());
    _messages.sort((a, b) => a.sent > b.sent ? 1 : a.sent < b.sent ? -1 : 0);

    let messagesType: MessageType[] = _messages.map( message => {
      let sender_identity = User.filterByIdentity(message.sender);
      let display_name = sender_identity ? userNameOrIdentity(sender_identity) : "unknown";

      return {
        name: display_name,
        message: message.text,
      };
    });

    state.messages = messagesType;
  };

  // Helper function to append a line to the systemMessage state
  function appendToSystemMessage(line: String) {
    state.systemMessage += String.raw`\n` + line;
  };

  /**  Update the UI button callbacks  **/
  function onSubmitNewName(e: Event) {
    e.preventDefault();
    state.settingName = false;
    SetNameReducer.call(state.newName);
  };

  function onMessageSubmit(e: Event) {
    e.preventDefault();
    SendMessageReducer.call(state.newMessage);
    state.newMessage = "";
  };



  /** onInit */
  function init () {

    CLIENT_CBS : {
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
    
      client.on("initialStateSync", () => {
        setAllMessagesInOrder();
        let user = User.filterByIdentity( local_identity! );
        state.name = userNameOrIdentity( user! );
      });
    }

    TABLE_CBS : {
      /**  Message.onInsert callback - Update messages  **/
      Message.onInsert((message, reducerEvent) => {
        if (reducerEvent !== undefined) setAllMessagesInOrder();
      });
    

      /**  User.onInsert callback - Notify about new users  **/
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
    }

    REDUCER_CBS : {
      /**  SetNameReducer.on callback - Handle errors and update profile name  **/
      SetNameReducer.on((reducerEvent, reducerArgs) => {
        if (local_identity && reducerEvent.callerIdentity.isEqual(local_identity)) {
          if (reducerEvent.status === 'failed') {
            appendToSystemMessage(`Error setting name: ${reducerEvent.message} `);
          }
          else if (reducerEvent.status === 'committed') {
            state.name = reducerArgs[0]
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
    };

  };
  
  onInit(()=>{init()});

  /**  Connecting to the module  **/
  onMount(()=>{
    // init() for solid...
    client.connect()
  });

  
  /**  Basic layout  **/
  return (
    <div>
      <div class="profile">
        <h1>Profile</h1>
        {!state.settingName ? (
          <>
            <p>{state.name}</p>
            <button
              onClick={() => {
                state.settingName = true;
                state.newName = state.name;
              }}
            >
              Edit Name
            </button>
          </>
        ) : (
          <form onSubmit={(e)=>onSubmitNewName(e)}>
            <input
              type="text"
              css={{ marginBottom: "1rem" }}
              value={state.newName}
              onChange={(e) => state.newName = e.target.value}
            />
            <button type="submit">Submit</button>
          </form>
        )}
      </div>
      <div class="message">
        <h1>Messages</h1>
        {state.messages.length < 1 && <p>No messages</p>}
        <div>
          <For each={state.messages}>
            {(message, index) => (
              <div data-id={index} key={index}>
                <p>
                  <b>{message.name}</b>
                </p>
                <p>{message.message}</p>
              </div>
            )}
          </For>
        </div>
      </div>
      <div class="system" css={{ whiteSpace: 'pre-wrap' }}>
        <h1>System</h1>
        <div>
          <p>{state.systemMessage}</p>
        </div>
      </div>
      <div class="new-message">
        <form
          onSubmit={(e)=>onMessageSubmit(e)}
          css={{
            display: "flex",
            width: "50%",
            margin: "0 auto",
            "flex-direction": "column",
          }}
        >
          <h3>New Message</h3>
          <textarea
            value={state.newMessage}
            onChange={(e) => state.newMessage = e.target.value}
          ></textarea>
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
}
