// eyeicon function
let eyeicon = document.querySelector(".show-hide");
let password = document.getElementById("password");

eyeicon.addEventListener("click", function() {
	if (password.type === "password") {
		password.type = "text";
	} else {
		password.type = "password"; 
	}
});


document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm'); 
  
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault(); 
      const formData = new FormData(loginForm);
      const username = formData.get('username');
      const password = formData.get('password');
  
      fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          window.location.href = data.redirectUrl;
        } else {
          alert(data.message); 
        }
      })
      .catch(error => {
        console.error('Login error:', error);
      });      
    });
});

