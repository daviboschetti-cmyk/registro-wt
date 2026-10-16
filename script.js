const API_URL = 'http://localhost:3000';

/* ---------- LOGIN (index.html) ---------- */
async function realizarLogin() {
    const telefone = document.getElementById('login-telefone').value.trim();
    const senha = document.getElementById('login-senha').value;

    if (!telefone || !senha) {
        alert('Por favor, preencha o telefone e a senha.');
        return;
    }

    try {
        const url = `${API_URL}/auth?telefone=${encodeURIComponent(telefone)}&senha=${encodeURIComponent(senha)}`;
        const resposta = await fetch(url, { method: 'POST' });
        const dados = await resposta.json();

        if (resposta.ok && dados.authenticated) {
            localStorage.setItem('meuTelefone', dados.user.telefone);
            localStorage.setItem('meuApelido', dados.user.apelido);
            window.location.href = 'chat.html';
        } else {
            alert('Falha no login: ' + (dados.mensagem || 'Credenciais inválidas.'));
        }
    } catch (erro) {
        console.error('Erro de comunicação:', erro);
        alert('Falha ao conectar com o servidor da API.');
    }
}

/* ---------- CHAT (chat.html) ---------- */
function verificarAutenticacao() {
    const meuTelefone = localStorage.getItem('meuTelefone');
    if (!meuTelefone) {
        alert('Sessão expirada. Faça login novamente.');
        window.location.href = 'index.html';
        return;
    }
    const apelido = localStorage.getItem('meuApelido') || '';
    document.getElementById('conta-logada').textContent = `${apelido} (${meuTelefone})`;
}

function iniciarChat() {
    carregarMensagens();
    setInterval(carregarMensagens, 3000); // atualiza a cada 3 segundos

    document.getElementById('chat-mensagem').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') enviarMensagem();
    });
}

function mostrarAviso(container, texto, cor) {
    container.innerHTML = '';
    const p = document.createElement('p');
    p.style.textAlign = 'center';
    p.style.color = cor;
    p.textContent = texto;
    container.appendChild(p);
}

async function carregarMensagens() {
    const meuTelefone = localStorage.getItem('meuTelefone');
    const container = document.getElementById('messages-box');
    if (!container) return;

    if (!meuTelefone) {
        mostrarAviso(container, 'Faça login novamente.', 'red');
        return;
    }

    try {
        const url = `${API_URL}/chat?telefone=${encodeURIComponent(meuTelefone)}`;
        const resposta = await fetch(url);
        const dados = await resposta.json();

        if (!resposta.ok || !Array.isArray(dados)) {
            mostrarAviso(container, dados.mensagem || 'Erro ao carregar mensagens.', 'red');
            return;
        }

        if (dados.length === 0) {
            mostrarAviso(container, 'Nenhuma mensagem encontrada.', '#888');
            return;
        }

        const estavaNoFim =
            container.scrollHeight - container.scrollTop - container.clientHeight < 60;

        container.innerHTML = '';

        dados.forEach(msg => {
            const ehMinha = String(msg.telefone_remetente) === String(meuTelefone);

            const msgDiv = document.createElement('div');
            msgDiv.className = `msg ${ehMinha ? 'enviada' : 'recebida'}`;

            const meta = document.createElement('div');
            meta.className = 'msg-meta';
            meta.textContent = ehMinha
                ? `Você → ${msg.telefone_destinatario}`
                : msg.telefone_remetente;

            const texto = document.createElement('div');
            texto.textContent = msg.mensagem; // textContent evita XSS

            msgDiv.appendChild(meta);
            msgDiv.appendChild(texto);

            if (msg.data_envio) {
                const hora = document.createElement('div');
                hora.className = 'msg-hora';
                hora.textContent = new Date(msg.data_envio).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit'
                });
                msgDiv.appendChild(hora);
            }

            container.appendChild(msgDiv);
        });

        if (estavaNoFim) container.scrollTop = container.scrollHeight;
    } catch (erro) {
        console.error('Erro ao carregar mensagens:', erro);
        mostrarAviso(container, 'Erro ao ligar ao servidor.', 'red');
    }
}

async function enviarMensagem() {
    const telefoneDestino = document.getElementById('chat-destinatario').value.trim();
    const campoMensagem = document.getElementById('chat-mensagem');
    const mensagemTexto = campoMensagem.value.trim();
    const meuTelefone = localStorage.getItem('meuTelefone');

    if (!telefoneDestino || !mensagemTexto) {
        alert('Preencha o destinatário e a mensagem!');
        return;
    }

    try {
        const url = `${API_URL}/chat?telefone=${encodeURIComponent(meuTelefone)}`;
        const resposta = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                destinatario: telefoneDestino,
                mensagem: mensagemTexto
            })
        });

        const dados = await resposta.json();

        if (resposta.ok) {
            campoMensagem.value = '';
            await carregarMensagens();
            const box = document.getElementById('messages-box');
            box.scrollTop = box.scrollHeight;
        } else {
            alert('Falha ao enviar: ' + (dados.mensagem || 'Erro desconhecido.'));
        }
    } catch (erro) {
        console.error('Erro ao enviar mensagem:', erro);
        alert('Erro ao conectar com o serviço de mensagens.');
    }
}

function sair() {
    localStorage.clear();
    window.location.href = 'index.html';
}