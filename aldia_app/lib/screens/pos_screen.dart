import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../config/theme.dart';
import '../models/product.dart';
import '../services/auth_service.dart';
import '../services/api_service.dart';

class PosScreen extends StatefulWidget {
  const PosScreen({super.key});

  @override
  State<PosScreen> createState() => _PosScreenState();
}

class _PosScreenState extends State<PosScreen> {
  List<Product> _products = [];
  final _cart = <_CartItem>[];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadProducts();
  }

  Future<void> _loadProducts() async {
    try {
      final api = ApiService();
      api.setToken(context.read<AuthService>().token);
      final products = await api.getProducts();
      setState(() {
        _products = products;
        _loading = false;
      });
    } catch (_) {
      setState(() => _loading = false);
    }
  }

  void _addToCart(Product product) {
    setState(() {
      final idx = _cart.indexWhere((e) => e.product.id == product.id);
      if (idx >= 0) {
        _cart[idx] = _CartItem(product, _cart[idx].quantity + 1);
      } else {
        _cart.add(_CartItem(product, 1));
      }
    });
  }

  double get _total => _cart.fold(0, (sum, item) => sum + item.product.price * item.quantity);

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Punto de Venta'),
        actions: [
          if (_cart.isNotEmpty)
            TextButton(
              onPressed: () => _showCartDialog(context),
              child: Text('Carrito (\$${_total.toStringAsFixed(0)})',
                style: const TextStyle(color: Colors.white)),
            ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _products.isEmpty
              ? const Center(child: Text('No hay productos. Agregalos desde el Dashboard.'))
              : GridView.builder(
                  padding: const EdgeInsets.all(12),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 3,
                    childAspectRatio: 0.85,
                    crossAxisSpacing: 8,
                    mainAxisSpacing: 8,
                  ),
                  itemCount: _products.length,
                  itemBuilder: (_, i) {
                    final p = _products[i];
                    return Card(
                      child: InkWell(
                        borderRadius: BorderRadius.circular(12),
                        onTap: () => _addToCart(p),
                        child: Padding(
                          padding: const EdgeInsets.all(10),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(p.name,
                                style: TextStyle(
                                  fontSize: 13, fontWeight: FontWeight.w600,
                                  color: isDark ? const Color(0xFFF8FAFC) : const Color(0xFF0F172A)),
                                maxLines: 2, overflow: TextOverflow.ellipsis),
                              const Spacer(),
                              Text('\$${p.price.toStringAsFixed(0)}',
                                style: TextStyle(
                                  fontSize: 16, fontWeight: FontWeight.w800,
                                  color: AppTheme.primary)),
                              if (p.stock > 0)
                                Text('Stock: ${p.stock}',
                                  style: TextStyle(fontSize: 11,
                                    color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B))),
                            ],
                          ),
                        ),
                      ),
                    );
                  },
                ),
      bottomNavigationBar: _cart.isEmpty
          ? null
          : Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF161F36) : Colors.white,
                border: Border(
                  top: BorderSide(color: isDark ? const Color(0xFF233048) : const Color(0xFFE2E8F0)),
                ),
              ),
              child: SafeArea(
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('${_cart.length} items',
                            style: TextStyle(fontSize: 12,
                              color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B))),
                          Text('\$${_total.toStringAsFixed(0)}',
                            style: TextStyle(
                              fontSize: 22, fontWeight: FontWeight.w800,
                              color: isDark ? const Color(0xFFF8FAFC) : const Color(0xFF0F172A))),
                        ],
                      ),
                    ),
                    ElevatedButton.icon(
                      onPressed: () => _showCartDialog(context),
                      icon: const Icon(Icons.shopping_cart, size: 18),
                      label: const Text('Ver carrito'),
                    ),
                  ],
                ),
              ),
            ),
    );
  }

  void _showCartDialog(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: isDark ? const Color(0xFF0F1729) : Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (_) {
        return StatefulBuilder(
          builder: (ctx, setSheetState) {
            return Padding(
              padding: EdgeInsets.only(
                left: 20, right: 20, top: 20,
                bottom: MediaQuery.of(context).viewInsets.bottom + 20,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Row(
                    children: [
                      Text('Carrito',
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700,
                          color: isDark ? const Color(0xFFF8FAFC) : const Color(0xFF0F172A))),
                      const Spacer(),
                      IconButton(
                        icon: const Icon(Icons.close),
                        onPressed: () => Navigator.pop(context),
                      ),
                    ],
                  ),
                  const Divider(),
                  if (_cart.isEmpty)
                    Padding(
                      padding: const EdgeInsets.all(32),
                      child: Text('Carrito vacío',
                        style: TextStyle(color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B))),
                    )
                  else
                    ...List.generate(_cart.length, (i) {
                      final item = _cart[i];
                      return ListTile(
                        leading: CircleAvatar(
                          backgroundColor: AppTheme.primarySoft,
                          child: Text('${item.quantity}',
                            style: const TextStyle(fontWeight: FontWeight.w700, color: AppTheme.primary, fontSize: 14)),
                        ),
                        title: Text(item.product.name,
                          style: TextStyle(
                            fontWeight: FontWeight.w600,
                            color: isDark ? const Color(0xFFF8FAFC) : const Color(0xFF0F172A))),
                        subtitle: Text('\$${item.product.price.toStringAsFixed(0)} c/u',
                          style: TextStyle(color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B))),
                        trailing: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text('\$${(item.product.price * item.quantity).toStringAsFixed(0)}',
                              style: TextStyle(fontWeight: FontWeight.w700,
                                color: isDark ? const Color(0xFFF8FAFC) : const Color(0xFF0F172A))),
                            const SizedBox(width: 8),
                            IconButton(
                              icon: const Icon(Icons.remove_circle_outline, color: Colors.red, size: 20),
                              onPressed: () {
                                setState(() => _cart.removeAt(i));
                                setSheetState(() {});
                              },
                            ),
                          ],
                        ),
                      );
                    }),
                  const Divider(),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Total',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700,
                          color: isDark ? const Color(0xFFF8FAFC) : const Color(0xFF0F172A))),
                      Text('\$${_total.toStringAsFixed(0)}',
                        style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: AppTheme.primary)),
                    ],
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: _cart.isEmpty ? null : () {
                        Navigator.pop(context);
                        _showPaymentDialog(context);
                      },
                      icon: const Icon(Icons.payment),
                      label: const Text('Cobrar'),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  void _showPaymentDialog(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    showDialog(
      context: context,
      builder: (_) {
        return AlertDialog(
          backgroundColor: isDark ? const Color(0xFF161F36) : Colors.white,
          title: Text('Cobrar', style: TextStyle(
            color: isDark ? const Color(0xFFF8FAFC) : const Color(0xFF0F172A))),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('Total a cobrar: \$${_total.toStringAsFixed(0)}',
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800,
                  color: isDark ? const Color(0xFFF8FAFC) : const Color(0xFF0F172A))),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.pop(context);
                    setState(() => _cart.clear());
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Venta completada')),
                    );
                  },
                  child: const Text('Efectivo'),
                ),
              ),
              const SizedBox(height: 8),
              SizedBox(
                width: double.infinity,
                child: OutlinedButton(
                  onPressed: () {
                    Navigator.pop(context);
                    setState(() => _cart.clear());
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Venta completada (tarjeta)')),
                    );
                  },
                  child: const Text('Tarjeta'),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _CartItem {
  final Product product;
  int quantity;
  _CartItem(this.product, this.quantity);
}
