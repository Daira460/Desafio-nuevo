function submitForm() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    const formData = {
      password: document.getElementById('password').value,
        token: token 
    };

    fetch('/api/auth/forgotPassword', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        
        body: JSON.stringify(formData),
    })
    .then(response => response.json())

    .then(responseData => {
        if (responseData.status === 'Success') { 
            window.location.href = '/login'; 
        } else {
            console.log("Error al restaurar la contraseña")
            Swal.fire({
                icon: "error",
                title: "Ops..",
                text: "La nueva contraseña debe ser diferente a la anterior",
              });
        }
    })
    .catch(error => console.error('Error:', error))
}

const registrate = document.getElementById('Registrate')

registrate.addEventListener('click', () => {
    window.location.href = '/signup'
})