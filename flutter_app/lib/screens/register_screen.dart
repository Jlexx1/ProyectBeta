import 'package:flutter/material.dart';
import '../services/api_service.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _nombreCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  final _confirmCtrl = TextEditingController();
  final _subdomCtrl = TextEditingController();
  bool _loading = false;
  bool _termAccepted = false;
  String? _error;
  String? _success;

  Future<void> _register() async {
    if (!_termAccepted) {
      setState(() => _error = 'Debe aceptar los terminos y condiciones.');
      return;
    }
    setState(() { _loading = true; _error = null; _success = null; });
    try {
      final res = await ApiService.register({
        'nombre_negocio': _nombreCtrl.text,
        'email': _emailCtrl.text,
        'password': _passCtrl.text,
        'password_confirmation': _confirmCtrl.text,
        'subdominio': _subdomCtrl.text,
      });
      if (res['message'] != null && (res['message'] as String).contains('exitosa')) {
        setState(() => _success = 'Cuenta creada exitosamente.');
        _nombreCtrl.clear(); _emailCtrl.clear(); _passCtrl.clear();
        _confirmCtrl.clear(); _subdomCtrl.clear();
      } else {
        setState(() => _error = res['message'] ?? 'Error al crear la cuenta.');
      }
    } catch (_) {
      setState(() => _error = 'Error de conexion con el servidor.');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  void dispose() {
    _nombreCtrl.dispose(); _emailCtrl.dispose(); _passCtrl.dispose();
    _confirmCtrl.dispose(); _subdomCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Crear cuenta')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (_error != null) Container(
              padding: const EdgeInsets.all(12),
              margin: const EdgeInsets.only(bottom: 16),
              decoration: BoxDecoration(color: Colors.red[50], borderRadius: BorderRadius.circular(8)),
              child: Text(_error!, style: const TextStyle(color: Colors.red)),
            ),
            if (_success != null) Container(
              padding: const EdgeInsets.all(12),
              margin: const EdgeInsets.only(bottom: 16),
              decoration: BoxDecoration(color: Colors.green[50], borderRadius: BorderRadius.circular(8)),
              child: Text(_success!, style: const TextStyle(color: Colors.green)),
            ),
            TextField(controller: _nombreCtrl, decoration: const InputDecoration(labelText: 'Nombre del negocio', prefixIcon: Icon(Icons.store))),
            const SizedBox(height: 16),
            TextField(controller: _emailCtrl, decoration: const InputDecoration(labelText: 'Email', prefixIcon: Icon(Icons.email)), keyboardType: TextInputType.emailAddress),
            const SizedBox(height: 16),
            TextField(controller: _passCtrl, decoration: const InputDecoration(labelText: 'Contrasena', prefixIcon: Icon(Icons.lock)), obscureText: true),
            const SizedBox(height: 16),
            TextField(controller: _confirmCtrl, decoration: const InputDecoration(labelText: 'Confirmar contrasena', prefixIcon: Icon(Icons.lock_outline)), obscureText: true),
            const SizedBox(height: 16),
            TextField(controller: _subdomCtrl, decoration: const InputDecoration(labelText: 'Subdominio', prefixIcon: Icon(Icons.language), helperText: 'Ej: mi-negocio.aldia.com.pe')),
            const SizedBox(height: 16),
            CheckboxListTile(
              value: _termAccepted,
              onChanged: (v) => setState(() => _termAccepted = v ?? false),
              title: const Text('Acepto los terminos y condiciones', style: TextStyle(fontSize: 14)),
              controlAffinity: ListTileControlAffinity.leading,
            ),
            const SizedBox(height: 16),
            SizedBox(
              height: 50,
              child: FilledButton(
                onPressed: _loading ? null : _register,
                child: _loading ? const CircularProgressIndicator(strokeWidth: 2, color: Colors.white) : const Text('Crear cuenta gratis'),
              ),
            ),
            const SizedBox(height: 16),
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Ya tengo una cuenta. Iniciar sesion'),
            ),
          ],
        ),
      ),
    );
  }
}
