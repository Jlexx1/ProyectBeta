import 'package:flutter/material.dart';
import '../config/theme.dart';
import 'login_screen.dart';
import 'register_screen.dart';

class LandingScreen extends StatelessWidget {
  const LandingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      body: SingleChildScrollView(
        child: Column(
          children: [
            _HeroSection(isDark: isDark),
            _BadgeBar(),
            _FeaturesSection(),
            _HowItWorksSection(isDark: isDark),
            _CTASection(),
          ],
        ),
      ),
    );
  }
}

class _HeroSection extends StatelessWidget {
  final bool isDark;
  const _HeroSection({required this.isDark});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 60, 20, 40),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            isDark ? const Color(0xFF0F1729) : Colors.white,
            isDark ? const Color(0xFF0A1124) : const Color(0xFFF8FAFC),
          ],
        ),
      ),
      child: Column(
        children: [
          _Header(),
          const SizedBox(height: 40),
          _buildBadge(context),
          const SizedBox(height: 20),
          Text(
            'El punto de venta\nque ya está\nen la nube.',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 32,
              fontWeight: FontWeight.w800,
              height: 1.05,
              letterSpacing: -0.03,
              color: isDark ? const Color(0xFFF8FAFC) : const Color(0xFF0F172A),
            ),
          ),
          const SizedBox(height: 16),
          Text(
            'Ventas, stock y facturación AFIP desde cualquier dispositivo. Sin instalaciones, sin servidores, sin vueltas.',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 16,
              height: 1.5,
              color: isDark ? const Color(0xFFCBD5E1) : const Color(0xFF374151),
            ),
          ),
          const SizedBox(height: 24),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              TextButton(
                onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const LoginScreen())),
                style: TextButton.styleFrom(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                ),
                child: const Text('Iniciar sesión', style: TextStyle(fontSize: 14)),
              ),
              const SizedBox(width: 12),
              ElevatedButton(
                onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const RegisterScreen())),
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text('Empezar gratis — 14 días', style: TextStyle(fontSize: 14)),
                    SizedBox(width: 6),
                    Icon(Icons.arrow_forward, size: 16),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          _buildCheckItem('Sin tarjeta de crédito requerida'),
          const SizedBox(height: 8),
          _buildCheckItem('Configuración en menos de 5 minutos'),
          const SizedBox(height: 8),
          _buildCheckItem('Soporte en español desde el panel'),
        ],
      ),
    );
  }

  Widget _buildBadge(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: AppTheme.primarySoft,
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: Colors.blue.withValues(alpha: 0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
            decoration: BoxDecoration(
              color: AppTheme.primary,
              borderRadius: BorderRadius.circular(999),
            ),
            child: const Text('NUEVO', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w700, color: Colors.white, letterSpacing: 0.06)),
          ),
          const SizedBox(width: 8),
          Text('Facturación AFIP integrada',
            style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppTheme.primary)),
        ],
      ),
    );
  }

  Widget _buildCheckItem(String text) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(Icons.check_circle, size: 18, color: AppTheme.primary),
        const SizedBox(width: 8),
        Text(text, style: TextStyle(fontSize: 13, color: isDark ? const Color(0xFFCBD5E1) : const Color(0xFF374151))),
      ],
    );
  }
}

class _Header extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Row(
      children: [
        _AldiaLogo(size: 24),
        const SizedBox(width: 8),
        Text.rich(
          TextSpan(
            text: 'ALDIA',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w800,
              letterSpacing: -0.022,
              color: isDark ? const Color(0xFFF8FAFC) : const Color(0xFF0F172A),
            ),
            children: const [
              TextSpan(text: '.', style: TextStyle(color: Colors.blue)),
            ],
          ),
        ),
        const Spacer(),
        IconButton(
          icon: Icon(isDark ? Icons.light_mode : Icons.dark_mode, size: 20),
          onPressed: () {},
        ),
      ],
    );
  }
}

class _AldiaLogo extends StatelessWidget {
  final double size;
  const _AldiaLogo({this.size = 28});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size,
      height: size,
      child: CustomPaint(
        painter: _AldiaLogoPainter(),
        size: Size(size, size),
      ),
    );
  }
}

