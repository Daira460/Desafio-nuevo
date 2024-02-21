document.querySelectorAll('.botonAgregarCarrito').forEach(function(button) {
  button.addEventListener ('click', async function() {
    let pid = this.dataset.pid
    let cid = this.dataset.cid

   if (!cid) {
    try {
     const response = await fetch(`/api/users/user-cart`, {
        method: 'GET',
      })
      data = await response.json()
      cid = data.cid
    } catch (error){
      console.error (error)
    }
  }
  
    console.log('PID:', pid)
    console.log("CID:", cid) 
    
    if (!cid) {


      fetch(`/api/carts`, {
        method: 'POST',
      })
      .then(response => response.json())
      .then(data => {
        console.log(data)
        cid = data.cid 
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
          agregarProductoAlCarrito(cid, pid)
        })
        .catch(error => {
          console.error('Error al actualizar el usuario:', error)
        })
      })
      .catch(error => {
        console.error('Error al crear el carrito:', error)
      })
    } else {
      agregarProductoAlCarrito(cid, pid)
    }
  })
})

function agregarProductoAlCarrito(cid, pid) {
  fetch(`/api/carts/${cid}/products/${pid}`, {
      method: 'POST',
  })
  .then(response => response.json())
  .then(data => {
      console.log(data)
      const Toast = Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
          didOpen: (toast) => {
              toast.addEventListener('mouseenter', Swal.stopTimer)
              toast.addEventListener('mouseleave', Swal.resumeTimer)
          }
      })

      Toast.fire({
          icon: 'success',
          title: `Producto agregado correctamente`,
      })
  })
  .catch(error => {
      console.error('Error al cancelar la compra:', error)
  })
}