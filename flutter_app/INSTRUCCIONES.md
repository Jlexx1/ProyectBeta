# ALDIA App - Flutter

App movil para gestion de productos, login y visualizacion de datos.

## Requisitos

- Flutter SDK (https://flutter.dev)
- Servidor backend corriendo en localhost:3000

## Instalacion

```bash
cd flutter_app
flutter pub get
flutter run
```

## Notas

- La app se conecta a `http://10.0.2.2:3000/api` (Android emulator).
  Para iOS simulator usar `http://localhost:3000/api`.
  Para dispositivo fisico usar la IP local de tu PC.

## Estructura

```
lib/
  main.dart                  - Inicio de la app
  models/product.dart        - Modelo de producto
  services/api_service.dart  - Servicio HTTP para la API
  screens/
    login_screen.dart        - Pantalla de inicio de sesion
    register_screen.dart     - Pantalla de registro
    dashboard_screen.dart    - CRUD de productos
    data_viewer_screen.dart  - Visor de base de datos
```
