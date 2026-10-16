const { Router } = require("express");
const conn = require("../db/conection");

const router = Router();

/**
 * 1. Rota de Autenticação (Login)
 */
router.post("/auth", async (req, res) => {
    try {
        const telefone = req.body?.telefone || req.query?.telefone;
        const senha = req.body?.senha || req.query?.senha;

        if (!telefone || !senha) {
            return res.status(400).json({
                authenticated: false,
                mensagem: "Telefone e senha são obrigatórios."
            });
        }
         const cmd = 'SELECT id, apelido, telefone FROM utilizadores WHERE telefone = ? AND senha = ?';
        const [rows] = await conn.query(cmd, [telefone, senha]);

        if (rows.length > 0) {
            return res.json({
                authenticated: true,
                mensagem: "Autenticado com sucesso!",
                user: rows[0]
            });
        } else {
            return res.status(401).json({
                authenticated: false,
                mensagem: "Telefone ou senha incorretos."
            });
        }
    } catch (error) {
        console.error("Erro no processamento da rota /auth:", error);
        return res.status(500).json({ 
            mensagem: "Erro interno no servidor.",
            erro: error.message 
        });
    }
});


router.get("/chat", async (req, res) => {
    try {
        const telefone = req.query?.telefone;

        if (!telefone) {
            return res.status(400).json({ mensagem: "Telefone é obrigatório." });
        }

        // Utiliza os nomes exatos do seu banco de dados: telefone_remetente e telefone_destinatario
        const cmd = 'SELECT * FROM mensagens WHERE telefone_remetente = ? OR telefone_destinatario = ? ORDER BY Id ASC';
        const [rows] = await conn.query(cmd, [telefone, telefone]);

        return res.json(rows);
    } catch (error) {
        console.error("ERRO MYSQL AO BUSCAR MENSAGENS:", error.message);
        return res.status(500).json({ 
            mensagem: "Erro ao buscar mensagens do banco.",
            erro: error.message 
        });
    }
});
    
router.post("/chat", async (req, res) => {
    try {
        const remetente = req.query?.telefone || req.body?.remetente;
        const destinatario = req.body?.destinatario || req.body?.telefone;
        const mensagem = req.body?.mensagem;

        if (!remetente || !destinatario || !mensagem) {
            return res.status(400).json({ mensagem: "Preencha todos os campos." });
        }

        // Insere com as colunas corretas do banco
        const cmd = 'INSERT INTO mensagens (telefone_remetente, telefone_destinatario, mensagem) VALUES (?, ?, ?)';
        await conn.query(cmd, [remetente, destinatario, mensagem]);

    
        return res.json({ mensagem: "Mensagem enviada com sucesso!" });
    } catch (error) {
        console.error("ERRO MYSQL AO ENVIAR MENSAGEM:", error.message);
        return res.status(500).json({ 
            mensagem: "Erro ao salvar mensagem no banco.",
            erro: error.message 
        });
    }
});


/**
 * Rota de Cadastro de Usuário
 * Endpoint: POST /registrar
 */
router.post("/registrar", async (req, res) => {
    try {
        const { apelido, telefone, senha } = req.body;

        // Verifica se todos os campos foram preenchidos
        if (!apelido || !telefone || !senha) {
            return res.status(400).json({
                sucesso: false,
                mensagem: "Preencha o apelido, telefone e senha."
            });
        }

        // Valida o apelido
        if (apelido.trim().length > 50) {
            return res.status(400).json({
                sucesso: false,
                mensagem: "O apelido deve ter no máximo 50 caracteres."
            });
        }

        // Valida o telefone
        if (!/^\d{10,13}$/.test(telefone)) {
            return res.status(400).json({
                sucesso: false,
                mensagem: "O telefone deve conter de 10 a 13 números."
            });
        }

        // Valida a senha
        if (typeof senha !== "string" || senha.length < 6) {
            return res.status(400).json({
                sucesso: false,
                mensagem: "A senha deve ter pelo menos 6 caracteres."
            });
        }

        // Verifica se o telefone já está cadastrado
        const consulta = `
            SELECT id
            FROM utilizadores
            WHERE telefone = ?
        `;

        const [usuarios] = await conn.query(consulta, [telefone]);

        if (usuarios.length > 0) {
            return res.status(409).json({
                sucesso: false,
                mensagem: "Este telefone já está cadastrado."
            });
        }

        // Cadastra o novo usuário
        const comando = `
            INSERT INTO utilizadores (apelido, telefone, senha)
            VALUES (?, ?, ?)
        `;

        const [resultado] = await conn.query(comando, [
            apelido.trim(),
            telefone,
            senha
        ]);

        return res.status(201).json({
            sucesso: true,
            mensagem: "Usuário cadastrado com sucesso!",
            usuario: {
                id: resultado.insertId,
                apelido: apelido.trim(),
                telefone: telefone
            }
        });

    } catch (error) {
        console.error("Erro ao cadastrar usuário:", error);

        // Trata telefone duplicado, caso a coluna tenha UNIQUE
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                sucesso: false,
                mensagem: "Este telefone já está cadastrado."
            });
        }

        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro interno ao cadastrar usuário."
        });
    }
});


module.exports = router;