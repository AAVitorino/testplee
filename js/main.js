let roteiro = null;

// Função para carregar o arquivo JSON escolhido pelo usuário


function carregarRoteiro() {
    const input = document.getElementById('jsonFile');
    const container = document.getElementById('testes');
    container.innerHTML = ''; // Limpa o conteúdo anterior

    if (input.files.length === 0) {
        alert('Por favor, selecione um arquivo JSON.');
        return;
    }

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
        try {
            roteiro = JSON.parse(event.target.result); // Armazena o JSON na variável global
            renderizarRoteiro(roteiro); // Chama a função para renderizar o roteiro na tela
        } catch (error) {
            alert('O arquivo selecionado não é um JSON válido.');
        }
    };

    reader.readAsText(file);
}

// Função para renderizar o roteiro de teste em formato de tabela
function renderizarRoteiro(roteiro) {
    const container = document.getElementById('testes');

    // Exibir cabeçalho
    const cabecalho = roteiro.cabecalho;
    const cabecalhoDiv = document.createElement('div');
    cabecalhoDiv.className = 'header-info';
    cabecalhoDiv.innerHTML = `
        <h3>${cabecalho.nome}</h3>
        <p>${cabecalho.descricao}</p>
        <h5>Histórias de Usuário:</h5>
        <ul>
            ${cabecalho.historias.map(h => `<li>${h.id}: ${h.descricao}</li>`).join('')}
        </ul>
    `;
    container.appendChild(cabecalhoDiv);

    // Cria accordion principal
    const accordionDiv = document.createElement('div');
    accordionDiv.className = 'accordion mt-3';
    accordionDiv.id = 'testesAccordion';

    roteiro.casosDeTeste.forEach((caso, index) => {
        const accordionItem = document.createElement('div');
        accordionItem.className = 'accordion-item';

        accordionItem.innerHTML = `
            <h2 class="accordion-header" id="heading${index}">
                <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${index}" aria-expanded="true" aria-controls="collapse${index}">
                    ${caso.titulo}
                </button>
            </h2>
            <div id="collapse${index}" class="accordion-collapse collapse" aria-labelledby="heading${index}" data-bs-parent="#testesAccordion">
                <div class="accordion-body">
                    <table class="table table-bordered">
                        <thead>
                            <tr>
                                <th scope="col">Passo</th>
                                <th scope="col">Resultado</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${caso.passos.map((passo, passoIndex) => `
                                <tr>
                                    <td>
                                        <input type="checkbox" id="passo-${index}-${passoIndex}">
                                        <label for="passo-${index}-${passoIndex}">${passo.descricao}</label>
                                    </td>
                                    <td>${passo.result ? passo.result : ''}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>

                    <!-- Accordion de Evidências -->
                    <div class="accordion mt-3" id="evidenciasAccordion${index}">
                        <div class="accordion-item">
                            <h2 class="accordion-header" id="evidenciasHeading${index}">
                                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#evidenciasCollapse${index}" aria-expanded="false" aria-controls="evidenciasCollapse${index}">
                                    Evidências
                                </button>
                            </h2>
                            <div id="evidenciasCollapse${index}" class="accordion-collapse collapse" aria-labelledby="evidenciasHeading${index}" data-bs-parent="#evidenciasAccordion${index}">
                                <div class="accordion-body">
                                    <div id="evidenciasContainer-${index}"></div>
                                    <button type="button" class="btn btn-primary mt-3" onclick="adicionarFormularioEvidencia(${index})">Adicionar Evidência</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        accordionDiv.appendChild(accordionItem);
    });

    container.appendChild(accordionDiv);
}

// Função para adicionar formulário de evidência dinâmico
function adicionarFormularioEvidencia(casoIndex) {
    const evidenciasContainer = document.getElementById(`evidenciasContainer-${casoIndex}`);

    const evidenciaForm = document.createElement('div');
    evidenciaForm.className = 'evidencia-form mt-3';
    evidenciaForm.innerHTML = `
        <input type="text" class="form-control mb-2" placeholder="Título">
        <textarea class="form-control mb-2" placeholder="Descrição"></textarea>
        <div class="image-preview mb-2" style="border: 1px solid #ddd; padding: 10px;">
            <p>Cole a imagem aqui</p>
        </div>
        <button type="button" class="btn btn-success me-2" onclick="salvarEvidencia(${casoIndex}, this)">Salvar Evidência</button>
        <button type="button" class="btn btn-danger" onclick="excluirEvidencia(this, ${casoIndex})">Excluir Evidência</button>
    `;

    // Event listener para captura de imagem colada
    evidenciaForm.querySelector('.image-preview').addEventListener('paste', async (event) => {
        const items = (event.clipboardData || event.originalEvent.clipboardData).items;
        for (const item of items) {
            if (item.type.indexOf("image") === 0) {
                const file = item.getAsFile();
                const base64Image = await convertToBase64(file);
                evidenciaForm.querySelector('.image-preview').innerHTML = `<img src="${base64Image}" alt="Evidência" style="max-width: 100%;">`;
                evidenciaForm.dataset.imagemBase64 = base64Image;
            }
        }
    });

    evidenciasContainer.appendChild(evidenciaForm);
}

// Função para excluir uma evidência
function excluirEvidencia(evidenciaElement, casoIndex) {
    const evidenciaForm = evidenciaElement.parentElement;
    const evidenciasContainer = document.getElementById(`evidenciasContainer-${casoIndex}`);

    // Remove a evidência da interface
    evidenciasContainer.removeChild(evidenciaForm);

    // Remover a evidência do JSON
    const titulo = evidenciaForm.querySelector('input').value;
    const descricao = evidenciaForm.querySelector('textarea').value;
    const imagem = evidenciaForm.dataset.imagemBase64;

    const caso = roteiro.casosDeTeste[casoIndex];
    caso.evidencias = caso.evidencias.filter(evidencia =>
        evidencia.titulo !== titulo ||
        evidencia.descricao !== descricao ||
        evidencia.imagem !== imagem
    );
}

// Função para salvar a evidência
function salvarEvidencia(casoIndex, formElement) {
    const titulo = formElement.previousElementSibling.previousElementSibling.previousElementSibling.value;
    const descricao = formElement.previousElementSibling.previousElementSibling.value;
    const imagem = formElement.parentElement.dataset.imagemBase64;

    if (!titulo || !descricao || !imagem) {
        alert("Por favor, preencha o título, descrição e cole a imagem.");
        return;
    }

    const novaEvidencia = { titulo, descricao, imagem };
    roteiro.casosDeTeste[casoIndex].evidencias = roteiro.casosDeTeste[casoIndex].evidencias || [];
    roteiro.casosDeTeste[casoIndex].evidencias.push(novaEvidencia);

    formElement.parentElement.innerHTML = `
        <h6>${novaEvidencia.titulo}</h6>
        <p>${novaEvidencia.descricao}</p>
        <img src="${novaEvidencia.imagem}" alt="Evidência" class="img-fluid mb-2" style="max-width: 100%;">
        <button type="button" class="btn btn-danger" onclick="excluirEvidencia(this, ${casoIndex})">Excluir Evidência</button>
    `;
}

// Função para converter imagem para Base64
function convertToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);  // Converte para Base64
    });
}



