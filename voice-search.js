function startVoiceSearch() {
  if (!('webkitSpeechRecognition' in window)) {
    alert("Voice search not supported in this browser.");
    return;
  }

  const recognition = new webkitSpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = function(event) {
    const transcript = event.results[0][0].transcript;
    document.getElementById("smartSearch").value = transcript;
    smartNavigate(transcript); // Trigger search navigation
  };

  recognition.onerror = function(event) {
    alert("Voice search error: " + event.error);
  };

  recognition.start();
}