class _AldiaLogoPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..color = AppTheme.primary;
    final s = size.width / 96;

    _drawBar(canvas, paint, 14, 58, 89, size);
    _drawBar(canvas, paint, 24, 48, 135, size);
    _drawBar(canvas, paint, 34, 36, 181, size);
    _drawBar(canvas, paint, 44, 22, 227, size);

    paint.color = AppTheme.primary;
    final path = Path();
    path.moveTo(54 * s, 22 * s);
    path.lineTo(74 * s, 22 * s);
    path.cubicTo(79 * s, 22 * s, 83 * s, 26 * s, 83 * s, 31 * s);
    path.lineTo(83 * s, 51 * s);
    path.cubicTo(83 * s, 56 * s, 79 * s, 60 * s, 74 * s, 60 * s);
    path.lineTo(64 * s, 60 * s);
    canvas.drawPath(path, paint..style = PaintingStyle.stroke..strokeWidth = 7 * s..strokeCap = StrokeCap.round);

    canvas.drawRRect(RRect.fromRectAndRadius(Rect.fromLTWH(14 * s, 80 * s, 42 * s, 4 * s), Radius.circular(2 * s)), paint..style = PaintingStyle.fill);
  }

  void _drawBar(Canvas canvas, Paint paint, double x, double y, int alpha, Size size) {
    final s = size.width / 96;
    paint.color = AppTheme.primary.withValues(alpha: alpha / 255);
    canvas.drawRRect(RRect.fromRectAndRadius(Rect.fromLTWH(x * s, y * s, 6 * s, 22 * s), Radius.circular(3 * s)), paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class _BadgeBar extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 20),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9),
        border: Border(
          top: BorderSide(color: isDark ? const Color(0xFF233048) : const Color(0xFFE2E8F0)),
          bottom: BorderSide(color: isDark ? const Color(0xFF233048) : const Color(0xFFE2E8F0)),
        ),
      ),
      child: Wrap(
        spacing: 20,
        runSpacing: 12,
        alignment: WrapAlignment.center,
        children: [
          _badgeItem(context, Icons.check, 'Facturación AFIP real'),
          _badgeItem(context, Icons.inventory_2, 'Multi-sucursal'),
          _badgeItem(context, Icons.shield, 'Datos en la nube'),
          _badgeItem(context, Icons.arrow_back, 'Hecho en Argentina'),
        ],
      ),
    );
  }

  Widget _badgeItem(BuildContext context, IconData icon, String text) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 14, color: AppTheme.primary),
        const SizedBox(width: 6),
        Text(text,
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w600,
            letterSpacing: 0.05,
            color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
          )),
      ],
    );
  }
}

class _FeaturesSection extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final features = [
      ('punto_de_venta', 'POS y turnos de caja', 'Apertura, ventas y cierre con planilla PDF. Multi-caja y multi-sucursal.'),
      ('balance', 'PLU y venta por peso', 'Balanza integrada, precio por kg exacto con hasta 3 decimales. Sin pérdidas.'),
      ('inventory', 'Stock en tiempo real', 'Movimientos automáticos, alertas de mínimo y ajuste manual por sucursal.'),
      ('description', 'Facturación AFIP', 'Facturas A, B y C con CAE en segundos. Sin instalar nada.'),
      ('phone_android', 'Pedidos anticipados', 'WhatsApp, teléfono o presencial. Los pedidos llegan directos a la pantalla.'),
      ('bar_chart', 'Reportes y analytics', 'Ventas por período, ranking de productos, métodos de pago y stock valorizado.'),
      ('people', 'Clientes y fidelización', 'Historial de compras, categorías (Regular / Mayorista / VIP) y contacto rápido.'),
      ('security', 'Datos seguros en la nube', 'Backup automático diario. Accedé desde cualquier dispositivo sin perder nada.'),
    ];

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 48),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Todo lo que necesita tu comercio',
            style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, letterSpacing: 0.06, color: AppTheme.primary)),
          const SizedBox(height: 8),
          Text('Un POS pensado para el mostrador argentino.',
            style: TextStyle(fontSize: 28, fontWeight: FontWeight.w800, height: 1.06, letterSpacing: -0.025,
              color: isDark ? const Color(0xFFF8FAFC) : const Color(0xFF0F172A))),
          const SizedBox(height: 8),
          Text('Cada funcionalidad fue diseñada con los comerciantes, no para ellos.',
            style: TextStyle(fontSize: 15, color: isDark ? const Color(0xFFCBD5E1) : const Color(0xFF374151))),
          const SizedBox(height: 24),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              childAspectRatio: 1.1,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
            ),
            itemCount: features.length,
            itemBuilder: (_, i) {
              return Card(
                margin: EdgeInsets.zero,
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: AppTheme.primarySoft,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Icon(_iconMap(features[i].$1), size: 16, color: AppTheme.primary),
                      ),
                      const SizedBox(height: 8),
                      Text(features[i].$2,
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700,
                          color: isDark ? const Color(0xFFF8FAFC) : const Color(0xFF0F172A))),
                      const SizedBox(height: 4),
                      Expanded(
                        child: Text(features[i].$3,
                          style: TextStyle(fontSize: 10, height: 1.3,
                            color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B)),
                          overflow: TextOverflow.ellipsis, maxLines: 3),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  IconData _iconMap(String name) {
    switch (name) {
      case 'punto_de_venta': return Icons.point_of_sale;
      case 'balance': return Icons.balance;
      case 'inventory': return Icons.inventory_2;
      case 'description': return Icons.description;
      case 'phone_android': return Icons.phone_android;
      case 'bar_chart': return Icons.bar_chart;
      case 'people': return Icons.people;
      case 'security': return Icons.security;
      default: return Icons.circle;
    }
  }
}

