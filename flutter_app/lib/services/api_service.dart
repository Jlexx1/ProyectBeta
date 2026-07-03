import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../models/product.dart';

class ApiService {
  static const String _base = 'http://localhost:3000/api';
  static const String _key = 'auth_token';

  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_key);
  }

  static Future<void> saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_key, token);
  }

  static Future<void> clearToken() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_key);
  }

  static Future<Map<String, dynamic>> login(String email, String password) async {
    final res = await http.post(
      Uri.parse('$_base/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );
    return jsonDecode(res.body);
  }

  static Future<Map<String, dynamic>> register(Map<String, String> data) async {
    final res = await http.post(
      Uri.parse('$_base/registro'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(data),
    );
    return jsonDecode(res.body);
  }

  static Future<List<Product>> getProducts() async {
    final token = await getToken();
    final res = await http.get(
      Uri.parse('$_base/products'),
      headers: {'Authorization': token ?? ''},
    );
    final list = jsonDecode(res.body) as List;
    return list.map((e) => Product.fromJson(e)).toList();
  }

  static Future<Map<String, dynamic>> createProduct(Map<String, dynamic> data) async {
    final token = await getToken();
    final res = await http.post(
      Uri.parse('$_base/products'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ?? '',
      },
      body: jsonEncode(data),
    );
    return jsonDecode(res.body);
  }

  static Future<void> deleteProduct(int id) async {
    final token = await getToken();
    await http.delete(
      Uri.parse('$_base/products/$id'),
      headers: {'Authorization': token ?? ''},
    );
  }

  static Future<Map<String, dynamic>> getData() async {
    final token = await getToken();
    final res = await http.get(
      Uri.parse('$_base/data'),
      headers: {'Authorization': token ?? ''},
    );
    return jsonDecode(res.body);
  }
}
