## Problema
- En iOS el navbar no navega a Proyectos y los íconos se cortan.

## Principios
- Mantener apariencia y comportamiento en Android intactos.
- Aplicar ajustes específicos a iOS con `Platform.select` y `SafeArea`.

## Cambios propuestos (solo iOS)
1. Navegación del tab
- Reemplazar en `renderTabBar` el `onPress` por:
  ```ts
  const onPress = () => {
    const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
    if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
  };
  ```
- Seguro en ambas plataformas, pero corrige inconsistencias en iOS.

2. Layout del navbar con Safe Area
- Envolver el contenedor del navbar con `SafeAreaView` y aplicar estilos condicionales:
  - iOS: `position: 'absolute', bottom: 8`, `paddingBottom: insets.bottom`, `minHeight: 72`, `justifyContent: 'space-around'`.
  - Android: conservar estilos actuales.

3. Espaciado y altura de ítems
- `barItem` con `Platform.select`:
  - iOS: `minHeight: 44`, `paddingVertical: 10`.
  - Android: valores actuales.

4. Glare y superposición
- Establecer `zIndex: -1` para el `styles.glare` (o reducir `height` a 12) para evitar cubrir íconos.
- Contenedor del navbar con `pointerEvents: 'box-none'` para que no bloquee toques.

## Verificación
- iOS: probar navegación a `Proyectos` y `Perfil`, confirmar que no hay recortes.
- Android: revisar que la barra mantenga el diseño actual sin cambios.

¿Confirmas aplicar estos cambios específicos para iOS manteniendo Android igual?