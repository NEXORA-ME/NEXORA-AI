if (!localStorage.getItem("userEmail")) {
  window.location.href = "login.html";
}
const API =
"https://backend-b80q.onrender.com";

/* MARKDOWN */

marked.setOptions({

breaks:true,

highlight:function(code,lang){

if(hljs.getLanguage(lang)){

return hljs.highlight(
code,
{language:lang}
).value;

}

return hljs.highlightAuto(code).value;

}

});

/* USER */

const name =
localStorage.getItem("userName")
|| "User";

const pic =
localStorage.getItem("userPic")
|| "https://i.pravatar.cc/150?img=12";

document.getElementById(
"sidebarUserName"
).textContent = name;

document.getElementById(
"sidebarUserPic"
).src = pic;

document.getElementById(
"profilePic"
).src = pic;

/* DOM */

const sidebar =
document.getElementById("sidebar");

const overlay =
document.getElementById("overlay");

const mobileMenuBtn =
document.getElementById("mobileMenuBtn");

const closeSidebarBtn =
document.getElementById("closeSidebarBtn");

const settingsBtn =
document.getElementById("settingsBtn");

const settingsPanel =
document.getElementById("settingsPanel");

const closeSettings =
document.getElementById("closeSettings");

const themeSelect =
document.getElementById("themeSelect");

const msgInput =
document.getElementById("msgInput");

const sendBtn =
document.getElementById("sendBtn");

const stopBtn =
document.getElementById("stopBtn");

const chat =
document.getElementById("chat");

const thinkingBox =
document.getElementById("thinkingBox");

const chatHistory =
document.getElementById("chatHistory");

const newChatBtn =
document.getElementById("newChatBtn");

let stopGeneration = false;

/* SIDEBAR */

mobileMenuBtn.addEventListener(
"click",
() => {

sidebar.classList.add("open");
overlay.classList.add("show");

}
);

closeSidebarBtn.addEventListener(
"click",
() => {

sidebar.classList.remove("open");
overlay.classList.remove("show");

}
);

overlay.addEventListener(
"click",
() => {

sidebar.classList.remove("open");
overlay.classList.remove("show");

}
);

/* SETTINGS */

settingsBtn.addEventListener(
"click",
() => {

settingsPanel.classList.add("open");

}
);

closeSettings.addEventListener(
"click",
() => {

settingsPanel.classList.remove("open");

}
);

/* THEME */

const savedTheme =
localStorage.getItem("theme");

if(savedTheme){

document.body.classList.add(
savedTheme
);

themeSelect.value =
savedTheme;

}

themeSelect.addEventListener(
"change",
() => {

document.body.classList.remove(
"dark",
"light"
);

document.body.classList.add(
themeSelect.value
);

localStorage.setItem(
"theme",
themeSelect.value
);

}
);

/* AUTO RESIZE */

msgInput.addEventListener(
"input",
() => {

msgInput.style.height =
"auto";

msgInput.style.height =
msgInput.scrollHeight + "px";

}
);

/* THINKING */

function showThinking(){

thinkingBox.style.display =
"flex";

}

function hideThinking(){

thinkingBox.style.display =
"none";

}

/* RENDER */

function renderMessage(
role,
text
){

const wrapper =
document.createElement("div");

wrapper.className =
role === "user"
? "message user"
: "message assistant";

wrapper.innerHTML = `
<div class="avatar"></div>
<div class="message-content"></div>
`;

const content =
wrapper.querySelector(
".message-content"
);

if(role === "assistant"){

content.innerHTML =
marked.parse(text);

hljs.highlightAll();

}else{

content.textContent =
text;

}

chat.appendChild(wrapper);

scrollBottom();

return content;

}

/* SCROLL */

function scrollBottom(){

chat.scrollTop =
chat.scrollHeight;

}

/* HISTORY */

let chats =
JSON.parse(
localStorage.getItem(
"nexora_chats"
) || "[]"
);

function saveChats(){

localStorage.setItem(
"nexora_chats",
JSON.stringify(chats)
);

}

function renderHistory(){

chatHistory.innerHTML = "";

chats.forEach(item => {

const div =
document.createElement("div");

div.className =
"chat-history-item";

div.textContent =
item.title;

div.addEventListener(
"click",
() => {

chat.innerHTML = "";

item.messages.forEach(
msg => {

renderMessage(
msg.role,
msg.content
);

}
);

}
);

chatHistory.appendChild(div);

});

}

renderHistory();

/* NEW CHAT */

newChatBtn.addEventListener(
"click",
() => {

chat.innerHTML = "";

}
);

/* TYPE */

function typeText(
element,
text
){

return new Promise(resolve => {

let i = 0;

stopGeneration = false;

stopBtn.style.display =
"block";

function type(){

if(stopGeneration){

stopBtn.style.display =
"none";

resolve();

return;

}

if(i > text.length){

stopBtn.style.display =
"none";

resolve();

return;

}

element.innerHTML =

marked.parse(
text.substring(0,i)
)

+

'<span class="typingCursor"></span>';

hljs.highlightAll();

i++;

scrollBottom();

setTimeout(type,2);

}

type();

});

}

/* SEND */

async function sendMessage(){

const message =
msgInput.value.trim();

if(!message) return;

document.getElementById(
"welcomeScreen"
)?.remove();

renderMessage(
"user",
message
);

msgInput.value = "";
msgInput.style.height = "auto";

showThinking();

try{

const response =
await fetch(
API + "/chat",
{
method:"POST",
headers:{
"Content-Type":
"application/json"
},
body:JSON.stringify({
message
})
}
);

const data =
await response.json();

hideThinking();

const content =
renderMessage(
"assistant",
""
);

await typeText(
content,
data.reply
);

content.innerHTML =
marked.parse(
data.reply
);

hljs.highlightAll();

chats.unshift({

title:
message.substring(0,40),

messages:[

{
role:"user",
content:message
},

{
role:"assistant",
content:data.reply
}

]

});

saveChats();
renderHistory();

}catch(err){

hideThinking();

renderMessage(
"assistant",
"Server Error."
);

console.error(err);

}

}

/* STOP */

stopBtn.addEventListener(
"click",
() => {

stopGeneration = true;

hideThinking();

}
);

/* SEND */

sendBtn.addEventListener(
"click",
sendMessage
);

/* ENTER */

msgInput.addEventListener(
"keydown",
e => {

if(
e.key === "Enter"
&& !e.shiftKey
){

e.preventDefault();

sendMessage();

}

}
);

/* SEARCH */

document.getElementById(
"historySearch"
).addEventListener(
"input",
e => {

const value =
e.target.value
.toLowerCase();

document
.querySelectorAll(
".chat-history-item"
)
.forEach(item => {

item.style.display =
item.textContent
.toLowerCase()
.includes(value)
? "block"
: "none";

});

}
);

/* SUGGESTIONS */

document
.querySelectorAll(
".suggestion"
)
.forEach(btn => {

btn.addEventListener(
"click",
() => {

msgInput.value =
btn.textContent;

sendMessage();

}
);

});
