window.addEventListener("DOMContentLoaded", function () { 
const chatForm = document.getElementById("sage-chat-form"); 
const userInput = document.getElementById("user-input"); 
const chatLog = document.getElementById("chat-log"); 
chatForm.addEventListener("submit", async function (e) { 
e.preventDefault(); 
const prompt = userInput.value.trim(); 
if (!prompt) return; 
appendMessage("user", prompt); 
userInput.value = ""; 
appendMessage("sage", "�� Thinking..."); 
try { 
const response = await fetch("/api/ask-sage", { 
method: "POST", 
headers: { 
"Content-Type": "application/json" 
}, 
body: JSON.stringify({ prompt }) 
}); 
if (!response.ok) { 
const text = await response.text(); 
updateSageResponse(`⚠️ Server error: ${text}`); 
return; 
} 
const data = await response.json(); 
updateSageResponse(data.response || "�� Sage heard you but didn’t reply."); } catch (err) { 
console.error("Frontend error:", err); 
updateSageResponse("❌ Something went wrong on your device."); } 
}); 
function appendMessage(sender, text) { 
const message = document.createElement("div"); 
message.classList.add("message", sender); 
message.innerText = text; 
chatLog.appendChild(message); 
chatLog.scrollTop = chatLog.scrollHeight;
} 
function updateSageResponse(text) { 
const sageMessages = chatLog.querySelectorAll(".message.sage"); const last = sageMessages[sageMessages.length - 1]; if (last) last.innerText = text; 
} 
});
