function checkSession(){
    let chechUser = localStorage.getItem("currentUser")

    if (chechUser === null) {
        window.location.href= "../../index.html"
    }
}
checkSession()