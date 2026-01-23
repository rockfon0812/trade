async function analyzeStock() {
  const symbol = document.getElementById("symbol").value
  const years = document.getElementById("years").value

  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ symbol, years })
  })

  const data = await response.json()
  document.getElementById("result").innerText = data.result
}
