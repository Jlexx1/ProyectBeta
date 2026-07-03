import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/product.dart';
import '../services/api_service.dart';
import '../services/auth_service.dart';

class ProductsScreen extends StatefulWidget {
  const ProductsScreen({super.key});

  @override
  State<ProductsScreen> createState() => _ProductsScreenState();
}

class _ProductsScreenState extends State<ProductsScreen> {
  List<Product> _products = [];
  bool _loading = true;
  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _priceCtrl = TextEditingController();
  final _stockCtrl = TextEditingController();
  final _categoryCtrl = TextEditingController();
  final _descCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _priceCtrl.dispose();
    _stockCtrl.dispose();
    _categoryCtrl.dispose();
    _descCtrl.dispose();
    super.dispose();
  }

  ApiService _api() {
    final api = ApiService();
    api.setToken(context.read<AuthService>().token);
    return api;
  }

  Future<void> _load() async {
    try {
      final products = await _api().getProducts();
      setState(() {
        _products = products;
        _loading = false;
      });
    } catch (_) {
      setState(() => _loading = false);
    }
  }

  Future<void> _addProduct() async {
    if (!_formKey.currentState!.validate()) return;
    try {
      await _api().addProduct({
        'name': _nameCtrl.text.trim(),
        'price': double.parse(_priceCtrl.text.trim()),
        'stock': int.tryParse(_stockCtrl.text.trim()) ?? 0,
        'category': _categoryCtrl.text.trim(),
        'description': _descCtrl.text.trim(),
      });
      _nameCtrl.clear();
      _priceCtrl.clear();
      _stockCtrl.clear();
      _categoryCtrl.clear();
      _descCtrl.clear();
      await _load();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e')),
      );
    }
  }

  Future<void> _deleteProduct(int id) async {
    try {
      await _api().deleteProduct(id);
      await _load();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(title: const Text('Productos')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Form(
                      key: _formKey,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Agregar producto',
                            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700,
                              color: isDark ? const Color(0xFFF8FAFC) : const Color(0xFF0F172A))),
                          const SizedBox(height: 16),
                          TextFormField(
                            controller: _nameCtrl,
                            decoration: const InputDecoration(labelText: 'Nombre', hintText: 'Ej: Asado x 1.5kg'),
                            validator: (v) => v == null || v.trim().isEmpty ? 'Requerido' : null,
                          ),
                          const SizedBox(height: 12),
                          Row(
                            children: [
                              Expanded(
                                child: TextFormField(
                                  controller: _priceCtrl,
                                  decoration: const InputDecoration(labelText: 'Precio'),
                                  keyboardType: TextInputType.number,
                                  validator: (v) {
                                    if (v == null || v.trim().isEmpty) return 'Requerido';
                                    if (double.tryParse(v) == null) return 'Número inválido';
                                    return null;
                                  },
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: TextFormField(
                                  controller: _stockCtrl,
                                  decoration: const InputDecoration(labelText: 'Stock'),
                                  keyboardType: TextInputType.number,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          TextFormField(
                            controller: _categoryCtrl,
                            decoration: const InputDecoration(labelText: 'Categoría', hintText: 'Ej: Carnicería'),
                          ),
                          const SizedBox(height: 12),
                          TextFormField(
                            controller: _descCtrl,
                            decoration: const InputDecoration(labelText: 'Descripción'),
                            maxLines: 2,
                          ),
                          const SizedBox(height: 16),
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton(
                              onPressed: _addProduct,
                              child: const Text('Guardar producto'),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                if (_products.isEmpty)
                  Padding(
                    padding: const EdgeInsets.all(32),
                    child: Center(
                      child: Text('No hay productos todavía',
                        style: TextStyle(color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B))),
                    ),
                  )
                else
                  ..._products.map((p) => Card(
                    margin: const EdgeInsets.only(bottom: 8),
                    child: ListTile(
                      title: Text(p.name,
                        style: TextStyle(fontWeight: FontWeight.w600,
                          color: isDark ? const Color(0xFFF8FAFC) : const Color(0xFF0F172A))),
                      subtitle: Text('${p.category.isNotEmpty ? '${p.category} · ' : ''}\$${p.price.toStringAsFixed(0)} · Stock: ${p.stock}',
                        style: TextStyle(fontSize: 13,
                          color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B))),
                      trailing: IconButton(
                        icon: const Icon(Icons.delete_outline, color: Colors.red, size: 20),
                        onPressed: () => _deleteProduct(p.id),
                      ),
                    ),
                  )),
              ],
            ),
    );
  }
}
