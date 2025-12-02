/**
 * Paleta de colores unificada con el Frontend de Conv3rTech
 * Adaptada a Modo Claro (Fondo Blanco)
 */

export const AppColors = {
  // Colores principales (Brand)
  dark: "#00012A",      // conv3r-dark: Ahora usado para textos principales y elementos oscuros
  gold: "#FFB300",      // conv3r-gold: Acentos, botones principales, logos
  textPrimary: "#00012A", // Texto oscuro para fondo blanco
  textSecondary: "#718096", // Gris medio para textos secundarios

  // Colores de UI
  background: "#FFFFFF", // Fondo de pantalla BLANCO
  panel: "#F7FAFC",      // Fondo de paneles laterales / headers (gris muy claro)
  card: "#FFFFFF",       // Fondo de tarjetas blanco
  inputBg: "#EDF2F7",    // Fondo de inputs gris claro
  border: "#E2E8F0",     // Bordes gris claro
  
  // Estados
  success: "#10B981", // Emerald 500
  error: "#EF4444",   // Red 500
  warning: "#F59E0B", // Amber 500
  info: "#3B82F6",    // Blue 500
  
  // TabBar / Navegación
  tabBarBackground: "rgba(255, 255, 255, 0.85)", // Blur background blanco
  active: "#FFB300", // Icono activo (Gold)
  inactive: "#A0AEC0", // Icono inactivo
};

export const Colors = {
  light: {
    text: AppColors.textPrimary,
    background: AppColors.background,
    tint: AppColors.gold,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: AppColors.gold,
  },
  dark: {
    text: AppColors.textPrimary,
    background: AppColors.background,
    tint: AppColors.gold,
    icon: '#9BA1A6',
    tabIconDefault: AppColors.textSecondary,
    tabIconSelected: AppColors.gold,
  },
};
