import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'config/theme.dart';
import 'services/api_service.dart';
import 'services/auth_service.dart';
import 'screens/landing_screen.dart';
import 'screens/dashboard_screen.dart';

void main() {
  runApp(const AldiaApp());
}

class AldiaApp extends StatelessWidget {
  const AldiaApp({super.key});

  @override
  Widget build(BuildContext context) {
    final apiService = ApiService();

    return ChangeNotifierProvider(
      create: (_) => AuthService(apiService)..init(),
      child: MaterialApp(
        title: 'ALDIA',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.light(),
        darkTheme: AppTheme.dark(),
        themeMode: ThemeMode.system,
        home: const _SplashGate(),
      ),
    );
  }
}

class _SplashGate extends StatefulWidget {
  const _SplashGate();

  @override
  State<_SplashGate> createState() => _SplashGateState();
}

class _SplashGateState extends State<_SplashGate> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _checkAuth());
  }

  Future<void> _checkAuth() async {
    final auth = context.read<AuthService>();
    await auth.init();
    if (auth.isLoggedIn && mounted) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const DashboardScreen()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return const LandingScreen();
  }
}
