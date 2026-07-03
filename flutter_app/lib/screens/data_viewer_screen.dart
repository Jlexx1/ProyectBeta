import 'package:flutter/material.dart';
import '../services/api_service.dart';

class DataViewerScreen extends StatefulWidget {
  const DataViewerScreen({super.key});

  @override
  State<DataViewerScreen> createState() => _DataViewerScreenState();
}

class _DataViewerScreenState extends State<DataViewerScreen> {
  Map<String, dynamic>? _data;
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() { _loading = true; _error = null; });
    try {
      _data = await ApiService.getData();
    } catch (e) {
      _error = 'Error al cargar datos: $e';
    }
    if (mounted) setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Base de Datos ALDIA')),
      body: _loading
        ? const Center(child: CircularProgressIndicator())
        : _error != null
          ? Center(child: Text(_error!, style: const TextStyle(color: Colors.red)))
          : RefreshIndicator(
              onRefresh: _loadData,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  Text('Usuarios', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
                  const SizedBox(height: 8),
                    _buildTable(
                    columns: ['ID', 'Nombre', 'Email', 'Subdominio', 'Rol', 'Creado'],
                    rows: (_data!['users'] as List).map<List<String>>((u) => [
                      '${u['id']}', u['nombre_negocio'] ?? '', u['email'] ?? '',
                      u['subdominio'] ?? '', u['role'] ?? '', u['created_at'] ?? '',
                    ]).toList(),
                  ),
                  const SizedBox(height: 24),
                  Text('Productos', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
                  const SizedBox(height: 8),
                  _buildTable(
                    columns: ['ID', 'Nombre', 'Precio', 'Stock', 'Categoria'],
                    rows: (_data!['products'] as List).map<List<String>>((p) => [
                      '${p['id']}', p['name'] ?? '',
                      '\$${(p['price'] ?? 0).toDouble().toStringAsFixed(2)}',
                      '${p['stock'] ?? 0}', p['category'] ?? '-',
                    ]).toList(),
                  ),
                ],
              ),
            ),
    );
  }

  Widget _buildTable({required List<String> columns, required List<List<String>> rows}) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: DataTable(
        columns: columns.map((c) => DataColumn(label: Text(c, style: const TextStyle(fontWeight: FontWeight.w600)))).toList(),
        rows: rows.map((r) => DataRow(cells: r.map((c) => DataCell(Text(c))).toList())).toList(),
      ),
    );
  }
}
