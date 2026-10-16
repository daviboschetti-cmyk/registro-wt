// Depende do script.js (que define API_URL). Carregue o script.js ANTES deste arquivo.

function mostrarAvisoRegistro(tipo, texto) {
    const aviso = document.getElementById('aviso');
    aviso.className = 'aviso ' + tipo;
    aviso.textContent = texto;
}

async function registrarUsuario() {
    const apelido   = document.getElementById('reg-apelido').value.trim();
    const telefone  = document.getElementById('reg-telefone').value.trim();
    const senha     = document.getElementById('reg-senha').value;
    const confirmar = document.getElementById('reg-senha2').value;
    const botao     = document.getElementById('btn-registrar');

    if (!apelido || !telefone || !senha) {
        mostrarAvisoRegistro('erro', 'Preencha todos os campos.');
        return;
    }
    if (!/^\d{10,13}$/.test(telefone)) {
        mostrarAvisoRegistro('erro', 'O telefone deve ter de 10 a 13 números, sem espaços ou símbolos.');
        return;
    }
    if (senha.length < 6) {
        mostrarAvisoRegistro('erro', 'A senha deve ter pelo menos 6 caracteres.');
        return;
    }
    if (senha !== confirmar) {
        mostrarAvisoRegistro('erro', 'As senhas não são iguais.');
        return;
    }

    botao.disabled = true;
    botao.textContent = 'Cadastrando...';

    try {
        const resposta = await fetch(`${API_URL}/registrar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ apelido, telefone, senha })
        });
        const dados = await resposta.json();

        if (resposta.ok) {
            mostrarAvisoRegistro('sucesso', 'Conta criada! Redirecionando para o login...');
            document.getElementById('form-registro').reset();
            setTimeout(() => { window.location.href = 'index.html'; }, 1500);
        } else {
            mostrarAvisoRegistro('erro', dados.mensagem || 'Não foi possível criar a conta.');
        }
    } catch (erro) {
        console.error(erro);
        mostrarAvisoRegistro('erro', 'Não foi possível conectar ao servidor.');
    } finally {
        botao.disabled = false;
        botao.textContent = 'Cadastrar';
    }
}