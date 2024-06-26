function submitForm() {
    
    const formData = {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        category: document.getElementById('category').value,
        price: document.getElementById('price').value,
        thumbnail: document.getElementById('thumbnail').value,
        code: document.getElementById('code').value,
        stock: document.getElementById('stock').value,
    }

    fetch('/api/products', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },

        body: JSON.stringify(formData),
    })

    .then(response => response.json())
    .then(responseData => {
       if (responseData.status === 'Success') { 

            Swal.fire({
                icon: "success",
                title: "Producto creado exitosamente",
              })

        } else {
            Swal.fire({
                icon: "error",
                title: "Vaya, ha ocurrido un error.",
                text: "Error al crear el producto",
              })
        }
    })

    .catch(error => console.error('Error:', error))
}