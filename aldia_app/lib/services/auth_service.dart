import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:path_provider/path_provider.dart';
import '../models/user.dart';
import 'api_service.dart';

class AuthService extends ChangeNotifier {
  final ApiService _api;
  User? _user;
  String? _token;
  bool _loading = false;

  AuthService(this._api);

  User? get user => _user;
  String? get token => _token;
  bool get loading => _loading;
  bool get isLoggedIn => _token != null;

  Future<File> get _file async {
    final dir = await getApplicationDocumentsDirectory();
    return File('${dir.path}/aldia_auth.json');
  }

  Future<void> _save() async {
    final file = await _file;
    await file.writeAsString(jsonEncode({'token': _token}));
  }

  Future<void> init() async {
    try {
      final file = await _file;
      if (await file.exists()) {
        final data = jsonDecode(await file.readAsString()) as Map<String, dynamic>;
        _token = data['token'] as String?;
        if (_token != null) {
          _api.setToken(_token);
        }
      }
    } catch (_) {}
  }

  Future<void> login(String email, String password) async {
    _loading = true;
    notifyListeners();
    try {
      final data = await _api.login(email, password);
      _token = data['token'] as String;
      _user = User.fromJson(data['user'] as Map<String, dynamic>);
      _api.setToken(_token);
      await _save();
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<void> register({
    required String nombreNegocio,
    required String email,
    required String password,
    required String passwordConfirmation,
    required String subdominio,
  }) async {
    _loading = true;
    notifyListeners();
    try {
      await _api.register(
        nombreNegocio: nombreNegocio,
        email: email,
        password: password,
        passwordConfirmation: passwordConfirmation,
        subdominio: subdominio,
      );
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<void> logout() async {
    _token = null;
    _user = null;
    _api.setToken(null);
    try {
      final file = await _file;
      if (await file.exists()) await file.delete();
    } catch (_) {}
    notifyListeners();
  }
}
