// ============================================
// GUEST MANAGER - Manejo de invitados y confirmaciones
// ============================================

const SUPABASE_URL = 'https://wtpxsxeyaejeaofabnyj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_ZBEKmRjR5MZtF3vmDhn95w_RxyctyqQ';

// Cliente de Supabase (usa CDN)
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

// ============================================
// OBTENER INVITADO DESDE URL
// ============================================
async function loadGuestInfo() {
    // Obtener parámetro ?guest=codigo desde la URL
    const urlParams = new URLSearchParams(window.location.search);
    const guestCode = urlParams.get('guest');
    
    if (!guestCode) {
        showGenericInvitation();
        return;
    }
    
    try {
        // Buscar invitado en Supabase
        const { data, error } = await supabaseClient
            .from('guests')
            .select('*')
            .eq('guest_code', guestCode)
            .single();
        
        if (error || !data) {
            console.error('Invitado no encontrado:', error);
            showGenericInvitation();
            return;
        }
        
        // Personalizar la página
        displayGuestInfo(data);
        setupConfirmationForm(data);
        
    } catch (err) {
        console.error('Error cargando invitado:', err);
        showGenericInvitation();
    }
}

// ============================================
// MOSTRAR INFORMACIÓN PERSONALIZADA
// ============================================
function displayGuestInfo(guest) {
    console.log('Mostrando info del invitado:', guest);

    // Nombre en saludo superior
    const guestNameTop = document.getElementById('guest-name-top');
    if (guestNameTop) {
        guestNameTop.textContent = guest.name;
    }

    // Nombre en sección RSVP
    const guestNameRsvp = document.getElementById('guest-name-rsvp');
    if (guestNameRsvp) {
        guestNameRsvp.textContent = guest.name;
    }

    // Texto de pases en la franja "HEMOS ASIGNADO PARA TI"
    const pasesBadge = document.querySelector('#pases .elementor-shortcode');
    if (pasesBadge) {
        const passText = guest.passes === 1 ? 'PASE' : 'PASES';
        pasesBadge.textContent = `${guest.passes} ${passText}`;
    }

    // Si ya confirmó, mostrar mensaje
    if (guest.confirmed) {
        showAlreadyConfirmed(guest);
    }
}

// ============================================
// INVITACIÓN GENÉRICA (sin código)
// ============================================
function showGenericInvitation() {
    const guestNameElement = document.getElementById('guest-name');
    if (guestNameElement) {
        guestNameElement.textContent = 'Estimado invitado';
    }
    
    const passesElement = document.getElementById('guest-passes');
    if (passesElement) {
        passesElement.textContent = 'Por favor contacta al organizador para confirmar tu asistencia';
    }
    
    // Ocultar formulario si no hay código válido
    const form = document.getElementById('confirmation-form');
    if (form) {
        form.style.display = 'none';
    }
}

// ============================================
// FORMULARIO DE CONFIRMACIÓN
// ============================================
function setupConfirmationForm(guest) {
    const form = document.getElementById('confirmation-form');
    if (!form) {
        console.error('No se encontró el formulario de confirmación');
        return;
    }
    
    console.log('Configurando formulario para:', guest);
    
    // Crear opciones de asistentes
    const attendingSelect = document.getElementById('attending-count');
    if (attendingSelect) {
        attendingSelect.innerHTML = '';
        
        if (guest.passes === 1) {
            // Para 1 pase: solo "Asistiré" o "No asistiré"
            const optionNo = document.createElement('option');
            optionNo.value = 0;
            optionNo.textContent = 'No asistiré';
            attendingSelect.appendChild(optionNo);
            
            const optionYes = document.createElement('option');
            optionYes.value = 1;
            optionYes.textContent = 'Asistiré';
            attendingSelect.appendChild(optionYes);
        } else {
            // Para múltiples pases: mostrar número de personas
            for (let i = 0; i <= guest.passes; i++) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = i === 0 ? 'No asistiré' : `${i} ${i === 1 ? 'persona' : 'personas'}`;
                attendingSelect.appendChild(option);
            }
        }
        
        console.log('Opciones de asistencia creadas:', attendingSelect.options.length);
    } else {
        console.error('No se encontró el select #attending-count');
    }
    
    // Manejar envío del formulario
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await submitConfirmation(guest, form);
    });
}

// ============================================
// ENVIAR CONFIRMACIÓN
// ============================================
async function submitConfirmation(guest, form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    try {
        // Deshabilitar botón
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando...';
        
        // Obtener datos del formulario
        const attending = parseInt(document.getElementById('attending-count').value);
        const message = document.getElementById('guest-message')?.value || '';
        
        // Actualizar en Supabase
        const { data, error } = await supabaseClient
            .from('guests')
            .update({
                confirmed: true,
                attending: attending,
                message: message,
                confirmed_at: new Date().toISOString()
            })
            .eq('id', guest.id);
        
        if (error) throw error;
        
        // Mostrar mensaje de éxito
        showSuccessMessage(attending);
        form.style.display = 'none';
        
    } catch (err) {
        console.error('Error al confirmar:', err);
        alert('Hubo un error al enviar tu confirmación. Por favor intenta de nuevo.');
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

// ============================================
// MENSAJES DE ESTADO
// ============================================
function showSuccessMessage(attending) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'confirmation-success';
    messageDiv.innerHTML = `
        <h3>✅ ¡Confirmación recibida!</h3>
        <p>${attending > 0 
            ? `Nos vemos el día del evento. ¡Gracias por confirmar!` 
            : 'Lamentamos que no puedas asistir. ¡Gracias por avisar!'}</p>
    `;
    
    const container = document.getElementById('confirmation-container');
    if (container) {
        container.appendChild(messageDiv);
    }
}

function showAlreadyConfirmed(guest) {
    const form = document.getElementById('confirmation-form');
    if (form) {
        form.style.display = 'none';
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'already-confirmed';
    messageDiv.innerHTML = `
        <h3>Ya confirmaste tu asistencia</h3>
        <p>${guest.attending > 0 
            ? `Confirmaste para ${guest.attending} ${guest.attending === 1 ? 'persona' : 'personas'}` 
            : 'Confirmaste que no asistirás'}</p>
        <p><small>Si necesitas hacer cambios, contacta al organizador.</small></p>
    `;
    
    const container = document.getElementById('confirmation-container');
    if (container) {
        container.appendChild(messageDiv);
    }
}

// ============================================
// INICIALIZAR AL CARGAR LA PÁGINA
// ============================================
if (document.readyState === 'loading') {
    // El DOM aún está cargando
    document.addEventListener('DOMContentLoaded', loadGuestInfo);
} else {
    // El DOM ya está listo
    loadGuestInfo();
}

console.log('Guest manager script cargado');
