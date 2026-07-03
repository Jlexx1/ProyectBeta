import 'package:flutter/material.dart';
import 'screens/login_screen.dart';
import 'screens/register_screen.dart';
import 'screens/dashboard_screen.dart';
import 'screens/data_viewer_screen.dart';

void main() => runApp(const AldiaApp());

class AldiaApp extends StatelessWidget {
  const AldiaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'ALDIA',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorSchemeSeed: const Color(0xFF2563EB),
        useMaterial3: true,
        brightness: Brightness.light,
      ),
      initialRoute: '/login',
      routes: {
        '/login': (_) => const LoginScreen(),
        '/register': (_) => const RegisterScreen(),
        '/dashboard': (_) => const DashboardScreen(),
        '/data': (_) => const DataViewerScreen(),
      },
    );
  }
}
