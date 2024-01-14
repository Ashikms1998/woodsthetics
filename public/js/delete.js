const deleteButton = document.querySelectorAll(".deleteProduct");
                deleteButton.forEach((deleteBtn) => {
                    deleteBtn.addEventListener("click", async () => {
                        const productId = deleteBtn.getAttribute('data-productId')
                        let data = await fetch('/deletecartproduct', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ productId })
                        })
                            .then(res => res.json()).then(data => {
                                if (data.success) {
                                    window.location.reload()
                                }
                            }).catch(error => {
                                console.log(error);
                            })
                    });
                });