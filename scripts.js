/*Esta chamando as tags do html a tribuindo no js */
const openModalButton = document.querySelector("#openModal");
const closeModalButton = document.querySelector("#closeModal");
const modal = document.querySelector("#modal");
const fade = document.querySelector("#fade");


/// -- TRADUCAO DOS TEXTOS

let langObject = {};
const userLang = navigator.language || navigator.userLanguage;
console.log(userLang);
const lang = userLang.split('-')[0];

async function loadTranslation(lang) {
  try {
    // Tenta carregar o idioma detectado
    const res = await fetch(`./locales/${lang}.json`);
    
    if (!res.ok) throw new Error("Idioma não encontrado");
    
    const translations = await res.json();
    applyTranslations(translations);
    langObject = translations;

  } catch (err) {
    console.warn(`Tradução para '${lang}' não encontrada. Usando inglês por padrão.`);

    // Fallback para inglês
    try {
      const fallbackRes = await fetch('./locales/en.json');
      const fallbackTranslations = await fallbackRes.json();
      applyTranslations(fallbackTranslations);
      langObject = fallbackTranslations;

    } catch (fallbackErr) {
      console.error("Erro ao carregar fallback em inglês:", fallbackErr);
    }
  }
}

function applyTranslations(translations) {
  // Tradução de texto visível (como <span>, <div>, etc.)
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[key]) {
      el.textContent = translations[key];
    }
  });

  // Tradução de atributos "placeholder" em inputs
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (translations[key]) {
      el.setAttribute('placeholder', translations[key]);
    }
  });
}

loadTranslation(lang);
// --

const connectivityTestURLs = {
  "Android": "http://clients3.google.com/generate_204",
  "Windows": "http://www.msftconnecttest.com/connecttest.txt",
  "Mac":     "http://captive.apple.com/hotspot-detect.html",
  "iOS":     "http://captive.apple.com/hotspot-detect.html",
  "Linux":   "http://www.gstatic.com/generate_204"
};

const toggleModal = () => {
  //[modal, fade].forEach((el) => el.classList.toggle("hide"));
  modal.classList.toggle("hide");
  fade.classList.toggle("hide");
};

[openModalButton, closeModalButton].forEach((el) => {
  el.addEventListener("click", (event) => {
    event.preventDefault()
    toggleModal()
  });
});

// Envio do formulário
document.getElementById('main-form').addEventListener('submit', async function(event) {
  event.preventDefault();

  // URL de Requisição
  const apiBaseUrl = window.location.protocol === "https:" 
    ? "https://unificonnect.intranet.albras.ind.br"
    : "http://unificonnect.intranet.albras.ind.br";
  let url = `${apiBaseUrl}/api/client/connect?form`;

  // Monta o objeto JSON
  let data = {}

  // Pega os valores dos campos pelo id
  const name = document.getElementById('name').value;
  const visited = document.getElementById('visited').value;
  const company = document.getElementById('company').value;
  const code = document.getElementById('code').value;
  
  if (code.trim() === "") { 
    data = { 
      full_name: name,
      email: "---",
      phone: "---",
      fields: {company: company, visited: visited},
      approver_code: null,
    }
  }

  else {
    data = { 
      full_name: name,
      email: "---",
      phone: "---",
      fields: {company: company, visited: visited},
      approver_code: code,
    }
  }

  // Envia a requisição via fetch usando o método POST
  let response = await fetch(url, { 
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })

  if (response.ok) {
    if (code.trim() !== "") {
      mostrarModal(langObject.msgModalTitleOk, langObject.msgModalBodyOk);
      checkClientStatus()
    }
    
    else {
      mostrarModal(langObject.msgModalTitlePending, langObject.msgModalBodyPending, false);
      checkClientStatus()
    }

  } else {
    mostrarModal(langObject.msgModalTitleRefused, langObject.msgModalBodyRefused);
  }

  }
);

// Ocultando automaticamente o campo
document.getElementById('code').addEventListener('input', () => {
    const codeField = document.getElementById('code');
    const inputField = document.getElementById('visited');
    const inputVisited = document.getElementById('inputVisited');


    if( codeField.value.trim() !== '' ) { 
      inputVisited.style.display = 'none'
      inputField.style.display = 'none'
      inputField.removeAttribute("required") 
    }
    else { 
      inputVisited.style.display = 'block' 
      inputField.style.display = 'block'
      inputField.toggleAttribute("required") 
    }

});


// Exibe o modal com a mensagem de erro
function mostrarModal(titulo, mensagem, mostrar_btn = true) {
  document.getElementById('error_title').innerText = titulo;
  document.getElementById('error_texto').innerText = mensagem;
  document.getElementById('error_mensagem').style.display = 'flex';
  document.getElementById('error_mensagem').style.display = 'block';


  if (!mostrar_btn) {
      document.getElementById('error_btn').style.display = 'none'
  }
}

// Fecha o modal
function fecharModal() {
  document.getElementById('error_mensagem').style.display = 'none';
}


function getDeviceType() {
  const ua = navigator.userAgent || navigator.vendor || window.opera;
  
  if (ua.indexOf("Windows") !== -1) {
    return "Windows";
  }
  if (ua.indexOf("Macintosh") !== -1 || ua.indexOf("Mac OS") !== -1) {
    return "Mac";
  }
  if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) {
    return "iOS";
  }
  if (ua.indexOf("Android") !== -1) {
    return "Android";
  }
  if (ua.indexOf("Linux") !== -1) {
    return "Linux";
  }
  return "Unknown";
}


function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}


async function redirectUrl() {
  const cookies = document.cookie.split("; ");

  const urlCookie = cookies.find(cookie => cookie.startsWith("url="));

  const url = decodeURIComponent( urlCookie.split("=")[1] );
  console.log(url)

  var iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.src = url;

  iframe.onload = function() {
    setTimeout(() => {
      window.close();
    }, 1000);
  };

  iframe.onerror = function() {
    console.error('Erro ao carregar o iframe.');
  };

  document.body.appendChild(iframe);
  
  setTimeout(() => {
    mostrarModal("Teste", "Teste")
    window.close();
    window.location.href = url;
  }, 3000);
}


async function checkClientStatus() {
    const macAddress = getCookie("id"); // Obtém o MAC do cookie correto

    const apiBaseUrl = window.location.protocol === "https:" 
    ? "https://unificonnect.intranet.albras.ind.br"
    : "http://unificonnect.intranet.albras.ind.br";
    const endpoint = `${apiBaseUrl}/api/client/${macAddress}/status`;

    while (true) {
      const response = await fetch(endpoint, { method: 'GET' });
      let status = await response.text();
      status = status?.trim().replace(/^"|"$/g, ""); 
      console.log(status);

      if (status === "Approved") {
        await testInternetConnectivity();
        await redirectUrl();
        break
      }

      else if (status === "Reject") {
        console.log("Cliente rejeitado. Fechando o navegador...");
        window.close();
        break
      }
    }

}
  

async function testInternetConnectivity() {
  const deviceType = getDeviceType();
  const url = connectivityTestURLs[deviceType];

  while (true) {
    const response =  fetch(url, { method: "GET" });
    if ( response.status === 204 || response.status === 200 || response.status === 201 || response.status === 202 ) { break }
  }
}
