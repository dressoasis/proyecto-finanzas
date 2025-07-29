const btnLogout = document.getElementById("logout-btn")

btnLogout.addEventListener("click", function(){
    console.log("asdas")
    localStorage.removeItem("currentUser")
    window.location.href = "/"
})