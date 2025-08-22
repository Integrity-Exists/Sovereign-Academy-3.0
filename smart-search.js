function smartNavigate(value) {
  const query = value.toLowerCase();
  if (query.includes("custody")) {
    window.location.href = "custody.html";
  } else if (query.includes("dss") || query.includes("cps")) {
    window.location.href = "dss-defense.html";
  } else if (query.includes("expunge") || query.includes("record")) {
    window.location.href = "records.html";
  } else if (query.includes("housing") || query.includes("evict")) {
    window.location.href = "eviction.html";
  } else if (query.includes("liberty") || query.includes("rights")) {
    window.location.href = "liberties.html";
  } else if (query.includes("probate") || query.includes("estate")) {
    window.location.href = "estate.html";
  } else if (query.includes("chevron")) {
    window.location.href = "chevron-doctrine.html";
  }
}
