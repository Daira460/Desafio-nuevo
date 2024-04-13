function submitForm() {

    const id = document.getElementById('id').value

  
    fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
    })

    .then(response => response.json())
    .then(responseData => {
        if (responseData.status === 'Success') { 
            Swal.fire({
                icon: "success",
                title: "El producto fue borrado correctamente",
              })
        } else {
            Swal.fire({
                icon: "error",
                title: "Ops..",
                text: "Error al borrar el producto",
              })
        }
    })
    .catch(error => console.error('Error:', error))
}
