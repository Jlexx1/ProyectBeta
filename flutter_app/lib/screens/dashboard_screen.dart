import 'package:flutter/material.dart';
import '../models/product.dart';
import '../services/api_service.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  List<Product> _products = [];
  bool _loading = true;
  bool _adding = false;

  final _nameCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  final _priceCtrl = TextEditingController();
  final _stockCtrl = TextEditingController();
  final _catCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadProducts();
  }

  Future<void> _loadProducts() async {
    setState(() => _loading = true);
    try {
      _products = await ApiService.getProducts();
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  Future<void> _addProduct() async {
    setState(() => _adding = true);
    try {
      await ApiService.createProduct({
        'name': _nameCtrl.text,
        'description': _descCtrl.text,
        'price': double.tryParse(_priceCtrl.text) ?? 0,
        'stock': int.tryParse(_stockCtrl.text) ?? 0,
        'category': _catCtrl.text,
      });
      _nameCtrl.clear(); _descCtrl.clear(); _priceCtrl.clear();
      _stockCtrl.clear(); _catCtrl.clear();
      await _loadProducts();
    } catch (_) {}
    if (mounted) setState(() => _adding = false);
  }

  Future<void> _deleteProduct(int id) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Eliminar producto'),
        content: const Text('Esta seguro de eliminar este producto?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancelar')),
          FilledButton(onPressed: () => Navigator.pop(context, true), child: const Text('Eliminar')),
        ],
      ),
    );
    if (ok == true) {
      await ApiService.deleteProduct(id);
      await _loadProducts();
    }
  }

  Future<void> _logout() async {
    await ApiService.clearToken();
    if (mounted) Navigator.pushReplacementNamed(context, '/login');
  }

  @override
  void dispose() {
    _nameCtrl.dispose(); _descCtrl.dispose(); _priceCtrl.dispose();
    _stockCtrl.dispose(); _catCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('ALDIA - Productos'),
        actions: [
          IconButton(icon: const Icon(Icons.storage), onPressed: () => Navigator.pushNamed(context, '/data')),
          IconButton(icon: const Icon(Icons.logout), onPressed: _logout),
        ],
      ),
      body: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            color: Colors.grey[50],
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text('Agregar producto', style: Theme.of(context).textTheme.titleSmall),
                const SizedBox(height: 8),
                TextField(controller: _nameCtrl, decoration: const InputDecoration(labelText: 'Nombre', isDense: true, border: OutlineInputBorder()), style: const TextStyle(fontSize: 14)),
                const SizedBox(height: 8),
                TextField(controller: _descCtrl, decoration: const InputDecoration(labelText: 'Descripcion', isDense: true, border: OutlineInputBorder()), style: const TextStyle(fontSize: 14)),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Expanded(child: TextField(controller: _priceCtrl, decoration: const InputDecoration(labelText: 'Precio', isDense: true, border: OutlineInputBorder()), keyboardType: TextInputType.number, style: const TextStyle(fontSize: 14))),
                    const SizedBox(width: 8),
                    Expanded(child: TextField(controller: _stockCtrl, decoration: const InputDecoration(labelText: 'Stock', isDense: true, border: OutlineInputBorder()), keyboardType: TextInputType.number, style: const TextStyle(fontSize: 14))),
                    const SizedBox(width: 8),
                    Expanded(child: TextField(controller: _catCtrl, decoration: const InputDecoration(labelText: 'Categoria', isDense: true, border: OutlineInputBorder()), style: const TextStyle(fontSize: 14))),
                  ],
                ),
                const SizedBox(height: 8),
                FilledButton.icon(
                  onPressed: _adding ? null : _addProduct,
                  icon: _adding ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) : const Icon(Icons.add, size: 18),
                  label: const Text('Agregar producto'),
                ),
              ],
            ),
          ),
          Expanded(
            child: _loading
              ? const Center(child: CircularProgressIndicator())
              : _products.isEmpty
                ? Center(
                    child: Text('Todavia no tenes productos.', style: TextStyle(color: Colors.grey[500])),
                  )
                : RefreshIndicator(
                    onRefresh: _loadProducts,
                    child: ListView.builder(
                      padding: const EdgeInsets.all(8),
                      itemCount: _products.length,
                      itemBuilder: (_, i) {
                        final p = _products[i];
                        return Card(
                          child: ListTile(
                            title: Text(p.name, style: const TextStyle(fontWeight: FontWeight.w600)),
                            subtitle: Text('${p.description}\n\$${p.price.toStringAsFixed(2)} | Stock: ${p.stock}${p.category.isNotEmpty ? ' | ${p.category}' : ''}'),
                            trailing: IconButton(
                              icon: const Icon(Icons.delete_outline, color: Colors.red),
                              onPressed: () => _deleteProduct(p.id),
                            ),
                          ),
                        );
                      },
                    ),
                  ),
          ),
        ],
      ),
    );
  }
}
