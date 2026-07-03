import 'package:flutter/material.dart';
import '../services/api_service.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailCtrl = TextEditingController(text: 'admin@aldia.com');
  final _passCtrl = TextEditingController(text: 'Admin123!');
  bool _loading = false;
  String? _error;

  Future<void> _login() async {
    setState(() { _loading = true; _error = null; });
    try {
      final res = await ApiService.login(_emailCtrl.text, _passCtrl.text);
      if (res['token'] != null) {
        await ApiService.saveToken(res['token']);
        if (mounted) Navigator.pushReplacementNamed(context, '/dashboard');
      } else {
        setState(() => _error = res['message'] ?? 'Error al iniciar sesion');
      }
    } catch (_) {
      setState(() => _error = 'Error de conexion con el servidor.');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  void dispose() {
    _emailCtrl.dispose();
    _passCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Card(
            elevation: 0,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            child: Padding(
              padding: const EdgeInsets.all(32),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text('ALDIA', style: Theme.of(context).textTheme.headlineLarge?.copyWith(fontWeight: FontWeight.w800)),
                  const SizedBox(height: 4),
                  Text('Iniciar sesion', style: Theme.of(context).textTheme.titleMedium?.copyWith(color: Colors.grey[600])),
                  const SizedBox(height: 24),
                  if (_error != null) Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(color: Colors.red[50], borderRadius: BorderRadius.circular(8)),
                    child: Text(_error!, style: const TextStyle(color: Colors.red, fontSize: 13)),
                  ),
                  if (_error != null) const SizedBox(height: 16),
                  TextField(
                    controller: _emailCtrl,
                    decoration: const InputDecoration(labelText: 'Email', prefixIcon: Icon(Icons.email_outlined)),
                    keyboardType: TextInputType.emailAddress,
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: _passCtrl,
                    decoration: const InputDecoration(labelText: 'Contrasena', prefixIcon: Icon(Icons.lock_outlined)),
                    obscureText: true,
                  ),
                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: FilledButton(
                      onPressed: _loading ? null : _login,
                      child: _loading ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) : const Text('Ingresar al panel'),
                    ),
                  ),
                  const SizedBox(height: 16),
                  TextButton(
                    onPressed: () => Navigator.pushNamed(context, '/register'),
                    child: const Text('Crear cuenta gratis'),
                  ),
                  const SizedBox(height: 8),
                  Text('Demo: admin@aldia.com / Admin123!', style: TextStyle(color: Colors.grey[400], fontSize: 12)),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