class _HowItWorksSection extends StatelessWidget {
  final bool isDark;
  const _HowItWorksSection({required this.isDark});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 48),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF0A1124) : const Color(0xFFF8FAFC),
        border: Border(
          top: BorderSide(color: isDark ? const Color(0xFF233048) : const Color(0xFFE2E8F0)),
          bottom: BorderSide(color: isDark ? const Color(0xFF233048) : const Color(0xFFE2E8F0)),
        ),
      ),
      child: Column(
        children: [
          Text('Empezá hoy',
            style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, letterSpacing: 0.06, color: AppTheme.primary)),
          const SizedBox(height: 8),
          Text('En 3 pasos estás vendiendo.',
            style: TextStyle(fontSize: 28, fontWeight: FontWeight.w800, height: 1.08, letterSpacing: -0.025,
              color: isDark ? const Color(0xFFF8FAFC) : const Color(0xFF0F172A))),
          const SizedBox(height: 24),
          Row(
            children: [
              _stepCard(context, '1', 'Creás tu cuenta', 'Sin tarjeta, en menos de 2 minutos.'),
              const SizedBox(width: 12),
              _stepCard(context, '2', 'Configurás tu negocio', 'Sucursal, caja y tus primeros productos.'),
              const SizedBox(width: 12),
              _stepCard(context, '3', 'Vendés', 'Abrís el turno y empezás a cobrar.'),
            ],
          ),
          const SizedBox(height: 32),
          ElevatedButton(
            onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const RegisterScreen())),
            child: const Text('Crear mi cuenta gratis'),
          ),
          const SizedBox(height: 8),
          TextButton(
            onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const LoginScreen())),
            child: const Text('Iniciar sesión'),
          ),
        ],
      ),
    );
  }

  Widget _stepCard(BuildContext context, String number, String title, String desc) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Expanded(
      child: Column(
        children: [
          Container(
            width: 36, height: 36,
            decoration: BoxDecoration(
              color: AppTheme.primary,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Center(child: Text(number,
              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Colors.white))),
          ),
          const SizedBox(height: 8),
          Text(title,
            style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700,
              color: isDark ? const Color(0xFFF8FAFC) : const Color(0xFF0F172A))),
          const SizedBox(height: 4),
          Text(desc,
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 11, color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B))),
        ],
      ),
    );
  }
}

class _CTASection extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      padding: const EdgeInsets.all(32),
      child: Column(
        children: [
          Icon(Icons.archive, size: 48, color: AppTheme.primary),
          const SizedBox(height: 16),
          Text('¿Listo para digitalizar tu negocio?',
            style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800,
              color: isDark ? const Color(0xFFF8FAFC) : const Color(0xFF0F172A))),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const RegisterScreen())),
            style: ElevatedButton.styleFrom(
              padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
            ),
            child: const Text('Empezar ahora'),
          ),
          const SizedBox(height: 48),
          Text('ALDIA. - Punto de venta en la nube',
            style: TextStyle(fontSize: 12, color: isDark ? const Color(0xFF64748B) : const Color(0xFF94A3B8))),
        ],
      ),
    );
  }
}
