function submitForm() {
    const formData = {
        email: document.getElementById('usuario').value.toUpperCase(),
        password: document.getElementById('password').value,
    }

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
            console.log("Error al restaurar la clave")
            Swal.fire({
                icon: "error",
                title: "Ops...",
                text: "Email incorrecto",
              });
        }
    })
    .catch(error => console.error('Error:', error))
}

const registrate = document.getElementById('Registrate')

registrate.addEventListener('click', () => {
    window.location.href = '/signup'
})