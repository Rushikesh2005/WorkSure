// Check if already logged in
if (sessionStorage.getItem("isLoggedIn") === "true") {
  window.location.href = "role-selection.html"
}

document.getElementById("signupForm").addEventListener("submit", async (e) => {
  e.preventDefault()

  const fullName = document.getElementById("fullName").value.trim()
  const email = document.getElementById("email").value.trim()
  const phone = document.getElementById("phone").value.trim()
  const password = document.getElementById("password").value
  const confirmPassword = document.getElementById("confirmPassword").value
  const errorMessage = document.getElementById("errorMessage")
  const successMessage = document.getElementById("successMessage")

  // Clear previous messages
  errorMessage.classList.remove("show")
  successMessage.classList.remove("show")

  // Validation
  if (!fullName || !email || !phone || !password || !confirmPassword) {
    showError("All fields are required.")
    return
  }

  if (!validateEmail(email)) {
    showError("Please enter a valid email address.")
    return
  }

  if (!validatePhone(phone)) {
    showError("Please enter a valid phone number.")
    return
  }

  if (password.length < 6) {
    showError("Password must be at least 6 characters long.")
    return
  }

  if (password !== confirmPassword) {
    showError("Passwords do not match.")
    return
  }

  // Create user object
  const userData = {
    fullName,
    email,
    phone,
    password,
  }

  try {
    // Send to backend API
    const response = await fetch("api/signup.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    })

    const result = await response.json()

    if (result.success) {
      showSuccess("Account created successfully! Redirecting to login...")
      setTimeout(() => {
        window.location.href = "login.html"
      }, 2000)
    } else {
      showError(result.message || "Registration failed. Please try again.")
    }
  } catch (error) {
    console.error("Signup error:", error)
    showError("An error occurred. Please try again later.")
  }
})

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

function validatePhone(phone) {
  const re = /^[\d\s+\-$$$$]+$/
  return re.test(phone) && phone.replace(/\D/g, "").length >= 10
}

function showError(message) {
  const errorMessage = document.getElementById("errorMessage")
  errorMessage.textContent = message
  errorMessage.classList.add("show")
  setTimeout(() => {
    errorMessage.classList.remove("show")
  }, 4000)
}

function showSuccess(message) {
  const successMessage = document.getElementById("successMessage")
  successMessage.textContent = message
  successMessage.classList.add("show")
}
