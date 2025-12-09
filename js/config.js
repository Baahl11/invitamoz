// ============================================
// CONFIGURACIÓN - IMPORTANTE: Completa esto antes de usar
// ============================================

// 1. Configuración de Supabase
const CONFIG = {
    // Obtén estos valores de tu proyecto Supabase:
    // Settings → API → Project URL y anon/public key
    SUPABASE_URL: 'https://wtpxsxeyaejeaofabnyj.supabase.co',
    SUPABASE_ANON_KEY: 'sb_publishable_ZBEKmRjR5MZtF3vmDhn95w_RxyctyqQ',
    
    // URL de tu sitio (actualizar después de deploy en Vercel)
    SITE_URL: 'https://tu-boda.vercel.app',             // ⚠️ ACTUALIZAR después del deploy
    
    // Configuración de la invitación
    EVENT_NAME: 'Boda Memo y Fabi - Bautizo Isabella',
    CONFIRM_BEFORE_DATE: '31 de Julio',
    
    // Auto-refresh del panel admin (en milisegundos)
    ADMIN_REFRESH_INTERVAL: 30000  // 30 segundos
};

// ============================================
// NO MODIFICAR DEBAJO DE ESTA LÍNEA
// ============================================

// Validar que la configuración esté completa
function validateConfig() {
    const errors = [];
    
    if (CONFIG.SUPABASE_URL.includes('TU-PROJECT-ID')) {
        errors.push('❌ Falta configurar SUPABASE_URL');
    }
    
    if (CONFIG.SUPABASE_ANON_KEY.includes('TU-SUPABASE-ANON-KEY')) {
        errors.push('❌ Falta configurar SUPABASE_ANON_KEY');
    }
    
    if (errors.length > 0) {
        console.error('⚠️ CONFIGURACIÓN INCOMPLETA:\n' + errors.join('\n'));
        console.error('\nRevisa el archivo config.js y completa todas las credenciales.');
        return false;
    }
    
    console.log('✅ Configuración validada correctamente');
    return true;
}

// Exportar configuración
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
