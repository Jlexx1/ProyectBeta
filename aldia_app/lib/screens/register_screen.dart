import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/api_service.dart';
import '../services/auth_service.dart';
import 'login_screen.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nombreController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _passwordConfirmController = TextEditingController();
  final _subdomainController = TextEditingController();
  String? _error;
  bool _subdomainAvailable = false;
  bool _checkingSubdomain = false;

  @override
  void dispose() {
    _nombreController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _passwordConfirmController.dispose();
    _subdomainController.dispose();
    super.dispose();
  }

  Future<void> _checkSubdomain() async {
    final slug = _subdomainController.text.trim().toLowerCase();
    if (slug.length < 3) return;
    setState(() => _checkingSubdomain = true);
    try {
      final api = context.read<AuthService>() as dynamic;
      final apiService = api._api as ApiService;
      final result = await apiService.checkSubdomain(slug);
      setState(() => _subdomainAvailable = result['disponible'] == true);
    } catch (_) {
      setState(() => _subdomainAvailable = false);
    } finally {
      setState(() => _checkingSubdomain = false);
    }
  }

  Future<void> _register() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _error = null);
    try {
      await context.read<AuthService>().register(
        nombreNegocio: _nombreController.text.trim(),
        email: _emailController.text.trim(),
        password: _passwordController.text,
        passwordConfirmation: _passwordConfirmController.text,
        subdominio: _subdomainController.text.trim().toLowerCase(),
      );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Cuenta creada exitosamente. Ahora iniciá sesión.')),
      );
      Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const LoginScreen()));
    } catch (e) {
      setState(() => _error = e.toString().replaceFirst('Exception: ', ''));
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthService>();
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(title: const Text('Crear cuenta')),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Container(
            padding: const EdgeInsets.all(32),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF161F36) : Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: isDark ? const Color(0xFF233048) : const Color(0xFFE2E8F0)),
            ),
            child: Form(
              key: _formKey,
              child: Column(
                children: [
                  Text('Crear tu cuenta',
                    style: TextStyle(fontSize: 22, fontWeight: FontWeight.w700,
                      color: isDark ? const Color(0xFFF8FAFC) : const Color(0xFF0F172A))),
                  const SizedBox(height: 4),
                  Text('Empezá a vender en menos de 2 minutos',
                    style: TextStyle(fontSize: 14,
                      color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B))),
                  const SizedBox(height: 24),
                  TextFormField(
                    controller: _nombreController,
                    decoration: const InputDecoration(labelText: 'Nombre del negocio'),
                    validator: (v) => v == null || v.trim().isEmpty ? 'Requerido' : null,
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _emailController,
                    decoration: const InputDecoration(labelText: 'Email'),
                    keyboardType: TextInputType.emailAddress,
                    validator: (v) {
                      if (v == null || v.trim().isEmpty) return 'Requerido';
                      if (!v.contains('@')) return 'Email inválido';
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _subdomainController,
                    decoration: InputDecoration(
                      labelText: 'Subdominio',
                      hintText: 'tunegocio',
                      suffixIcon: _checkingSubdomain
                          ? const SizedBox(width: 20, height: 20, child: Center(child: CircularProgressIndicator(strokeWidth: 2)))
                          : _subdomainController.text.length >= 3
                              ? Icon(_subdomainAvailable ? Icons.check_circle : Icons.cancel,
                                  color: _subdomainAvailable ? Colors.green : Colors.red, size: 20)
                              : null,
                    ),
                    onChanged: (_) => _checkSubdomain(),
                    validator: (v) => v == null || v.trim().length < 3 ? 'Mínimo 3 caracteres' : null,
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _passwordController,
                    decoration: const InputDecoration(labelText: 'Contraseña'),
                    obscureText: true,
                    validator: (v) => v == null || v.length < 8 ? 'Mínimo 8 caracteres' : null,
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _passwordConfirmController,
                    decoration: const InputDecoration(labelText: 'Confirmar contraseña'),
                    obscureText: true,
                    validator: (v) => v != _passwordController.text ? 'Las contraseñas no coinciden' : null,
                  ),
                  if (_error != null) ...[
                    const SizedBox(height: 16),
                    Text(_error!, style: const TextStyle(color: Colors.red, fontSize: 14)),
                  ],
                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: auth.loading ? null : _register,
                      child: Text(auth.loading ? 'Creando cuenta…' : 'Crear cuenta gratis'),
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextButton(
                    onPressed: () => Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const LoginScreen())),
                    child: const Text('¿Ya tenés cuenta? Iniciar sesión'),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
