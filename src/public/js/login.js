function submitForm() {
    const formData = {
        email: document.getElementById('usuario').value.toUpperCase(),
        password: document.getElementById('password').value,
    }

    fetch('/api/auth', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
    })
    .then(response => {
        if (response.ok) { 
            return response.json()
        } else {
            throw new Error('Unauthorized') 
        }
    })
    .then(responseData => {

        if (responseData.status === 'success') { 
            window.location.href = '/api/products' 
        } 
    })
    .catch(error => {
        console.error('Error:', error)
        Swal.fire({
            icon: "error",
            title: "Vaya, ha ocurrido un error.",
            text: "Usuario o Contraseña incorrecta",
        })
    })
}

const registrate = document.getElementById('Registrate')


registrate.addEventListener('click', () => {
    window.location.href = '/signup'
})