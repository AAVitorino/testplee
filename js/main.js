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
            const roteiro = JSON.parse(event.target.result);
            renderizarRoteiro(roteiro);
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

    // Cria accordion
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
                </div>
            </div>
        `;

        accordionDiv.appendChild(accordionItem);
    });

    container.appendChild(accordionDiv);
}
// js/main.js


