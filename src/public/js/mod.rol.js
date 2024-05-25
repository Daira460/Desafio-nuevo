function submitForm() {
    const uid = document.getElementById('idUser').value

    fetch(`/api/users/premium/${uid}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => {
        if (response.ok) {
         
            return response.json()
        } else {
    
            throw new Error('Error al realizar la solicitud: ' + response.statusText)
        }
    })
    .then(responseData => {
     
        if (responseData.status === 'success') {
        
            Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: responseData.message,
            })
        } 
    })
    .catch(error => {
        console.error(error)
        if (error.message.includes('Bad Request')) {
            Swal.fire({
                icon: 'error',
                title: 'Vaya, ha ocurrido un error.',
                text: 'El usuario no ha terminado de procesar su documentación',
            })
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Vaya, ha ocurrido un error."',
                text: 'Error al realizar la solicitud.',
            })
        }
    })
}    