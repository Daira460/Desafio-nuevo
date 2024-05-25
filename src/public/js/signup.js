function submitForm() {
    const formData = {
        first_name: document.getElementById('nombre').value,
        last_name: document.getElementById('apellido').value,
        age: document.getElementById('edad').value,
        email: document.getElementById('email').value.toUpperCase(),
        password: document.getElementById('password').value,
    }

    fetch('/api/users', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
    })
    .then(response => {
        if (!response.ok) {

            throw new Error('Error al registrar el usuario');
        }
        return response.json();
    })
    .then(userData => {

        fetch(`/api/carts`, {
            method: 'POST',
        })
        .then(response => response.json())
        .then(data => {
            const cid = data.cid;

            fetch(`/api/users/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ cart: cid })
            })
            .then(response => response.json())
            .then(updatedUser => {
                console.log('Usuario actualizado con éxito:', updatedUser)

                window.location.href = '/login';
            })
            .catch(error => {
                console.error('Error al actualizar el usuario:', error)
            })
        })
        .catch(error => {
            console.error('Error al crear el carrito:', error)
        })
    })
    .catch(error => {
        console.error('Error:', error);
        
        Swal.fire({
            icon: "error",
            title: "Vaya, ha ocurrido un error.",
            text: "Error al crear el usuario"
          });
    });
}