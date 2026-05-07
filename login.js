// Check if already logged in
if (sessionStorage.getItem("isLoggedIn") === "true") {
  window.location.href = "role-selection.html"
}

// Login form handling
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault()

  const email = document.getElementById("email").value.trim()
  const password = document.getElementById("password").value
  const errorMessage = document.getElementById("errorMessage")

  // Clear previous errors
  errorMessage.classList.remove("show")

  // Simple validation
  if (!email || !password) {
    showError("Please enter both email and password.")
    return
  }

  if (!validateEmail(email)) {
    showError("Please enter a valid email address.")
    return
  }

  try {
    const response = await fetch("api/login.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    const result = await response.json()

    if (result.success) {
      sessionStorage.setItem("isLoggedIn", "true")
      sessionStorage.setItem("userId", result.user.userId)
      sessionStorage.setItem("userEmail", result.user.email)
      sessionStorage.setItem("fullName", result.user.fullName)
      if (result.user.phone) sessionStorage.setItem("userPhone", result.user.phone)
      sessionStorage.setItem("userRoles", JSON.stringify(result.user.roles || []))
      window.location.href = "role-selection.html"
    } else {
      showError(result.message || "Login failed. Please try again.")
    }
  } catch (error) {
    console.error("[v0] Login error:", error)
    showError("An error occurred. Please try again later.")
  }
})

// Create account link
document.getElementById("createAccountLink").addEventListener("click", (e) => {
  e.preventDefault()
  window.location.href = "signup.html"
})

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

function showError(message) {
  const errorMessage = document.getElementById("errorMessage")
  errorMessage.textContent = message
  errorMessage.classList.add("show")

  setTimeout(() => {
    errorMessage.classList.remove("show")
  }, 4000)
}
