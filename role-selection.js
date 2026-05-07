// Check if user is logged in
if (sessionStorage.getItem("isLoggedIn") !== "true") {
  window.location.href = "login.html"
}

const userId = sessionStorage.getItem("userId")

async function selectRole(role) {
  sessionStorage.setItem("userRole", role)

  if (role === "user") {
    window.location.href = "index.html"
    return
  }
  // worker
  const userId = sessionStorage.getItem("userId")
  try {
    const response = await fetch(`api/get_profile.php?userId=${userId}&roleType=worker`)
    const result = await response.json()
    if (result.success && result.profile && result.profile.is_complete) {
      window.location.href = "worker-dashboard.html"
    } else {
      window.location.href = "worker-profile.html"
    }
  } catch (error) {
    console.error("[v0] Error checking profile:", error)
    window.location.href = "worker-profile.html"
  }
}

// Logout functionality
document.getElementById("logoutLink").addEventListener("click", (e) => {
  e.preventDefault()

  if (confirm("Are you sure you want to logout?")) {
    sessionStorage.clear()
    window.location.href = "login.html"
  }
})
