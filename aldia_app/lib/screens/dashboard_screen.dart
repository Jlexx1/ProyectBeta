import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../config/theme.dart';
import '../services/auth_service.dart';
import 'pos_screen.dart';
import 'products_screen.dart';
import 'landing_screen.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthService>();
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final user = auth.user;

    return Scaffold(
      appBar: AppBar(
        title: Text(user?.nombreNegocio ?? 'ALDIA'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            tooltip: 'Cerrar sesión',
            onPressed: () async {
              await auth.logout();
              if (!context.mounted) return;
              Navigator.pushAndRemoveUntil(
                context,
                MaterialPageRoute(builder: (_) => const LandingScreen()),
                (_) => false,
              );
            },
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _HeaderCard(userName: user?.nombreNegocio ?? 'Usuario', email: user?.email ?? ''),
          const SizedBox(height: 20),
          _QuickActions(),
          const SizedBox(height: 20),
          _buildInfoSection(context, isDark),
        ],
      ),
    );
  }

  Widget _buildInfoSection(BuildContext context, bool isDark) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Bienvenido a ALDIA',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700,
                color: isDark ? const Color(0xFFF8FAFC) : const Color(0xFF0F172A))),
            const SizedBox(height: 8),
            Text('Usá los accesos rápidos para ir al POS, gestionar productos o revisar tu stock. Todo sincronizado desde cualquier dispositivo.',
              style: TextStyle(fontSize: 14, height: 1.5,
                color: isDark ? const Color(0xFFCBD5E1) : const Color(0xFF374151))),
          ],
        ),
      ),
    );
  }
}

class _HeaderCard extends StatelessWidget {
  final String userName;
  final String email;
  const _HeaderCard({required this.userName, required this.email});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [AppTheme.primary, AppTheme.primaryHover],
        ),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 24,
            backgroundColor: Colors.white.withValues(alpha: 0.2),
            child: Text(userName.isNotEmpty ? userName[0].toUpperCase() : 'U',
              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: Colors.white)),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(userName,
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: Colors.white)),
                Text(email,
                  style: TextStyle(fontSize: 13, color: Colors.white.withValues(alpha: 0.8))),
              ],
            ),
          ),
          Icon(Icons.account_circle, size: 36, color: Colors.white.withValues(alpha: 0.3)),
        ],
      ),
    );
  }
}

class _QuickActions extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final actions = [
      _ActionItem('Punto de Venta', Icons.point_of_sale, AppTheme.primary, () {
        Navigator.push(context, MaterialPageRoute(builder: (_) => const PosScreen()));
      }),
      _ActionItem('Productos', Icons.inventory_2, Colors.orange, () {
        Navigator.push(context, MaterialPageRoute(builder: (_) => const ProductsScreen()));
      }),
      _ActionItem('Stock', Icons.inventory, const Color(0xFF10B981), () {
        Navigator.push(context, MaterialPageRoute(builder: (_) => const ProductsScreen()));
      }),
      _ActionItem('Reportes', Icons.bar_chart, Colors.purple, () {}),
    ];

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        childAspectRatio: 1.3,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
      ),
      itemCount: actions.length,
      itemBuilder: (_, i) {
        final a = actions[i];
        return Card(
          child: InkWell(
            borderRadius: BorderRadius.circular(12),
            onTap: a.onTap,
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: a.color.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Icon(a.icon, color: a.color, size: 24),
                  ),
                  const Spacer(),
                  Text(a.title,
                    style: TextStyle(
                      fontSize: 15, fontWeight: FontWeight.w700,
                      color: isDark ? const Color(0xFFF8FAFC) : const Color(0xFF0F172A))),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}

class _ActionItem {
  final String title;
  final IconData icon;
  final Color color;
  final VoidCallback onTap;
  _ActionItem(this.title, this.icon, this.color, this.onTap);
}
