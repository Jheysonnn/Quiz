// ----- Variables globales -----
let usuario = null;
let materiaActual = "";
let preguntasActuales = [];
let indice = 0;
let puntaje = 0;

// ----- Referencias a elementos -----
const loginContainer = document.getElementById("login-container");
const materiaContainer = document.getElementById("materia-container");
const quizContainer = document.getElementById("quiz-container");
const resultDiv = document.getElementById("result");
const materiasGrid = document.getElementById("materias-grid");
const infoSistema = document.getElementById("info-sistema");

// ----- Botones -----
const entrarBtn = document.getElementById("entrar-btn");
const siguienteBtn = document.getElementById("siguiente-btn");
const verPuntuacionesBtn = document.getElementById("ver-puntuaciones");
const cerrarSesionBtn = document.getElementById("cerrar-sesion");

// ----- Registro de usuario -----
entrarBtn.addEventListener("click", () => {
  const nombre = document.getElementById("nombre").value.trim();
  const curso = document.getElementById("curso").value.trim();
  if (!nombre || !curso){
  Swal.fire({
    icon: 'warning',
    title: '¡Ups!',
    text: 'Completa todos los campos',
    confirmButtonText: 'OK'
  });
  return;
}

  
  usuario = { nombre, curso };
  loginContainer.classList.add("hidden");
  materiaContainer.classList.remove("hidden");
  infoSistema.classList.remove("hidden");
  
  cargarMaterias();
});

// ----- Cargar materias -----
function cargarMaterias() {
  materiasGrid.innerHTML = "";
  const materias = Object.keys(bancoPreguntas);
  materias.forEach(m => {
    const btn = document.createElement("button");
    btn.textContent = m;
    btn.classList.add("materia-btn");
    btn.addEventListener("click", () => iniciarQuiz(m));
    materiasGrid.appendChild(btn);
  });
}

// ----- Iniciar quiz -----
function iniciarQuiz(materia) {
  materiaActual = materia;
  materiaContainer.classList.add("hidden");
  infoSistema.classList.add("hidden");
  resultDiv.classList.add("hidden");
  
  quizContainer.classList.remove("hidden");

  // Seleccionar 10 preguntas aleatorias
  preguntasActuales = bancoPreguntas[materia]
    .sort(() => 0.5 - Math.random())
    .slice(0, 10);

  indice = 0;
  puntaje = 0;

  mostrarPregunta();
}

// ----- Mostrar pregunta -----
function mostrarPregunta() {
  const q = preguntasActuales[indice];
  document.getElementById("pregunta-texto").textContent = `${indice + 1}. ${q.pregunta}`;

  const opcionesDiv = document.getElementById("opciones");
  opcionesDiv.innerHTML = q.opciones.map((op,i)=> `<div class="option" data-i="${i}">${op}</div>`).join('');

  siguienteBtn.classList.add("hidden");

  document.querySelectorAll(".option").forEach(op => {
    op.addEventListener("click", e => {
      const sel = parseInt(e.target.dataset.i);
      const correcta = preguntasActuales[indice].correcta;
      const opciones = document.querySelectorAll(".option");

      opciones.forEach((o,i)=>{
        if(i===correcta) o.classList.add("correct");
        else if(i===sel) o.classList.add("incorrect");
        o.style.pointerEvents="none";
      });

      if(sel === correcta) puntaje++;

      siguienteBtn.classList.remove("hidden");
    });
  });
}

// ----- Botón siguiente -----
siguienteBtn.addEventListener("click", ()=>{
  indice++;
  if(indice < preguntasActuales.length){
    mostrarPregunta();
  } else {
    mostrarResultado();
  }
});

// ----- Mostrar resultados -----
function mostrarResultado(){
  quizContainer.classList.add("hidden");
  resultDiv.classList.remove("hidden");
  resultDiv.innerHTML = `
    <h2>📊 Resultado de ${usuario.nombre}</h2>
    <p>Materia: ${materiaActual}</p>
    <p>Puntaje: ${puntaje} / ${preguntasActuales.length}</p>
    <button id="volver-menu">Volver al menú</button>
  `;

  // Guardar puntaje en localStorage
  guardarPuntaje(materiaActual, puntaje);

  document.getElementById("volver-menu").addEventListener("click", ()=>{
    resultDiv.classList.add("hidden");
    materiaContainer.classList.remove("hidden");
    infoSistema.classList.remove("hidden");
  });
}

// ----- Guardar puntajes -----
function guardarPuntaje(materia, punt){
  const key = `puntajes_${usuario.nombre}_${usuario.curso}`;
  let data = JSON.parse(localStorage.getItem(key)) || {};
  data[materia] = punt;
  localStorage.setItem(key, JSON.stringify(data));
}

// ----- Ver mis puntuaciones -----
verPuntuacionesBtn.addEventListener("click", ()=>{
  const key = `puntajes_${usuario.nombre}_${usuario.curso}`;
  const data = JSON.parse(localStorage.getItem(key)) || {};
  let html = `<h2>🏆 Puntuaciones de ${usuario.nombre}</h2>`;
  html += "<ul>";
  for(let m of Object.keys(bancoPreguntas)){
    html += `<li>${m}: ${data[m] !== undefined ? data[m] : 0} / 10</li>`;
  }
  html += "</ul>";
  html += `<button id="cerrar-punt">Cerrar</button>`;
  resultDiv.innerHTML = html;
  resultDiv.classList.remove("hidden");
  materiaContainer.classList.add("hidden");
  infoSistema.classList.add("hidden");

  document.getElementById("cerrar-punt").addEventListener("click", ()=>{
    resultDiv.classList.add("hidden");
    materiaContainer.classList.remove("hidden");
    infoSistema.classList.remove("hidden");
  });
});

// ----- Cerrar sesión -----
cerrarSesionBtn.addEventListener("click", ()=>{
  usuario = null;
  materiaContainer.classList.add("hidden");
  quizContainer.classList.add("hidden");
  resultDiv.classList.add("hidden");
  infoSistema.classList.remove("hidden");
  loginContainer.classList.remove("hidden");
  document.getElementById("nombre").value = "";
  document.getElementById("curso").value = "";
});
