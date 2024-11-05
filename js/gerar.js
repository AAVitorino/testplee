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

async function gerarRelatorio(roteiro) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    let yPos = 10;

    roteiro.casosDeTeste.forEach((caso, index) => {
        // Título do caso de teste
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold")
        doc.text(`Caso de Teste: ${caso.titulo}`, 10, yPos);

        const textWidth = doc.getTextWidth(`Caso de Teste: ${caso.titulo}`);
        const lineY = yPos + 2;

        doc.setDrawColor(0);
        doc.line(10, lineY, 10 + textWidth, lineY);
        yPos += 10;

        // Cabeçalho da tabela de passos
        doc.setFont("helvetica", "normal")
        doc.setFontSize(11);
        doc.setFillColor(141, 0, 0); 
        doc.rect(10, yPos, 80, 10, 'F'); 
        doc.rect(90, yPos, 80, 10, 'F'); 
        doc.setTextColor(255, 255, 255);
        doc.text('Passo', 12, yPos + 7); 
        doc.text('Resultado', 92, yPos + 7); 
        yPos += 10; 

        // Tabela de passos
        const passosData = caso.passos.map((passo, passoIndex) => {
            const status = document.getElementById(`passo-${index}-${passoIndex}`).checked;
            const descricao = passo.descricao;
            const resultado = passo.result || '';

            return {
                descricao,
                resultado,
                status,
            };
        });

        passosData.forEach((passo) => {
            // Cor de preenchimento: verde para marcado e vermelho para desmarcado
            const fillColor = passo.status ? [204, 255, 204] : [255, 204, 204];
            doc.setFillColor(...fillColor);

            // Célula de "Passo"
            const passoText = doc.splitTextToSize(passo.descricao, 80 - 4); // Largura da célula - margem
            const resultadoText = doc.splitTextToSize(passo.resultado, 80 - 4); // Largura da célula - margem
            const passoHeight = 10 * passoText.length; // Altura com base no texto do passo
            const resultadoHeight = 10 * resultadoText.length; // Altura com base no texto do resultado
            const maxHeight = Math.max(passoHeight, resultadoHeight); // Altura máxima entre passo e resultado

            // Preenche a célula "Passo"
            doc.rect(10, yPos, 80, maxHeight, 'F'); 
            doc.setTextColor(0, 0, 0);
            doc.text(passoText, 12, yPos + 7); 

            // Preenche a célula "Resultado"
            doc.setFillColor(...fillColor); 
            doc.rect(90, yPos, 80, maxHeight, 'F'); 
            doc.text(resultadoText, 92, yPos + 7); 

            // Ajusta a posição y com base na altura da célula máxima
            yPos += maxHeight; 
        });

        yPos += 10; // Espaço entre os casos de teste

        // Adiciona as evidências logo após a tabela de passos
        if (caso.evidencias && caso.evidencias.length > 0) {
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold")
            doc.text('Evidências de teste:', 10, yPos);
            yPos += 10;

            caso.evidencias.forEach((evidencia) => {
                //doc.text(`${evidencia.titulo}`, 12, yPos); //Titulo
                //yPos += 5;
                doc.setFontSize(11);
                doc.setFont("helvetica", "bold")
                doc.text(`${evidencia.descricao}`, 12, yPos); //Descrição
                yPos += 5;

                if (evidencia.imagem) {
                    // Adicionar a imagem no PDF
                    const imgWidth = 180; 
                    const imgHeight = 120; 
                    doc.addImage(evidencia.imagem, 'JPEG', 12, yPos, imgWidth, imgHeight);
                    yPos += imgHeight + 10;
                }
            });
        }

        // Verifica se é necessário adicionar uma nova página
        if (yPos > 280) {
            doc.addPage();
            yPos = 10;
        }
    });

    // Salva o PDF
    doc.save('Relatorio_Teste.pdf');
}



/// GERAR PLANILHA EXCEL



// Coleta os dados do roteiro
function coletarDadosRoteiro() {
    const passos = [];
    const casosContainer = document.getElementById('casos-container');
    
    // Para cada caso de teste
    casosContainer.querySelectorAll('.caso-teste').forEach(casoDiv => {
        // Para cada passo dentro do caso de teste
        casoDiv.querySelectorAll('.passos-container .input-group').forEach(passoDiv => {
            const passo = {
                descricao: passoDiv.querySelector('input:nth-child(1)').value,
                resultadoEsperado: passoDiv.querySelector('input:nth-child(2)').value
            };
            passos.push(passo);
        });
    });
    
    return passos;
}


// Gera e baixa a planilha
function gerarRoteiroExcel() {
    const passos = coletarDadosRoteiro(); // Captura os dados dos passos
    
    // Configuração inicial dos dados da planilha com os cabeçalhos
    const worksheetData = [["Status", "Passo", "Resultado Esperado"]];

    // Adiciona os passos e resultados na planilha
    passos.forEach(passo => {
        worksheetData.push([
            "",               // Coluna de checkbox
            passo.descricao,   // Coluna do passo
            passo.resultadoEsperado // Coluna do resultado esperado
        ]);
    });

    // Cria a planilha e o livro de trabalho para download
    const ws = XLSX.utils.aoa_to_sheet(worksheetData); // Cria a worksheet
    const wb = XLSX.utils.book_new(); // Cria um novo workbook
    XLSX.utils.book_append_sheet(wb, ws, "Roteiro de Teste"); // Adiciona a worksheet ao workbook

    // Gera o arquivo Excel e faz o download
    XLSX.writeFile(wb, "Roteiro_de_Teste.xlsx");
}


document.querySelectorAll('.dropdown-menu .dropdown-item').forEach(item => {
    item.addEventListener('click', function() {
        formatoSelecionado = this.getAttribute('data-formato');
        document.getElementById('dropdownMenuButton').textContent = `Formato: ${formatoSelecionado.toUpperCase()}`;
    });
});

// Event listener para o botão de download, chamando a função correta com base no formato selecionado
document.getElementById("downloadRoteiro").addEventListener("click", function() {
    if (formatoSelecionado === 'excel') {
        gerarRoteiroExcel();
    } else if (formatoSelecionado === 'json') {
        gerarJSON(); // Usa a função existente para gerar JSON
    }
});