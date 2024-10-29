document.getElementById('evidencia').addEventListener('paste', async (event) => {
    const items = (event.clipboardData || event.originalEvent.clipboardData).items;
    for (const item of items) {
        if (item.type.indexOf("image") === 0) {
            const file = item.getAsFile();
            const base64 = await convertToBase64(file);

            // Cria uma tag <img> com a imagem em Base64 e insere no div
            const img = document.createElement("img");
            img.src = base64;
            img.style.maxWidth = "100%"; // Limita o tamanho da imagem
            document.getElementById('evidencia').innerHTML = ""; // Limpa conteúdo de texto
            document.getElementById('evidencia').appendChild(img);
        }
    }
});

function convertToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);  // Converte para Base64
    });
}
