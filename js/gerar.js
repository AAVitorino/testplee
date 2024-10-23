function addHistoria() {
    const historiasContainer = document.getElementById('historias-container');
    const historiaDiv = document.createElement('div');
    historiaDiv.className = 'input-group mb-2';
    historiaDiv.innerHTML = `
        <input type="text" class="form-control" placeholder="Adicione uma história...">
        <input type="text" class="form-control" placeholder="ID da História...">
        <button class="btn btn-danger" type="button" onclick="removeHistoria(this)">X</button>
    `;
    historiasContainer.appendChild(historiaDiv);
}

function removeHistoria(button) {
    const historiaDiv = button.parentNode;
    historiaDiv.remove();
}

function addCasoTeste() {
    const casosContainer = document.getElementById('casos-container');
    const casoTesteDiv = document.createElement('div');
    casoTesteDiv.className = 'caso-teste mb-3';
    casoTesteDiv.innerHTML = `
        <div class="input-group mb-2">
            <input type="text" class="form-control" placeholder="Título do Caso de Teste...">
            <button class="btn btn-danger" type="button" onclick="removeCaso(this)">X</button>
        </div>
        <div class="passos-container">
            <h5>Passos</h5>
            <div class="input-group mb-2">
                <input type="text" class="form-control" placeholder="Descrição do Passo...">
                <input type="text" class="form-control" placeholder="Resultado Esperado...">
                <button class="btn btn-danger" type="button" onclick="removePasso(this)">X</button>
            </div>
        </div>
        <button class="btn btn-primary mb-2" onclick="addPasso(this)">Adicionar Passo</button>
    `;
    casosContainer.appendChild(casoTesteDiv);
}

function removeCaso(button) {
    const casoTesteDiv = button.parentNode.parentNode;
    casoTesteDiv.remove();
}

function addPasso(button) {
    const passosContainer = button.parentNode.querySelector('.passos-container');
    const passoDiv = document.createElement('div');
    passoDiv.className = 'input-group mb-2';
    passoDiv.innerHTML = `
        <input type="text" class="form-control" placeholder="Descrição do Passo...">
        <input type="text" class="form-control" placeholder="Resultado Esperado...">
        <button class="btn btn-danger" type="button" onclick="removePasso(this)">X</button>
    `;
    passosContainer.appendChild(passoDiv);
}

function removePasso(button) {
    const passoDiv = button.parentNode;
    passoDiv.remove();
}



function gerarJSON() {
    const descricao = document.getElementById('descricao').value;
    const historias = Array.from(document.querySelectorAll('#historias-container input')).map((input, index) => {
        if (index % 2 === 0) {
            return {
                id: input.value,
                descricao: input.nextElementSibling.value 
            };
        }
    }).filter(Boolean); 

    const casosTeste = Array.from(document.querySelectorAll('.caso-teste')).map(caso => {
        const tituloCaso = caso.querySelector('input').value;
        const passos = Array.from(caso.querySelectorAll('.passos-container .input-group')).map(inputGroup => {
            return {
                descricao: inputGroup.children[0].value,
                result: inputGroup.children[1].value
            };
        });
        return { titulo: tituloCaso, passos: passos };
    });

    const roteiro = {
        cabecalho: {
            nome: descricao,
            historias: historias
        },
        casosDeTeste: casosTeste
    };

    // Converte o objeto roteiro para JSON
    const json = JSON.stringify(roteiro, null, 2);

    // Cria um Blob com o conteúdo JSON
    const blob = new Blob([json], { type: 'application/json' });

    // Cria um link temporário para o download
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'roteiro_de_teste.json'; 
    document.body.appendChild(a);
    a.click(); 
    document.body.removeChild(a); 
    URL.revokeObjectURL(url); 
}

