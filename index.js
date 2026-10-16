alert("Funcionou");
const tel = document.querySelector("#login-telefone");
const btnNext = document.querySelector("#btn-next");

btnNext.addEventListener('click', () => {
   console.log(tel.value)
});

function fetchAPI() {
    const URL = "http://localhost:3000/auth";
    try{
        fetch(URL, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                telefone: tel.value
            })
        })

        if(req.ok)
        {
            console.log(res)
        }
    }
    catch{

    }
}