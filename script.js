function zapiszDane() {
    const trescZadania = document.getElementById("wstaw_input").value;
    const dataZadania = document.getElementById("wstaw_data").value;

    if (trescZadania && dataZadania) {
        let zadania = JSON.parse(localStorage.getItem('zadania')) || [];

        let noweZadanie = {
            tresc: trescZadania,
            data: dataZadania
        };

        zadania.push(noweZadanie);
        localStorage.setItem('zadania', JSON.stringify(zadania));

        wczytajZadaniaZLocalStorage();

        document.getElementById("wstaw_input").value = '';
        document.getElementById("wstaw_data").value = '';
    } else {
        alert("Wszystkie pola muszą być wypełnione!");
    }
}

function wczytajZadaniaZLocalStorage(filtr = "") {
    let zadania = JSON.parse(localStorage.getItem('zadania')) || [];
    const lista = document.getElementById("zadania_lista");
    lista.innerHTML = '';

    const zadaniaFiltrowane = zadania.filter(z =>
        z.tresc.toLowerCase().includes(filtr.toLowerCase())
    );

    zadaniaFiltrowane.forEach(function(zadanie, index) {
        const template = document.getElementById("zadanie-template");
        const clonedTemplate = template.content.cloneNode(true);

        const nazwaSpan = clonedTemplate.querySelector(".zadanie-nazwa");
        const dataSpan = clonedTemplate.querySelector(".zadanie-data");
        const usunBtn = clonedTemplate.querySelector(".usun-btn");

        nazwaSpan.innerText = zadanie.tresc;
        dataSpan.innerText = zadanie.data;

        nazwaSpan.addEventListener("click", function() {
            edytujPole(nazwaSpan, index, "tresc");
        });
        dataSpan.addEventListener("click", function() {
            edytujPole(dataSpan, index, "data");
        });

        usunBtn.addEventListener("click", function() {
            usunZadanie(index);
        });

        lista.appendChild(clonedTemplate);
    });
}

function edytujPole(element, index, pole) {
    let zadania = JSON.parse(localStorage.getItem('zadania')) || [];
    const staraWartosc = zadania[index][pole];

    const input = document.createElement("input");
    input.value = staraWartosc;
    input.classList.add("edit-input");
    input.type = pole === "data" ? "date" : "text";

    element.replaceWith(input);
    input.focus();

    function zapiszNowaWartosc() {
        const nowaWartosc = input.value.trim();
        if (nowaWartosc) {
            zadania[index][pole] = nowaWartosc;
            localStorage.setItem('zadania', JSON.stringify(zadania));
            wczytajZadaniaZLocalStorage(document.getElementById("szukaj_input").value);
        } else {
            alert("Pole nie może być puste!");
            wczytajZadaniaZLocalStorage(document.getElementById("szukaj_input").value);
        }
    }

    input.addEventListener("blur", zapiszNowaWartosc);
    input.addEventListener("keydown", function(e) {
        if (e.key === "Enter") {
            zapiszNowaWartosc();
        }
    });
}

function usunZadanie(index) {
    let zadania = JSON.parse(localStorage.getItem('zadania')) || [];
    zadania.splice(index, 1);
    localStorage.setItem('zadania', JSON.stringify(zadania));
    wczytajZadaniaZLocalStorage(document.getElementById("szukaj_input").value);
}

function ustawFiltr() {
    const filtr = document.getElementById("szukaj_input").value;
    wczytajZadaniaZLocalStorage(filtr);
}

window.onload = function() {
    wczytajZadaniaZLocalStorage();
    document.getElementById("szukaj_input").addEventListener("input", ustawFiltr);
};