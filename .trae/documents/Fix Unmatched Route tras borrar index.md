## Problema
- Al borrar `app/(tabs)/index.tsx`, la ruta raíz `/` ya no tiene pantalla asociada y Expo Router muestra "Unmatched Route".

## Solución propuesta
1. Crear una pantalla de redirección para la raíz:
   - Archivo: `app/index.tsx`
   - Contenido:
     ```tsx
     import { Redirect } from 'expo-router';
     export default function RootRedirect() {
       return <Redirect href="/citas" />;
     }
     ```
   - Con esto, cualquier acceso a `/` redirige a la pestaña "Agenda" (`/citas`).

2. Asegurar que las tabs abran en "citas":
   - En `app/(tabs)/_layout.tsx`, establecer `initialRouteName="citas"` en el componente `Tabs` (soportado por React Navigation). Esto garantiza que dentro del grupo `(tabs)` la inicial sea `citas`.

3. Mantener oculta cualquier ruta de índice dentro de `(tabs)`: 
   - No volver a añadir `app/(tabs)/index.tsx`. La redirección desde `app/index.tsx` es suficiente y evita que aparezca un tab extra.

## Verificación
- Iniciar el proyecto: `npx expo start`.
- Abrir la app o el navegador: la raíz debe redirigir directamente a `/citas` y mostrar la barra personalizada sin "Unmatched Route".
- Navegar entre tabs para confirmar que no existen rutas rotas.

## Opcional
- Si prefieres abrir en otra tab, cambia `href` a `"/proyectos"` o `"/perfil"` en `app/index.tsx`.

¿Confirmas que redirijamos la raíz a `/citas` y añadamos `initialRouteName`? 