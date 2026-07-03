import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/constants.dart';
import '../models/product.dart';

class ApiService {
  final String _baseUrl = AppConstants.apiUrl;
  String? _token;

  void setToken(String? token) {
    _token = token;
  }

  Map<String, String> get _headers {
    final h = <String, String>{'Content-Type': 'application/json'};
    if (_token != null) {
      h['Authorization'] = _token!;
    }
    return h;
  }

  Future<Map<String, dynamic>> login(String email, String password) async {
    final res = await http.post(
      Uri.parse('$_baseUrl/api/login'),
      headers: _headers,
      body: jsonEncode({'email': email, 'password': password}),
    );
    final body = jsonDecode(res.body) as Map<String, dynamic>;
    if (res.statusCode != 200) {
      throw Exception(body['message'] ?? 'Error al iniciar sesión');
    }
    _token = body['token'] as String?;
    return body;
  }

  Future<void> register({
    required String nombreNegocio,
    required String email,
    required String password,
    required String passwordConfirmation,
    required String subdominio,
  }) async {
    final res = await http.post(
      Uri.parse('$_baseUrl/api/registro'),
      headers: _headers,
      body: jsonEncode({
        'nombre_negocio': nombreNegocio,
        'email': email,
        'password': password,
        'password_confirmation': passwordConfirmation,
        'subdominio': subdominio,
      }),
    );
    final body = jsonDecode(res.body) as Map<String, dynamic>;
    if (res.statusCode != 201) {
      throw Exception(body['message'] ?? 'Error al registrarse');
    }
  }

  Future<Map<String, dynamic>> checkSubdomain(String subdominio) async {
    final res = await http.get(
      Uri.parse('$_baseUrl/api/check-subdominio?subdominio=$subdominio'),
      headers: _headers,
    );
    return jsonDecode(res.body) as Map<String, dynamic>;
  }

  Future<List<Product>> getProducts() async {
    final res = await http.get(
      Uri.parse('$_baseUrl/api/products'),
      headers: _headers,
    );
    if (res.statusCode != 200) {
      throw Exception('Error al obtener productos');
    }
    final list = jsonDecode(res.body) as List;
    return list.map((e) => Product.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<Product> addProduct(Map<String, dynamic> data) async {
    final res = await http.post(
      Uri.parse('$_baseUrl/api/products'),
      headers: _headers,
      body: jsonEncode(data),
    );
    if (res.statusCode != 201) {
      throw Exception('Error al crear producto');
    }
    return Product.fromJson(jsonDecode(res.body) as Map<String, dynamic>);
  }

  Future<void> deleteProduct(int id) async {
    final res = await http.delete(
      Uri.parse('$_baseUrl/api/products/$id'),
      headers: _headers,
    );
    if (res.statusCode != 200) {
      throw Exception('Error al eliminar producto');
    }
  }

  Future<Map<String, dynamic>> getData() async {
    final res = await http.get(
      Uri.parse('$_baseUrl/api/data'),
      headers: _headers,
    );
    if (res.statusCode != 200) {
      throw Exception('Error al obtener datos');
    }
    return jsonDecode(res.body) as Map<String, dynamic>;
  }
}
